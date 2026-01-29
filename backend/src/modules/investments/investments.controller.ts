import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth";
import { env } from "../../config/env";
import { sendMail } from "../../utils/email";


// POST /api/investments
export async function createInvestment(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { planSlug, amountUsd } = req.body;

    if (!planSlug || !amountUsd) {
      return res
        .status(400)
        .json({ error: "planSlug and amountUsd are required" });
    }

    // ✅ FIX: normalize + case-insensitive lookup + inactive detection
    const rawPlanSlug =
      typeof planSlug === "string"
        ? planSlug.trim()
        : String(planSlug ?? "").trim();

    if (!rawPlanSlug) {
      return res
        .status(400)
        .json({ error: "planSlug and amountUsd are required" });
    }

    // ✅ NEW: build safe slug variants so "standard" can match "standard-plan", etc.
    const lower = rawPlanSlug.toLowerCase();
    const normalized = lower
      .replace(/_/g, "-")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const candidates = Array.from(
      new Set([
        rawPlanSlug, // as-is (for name match too)
        normalized,
        normalized.replace(/-plan$/, ""),
        `${normalized}-plan`,
      ])
    );

    const plan = await prisma.plan.findFirst({
      where: {
        isActive: true,
        OR: [
          // slug matches any candidate
          ...candidates.map((c) => ({
            slug: { equals: c, mode: "insensitive" as const },
          })),
          // name matches raw input (e.g. "Standard Plan")
          { name: { equals: rawPlanSlug, mode: "insensitive" as const } },
        ],
      },
    });

    if (!plan) {
      const maybeInactive = await prisma.plan.findFirst({
        where: {
          OR: [
            ...candidates.map((c) => ({
              slug: { equals: c, mode: "insensitive" as const },
            })),
            { name: { equals: rawPlanSlug, mode: "insensitive" as const } },
          ],
        },
        select: { id: true, slug: true, name: true, isActive: true },
      });

      if (maybeInactive && maybeInactive.isActive === false) {
        return res.status(400).json({
          error:
            "This plan is currently unavailable. Please select another plan.",
          code: "PLAN_INACTIVE",
        });
      }

      return res.status(404).json({ error: "Plan not found" });
    }

    const amountCents = Math.round(Number(amountUsd) * 100);

    if (
      typeof plan.minAmountCents === "number" &&
      amountCents < plan.minAmountCents
    ) {
      return res.status(400).json({
        error: `Minimum for this plan is $${(
          plan.minAmountCents / 100
        ).toLocaleString()}.`,
        code: "AMOUNT_BELOW_MINIMUM",
      });
    }

    if (
      typeof plan.maxAmountCents === "number" &&
      amountCents > plan.maxAmountCents
    ) {
      return res.status(400).json({
        error: `Maximum for this plan is $${(
          plan.maxAmountCents / 100
        ).toLocaleString()}.`,
        code: "AMOUNT_ABOVE_MAXIMUM",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.balanceCents < amountCents) {
      return res.status(400).json({
        error:
          "Insufficient balance for this plan. Please deposit funds or choose a lower plan.",
        code: "INSUFFICIENT_BALANCE",
      });
    }

    // only one lifetime investment per plan
    const priorInvestment = await prisma.investment.findFirst({
      where: {
        userId: user.id,
        planId: plan.id,
        status: {
          in: ["ACTIVE", "COMPLETED"],
        },
      },
    });

    if (priorInvestment) {
      return res.status(400).json({
        error:
          "You have already completed this plan. To increase your allocation, please upgrade to the next plan tier.",
        code: "PLAN_UPGRADE_REQUIRED",
      });
    }

    // Atomic: deduct balance and create investment
    const investment = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          balanceCents: { decrement: amountCents },
        },
      });

      const endDate =
      plan.durationDays
        ? new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000)
        : null;

      const created = await tx.investment.create({
        data: {
          userId: user.id,
          planId: plan.id,
          amountCents,
          status: "ACTIVE",
          endDate,
        },
        include: {
          plan: {
            select: {
              id: true,
              name: true,
              slug: true,
              dailyRoiBps: true,
              durationDays: true,
            },
          },
        },
      });

      return created;
    });

    // 📧 Send "investment started" email (non-blocking)
    (async () => {
      try {
        // ✅ FIX: bps conversions
        const dailyRoiFraction = (plan.dailyRoiBps ?? 0) / 10000; // for multiplication
        const dailyRoiPercent = (plan.dailyRoiBps ?? 0) / 100;   // for display (5.00%)

        const profitTargetUsd =
          (amountCents / 100) * dailyRoiFraction * (plan.durationDays ?? 0);

        await sendMail({
          to: user.email,
          subject: "Your ApexGlobalEarnings investment has started",
          html: `
            <p>Hi ${user.name || user.username || "Investor"},</p>
            <p>Your investment of <strong>$${(
              amountCents / 100
            ).toLocaleString()}</strong> has been started in the <strong>${
            plan.name
          }</strong> plan.</p>
            <p>Plan details:</p>
            <ul>
              <li>Daily return: <strong>${dailyRoiPercent}%</strong></li>
              <li>Duration: <strong>${plan.durationDays ?? 0} days</strong></li>
              <li>Projected profit (estimate): <strong>$${profitTargetUsd.toLocaleString()}</strong></li>
            </ul>
            <p>You can monitor this investment live from your dashboard.</p>
            <p>— ApexGlobalEarnings Investments</p>
          `,
        });
      } catch (err) {
        console.error("Failed to send investment-start email", err);
      }
    })();

    return res.status(201).json({ investment });
  } catch (err) {
    console.error("[INVESTMENTS] createInvestment error:", err);
    return res.status(500).json({ error: "Unable to create investment" });
  }
}



// GET /api/investments/my
export async function getMyInvestments(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const investments = await prisma.investment.findMany({
      where: { userId: req.user.id },
      orderBy: { startDate: "desc" },
      include: {
        plan: {
          select: {
            id: true,
            name: true,
            slug: true,
            dailyRoiBps: true,
            durationDays: true,
          },
        },
      },
    });

    return res.json({ investments });
  } catch (err) {
    console.error("[INVESTMENTS] getMyInvestments error:", err);
    return res
      .status(500)
      .json({ error: "Unable to load investments" });
  }
}
