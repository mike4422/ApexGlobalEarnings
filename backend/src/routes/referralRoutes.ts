// backend/src/routes/referralRoutes.ts
import { Router } from "express";
import { prisma } from "../config/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * GET /api/referrals/overview
 * Returns referral code, totals, and list of referred users (scoped to auth user).
 */
router.get("/overview", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const me = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        referralCode: true,
      },
    });

    if (!me) return res.status(404).json({ error: "User not found" });

    const referredUsers = await prisma.user.findMany({
      where: { referredById: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        createdAt: true,
      },
      take: 500,
    });

    const referredIds = referredUsers.map((u) => u.id);

    // Per-referred deposit stats (completed deposits)
    const depositStats =
      referredIds.length === 0
        ? []
        : await prisma.transaction.groupBy({
            by: ["userId"],
            where: {
              userId: { in: referredIds },
              type: "DEPOSIT",
              status: "COMPLETED",
            },
            _sum: { amountCents: true },
            _count: { _all: true },
            _max: { createdAt: true },
          });

    const depositsByUserId = new Map<
      string,
      { totalDepositsCents: number; depositsCount: number; lastDepositAt: Date | null }
    >();

    for (const row of depositStats) {
      depositsByUserId.set(row.userId as string, {
        totalDepositsCents: row._sum.amountCents ?? 0,
        depositsCount: row._count._all ?? 0,
        lastDepositAt: (row._max.createdAt as Date) ?? null,
      });
    }

    // Referral commission total for the authenticated user
    const referralCommissionAgg = await prisma.transaction.aggregate({
      where: {
        userId,
        type: "REFERRAL_EARNING",
        status: "COMPLETED",
      },
      _sum: { amountCents: true },
    });

    const referralCommissionCents = referralCommissionAgg._sum.amountCents ?? 0;

    const referred = referredUsers.map((u) => {
      const stats = depositsByUserId.get(u.id);
      return {
        id: u.id,
        username: u.username,
        email: u.email,
        name: u.name,
        joinedAt: u.createdAt,
        totalDepositsCents: stats?.totalDepositsCents ?? 0,
        depositsCount: stats?.depositsCount ?? 0,
        lastDepositAt: stats?.lastDepositAt ?? null,
      };
    });

    const totalReferredDepositsCents = referred.reduce((sum, r) => sum + r.totalDepositsCents, 0);

    return res.json({
      me: {
        referralCode: me.referralCode,
      },
      stats: {
        referredCount: referredUsers.length,
        referralCommissionCents,
        totalReferredDepositsCents,
      },
      referredUsers: referred,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
