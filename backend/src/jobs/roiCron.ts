// backend/src/jobs/roiCron.ts
import { prisma } from '../config/prisma';
import { sendMail } from '../utils/email';
import { env } from '../config/env';

export async function runDailyRoiAccrual() {
  const now = new Date();

  const active = await prisma.investment.findMany({
    where: { status: 'ACTIVE' },
    include: {
      plan: true,
      user: true,
    },
  });

  for (const inv of active) {

     // 🛡️ Safety guard (prevents double-processing in edge cases)
    if (inv.status === "COMPLETED") continue;

    const last = inv.lastRoiAccruedAt ?? inv.startDate;
    const days = Math.floor(
      (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (days <= 0) continue;

    const dailyRate = inv.plan.dailyRoiBps / 10000; // from basis points
    const dailyProfitCents = Math.round(inv.amountCents * dailyRate);
    const totalProfitCents = dailyProfitCents * days;

    // 🔹 Decide up-front if this run completes the investment
    const willComplete =
      inv.endDate ? now.getTime() >= inv.endDate.getTime() : false;

    await prisma.$transaction([
      prisma.investment.update({
        where: { id: inv.id },
        data: {
          accruedReturnCents: { increment: totalProfitCents },
          lastRoiAccruedAt: now,
          status: willComplete ? "COMPLETED" : "ACTIVE",
          endDate: willComplete ? inv.endDate : inv.endDate, // keep consistent
        },
      }),

     prisma.user.update({
      where: { id: inv.userId },
      data: {
        balanceCents: {
          increment: willComplete
            ? inv.amountCents + totalProfitCents // ✅ capital + profit
            : totalProfitCents,                 // daily accrual
        },
      },
    }),

      prisma.transaction.create({
        data: {
          userId: inv.userId,
          type: 'INVESTMENT_RETURN',
          asset: 'USDT',
          amountCents: totalProfitCents,
          status: 'COMPLETED',
          meta: { investmentId: inv.id, days },
        },
      }),
    ]);

    // Referral earnings (level 1 & 2)
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings) continue;

    const user = inv.user;
    const level1 = await prisma.user.findUnique({
      where: { id: user.referredById ?? '' },
    });

    if (level1) {
      const amount = Math.round(
        (totalProfitCents * settings.level1Bps) / 10000
      );
      await prisma.$transaction([
        prisma.user.update({
          where: { id: level1.id },
          data: { balanceCents: { increment: amount } },
        }),
        prisma.referralEarning.create({
          data: {
            earnerId: level1.id,
            fromUserId: user.id,
            level: 1,
            amountCents: amount,
            sourceInvestmentId: inv.id,
          },
        }),
        prisma.transaction.create({
          data: {
            userId: level1.id,
            type: 'REFERRAL_EARNING',
            asset: 'USDT',
            amountCents: amount,
            status: 'COMPLETED',
          },
        }),
      ]);
    }

    if (level1?.referredById) {
      const level2User = await prisma.user.findUnique({
        where: { id: level1.referredById },
      });
      if (level2User) {
        const amount2 = Math.round(
          (totalProfitCents * settings.level2Bps) / 10000
        );
        await prisma.$transaction([
          prisma.user.update({
            where: { id: level2User.id },
            data: { balanceCents: { increment: amount2 } },
          }),
          prisma.referralEarning.create({
            data: {
              earnerId: level2User.id,
              fromUserId: user.id,
              level: 2,
              amountCents: amount2,
              sourceInvestmentId: inv.id,
            },
          }),
          prisma.transaction.create({
            data: {
              userId: level2User.id,
              type: 'REFERRAL_EARNING',
              asset: 'USDT',
              amountCents: amount2,
              status: 'COMPLETED',
            },
          }),
        ]);
      }
    }

    // 🔔 If this run completed the investment, send the "investment completed" email
    if (willComplete) {
      const finalProfitCents =
        (inv.accruedReturnCents ?? 0) + totalProfitCents;
      const amountUsd = inv.amountCents / 100;
      const profitUsd = finalProfitCents / 100;
      const withdrawUrl = `${env.CLIENT_URL}/dashboard/withdraw`;

      try {
        await sendMail({
          to: inv.user.email,
          subject: "Your ApexGlobalEarnings investment is complete",
          html: `
            <p>Hi ${inv.user.name || inv.user.username || "Investor"},</p>
            <p>Your investment of <strong>$${amountUsd.toLocaleString()}</strong> in the <strong>${inv.plan.name}</strong> plan has been completed.</p>
            <p>Profit realised: <strong>$${profitUsd.toLocaleString()}</strong>.</p>
            <p>You can now withdraw your profit while your capital continues to be used for ongoing trading strategies.</p>
            <p>
              <a href="${withdrawUrl}"
                 style="display:inline-block;padding:10px 18px;background:#facc15;color:#000;
                        text-decoration:none;border-radius:6px;font-weight:600;">
                Withdraw profit
              </a>
            </p>
            <p>— ApexGlobalEarnings Investments</p>
          `,
        });
      } catch (err) {
        // ✅ Never break the cron if email fails
        console.error("Failed to send investment completion email", err);
      }
    }
  }
}
