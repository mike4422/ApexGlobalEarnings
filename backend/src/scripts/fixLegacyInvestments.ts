import { prisma } from "../config/prisma";

async function run() {
  const now = new Date();

  const legacyInvestments = await prisma.investment.findMany({
    where: {
      status: "ACTIVE",
      endDate: null,
    },
    include: {
      plan: true,
    },
  });

  console.log(`Found ${legacyInvestments.length} legacy investments`);

  for (const inv of legacyInvestments) {
    if (!inv.plan?.durationDays) continue;

    // Infer endDate from createdAt + plan duration
    const inferredEndDate = new Date(
      inv.startDate.getTime() +
        inv.plan.durationDays * 24 * 60 * 60 * 1000
    );

    const shouldBeCompleted = now >= inferredEndDate;

    if (!shouldBeCompleted) {
      // just backfill endDate for still-running ones
      await prisma.investment.update({
        where: { id: inv.id },
        data: { endDate: inferredEndDate },
      });
      continue;
    }

    console.log(`Completing investment ${inv.id}`);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: inv.userId },
        data: {
          balanceCents: {
            increment: inv.amountCents + inv.accruedReturnCents,
          },
        },
      }),
      prisma.investment.update({
        where: { id: inv.id },
        data: {
          status: "COMPLETED",
          endDate: inferredEndDate,
          lastRoiAccruedAt: now,
        },
      }),
    ]);
  }

  console.log("Legacy investment repair complete");
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
