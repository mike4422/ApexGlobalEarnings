// backend/src/routes/dashboardRoutes.ts
import { Router } from "express";
import { prisma } from "../config/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * GET /api/dashboard/summary
 * Summary numbers for the authenticated user.
 */
router.get(
  "/summary",
  requireAuth,
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.id;

      const now = new Date();
      const from = new Date();
      from.setDate(now.getDate() - 13); // last 14 days (inclusive)

      const [
        user,
        activeInvestmentsAgg,
        pendingWithdrawalsAgg,
        depositsAgg,
        withdrawalsAgg,
        investmentReturnsAgg,
        referralTxAgg,
        referralEarningAgg,
        recentTransactions,
      ] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { balanceCents: true },
        }),

        prisma.investment.aggregate({
          where: { userId, status: "ACTIVE" },
          _sum: { amountCents: true },
          _count: { id: true },
        }),

        prisma.withdrawal.aggregate({
          where: { userId, status: "PENDING" },
          _sum: { amountCents: true },
          _count: { id: true },
        }),

        prisma.transaction.aggregate({
          where: { userId, type: "DEPOSIT", status: "COMPLETED" },
          _sum: { amountCents: true },
        }),

        // ✅ FIX: withdrawals are stored in prisma.withdrawal (approved withdrawals)
        prisma.withdrawal.aggregate({
          where: { userId, status: "APPROVED" as any },
          _sum: { amountCents: true },
        }),

        prisma.transaction.aggregate({
          where: {
            userId,
            type: "INVESTMENT_RETURN",
            status: "COMPLETED",
          },
          _sum: { amountCents: true },
        }),

        prisma.transaction.aggregate({
          where: {
            userId,
            type: "REFERRAL_EARNING",
            status: "COMPLETED",
          },
          _sum: { amountCents: true },
        }),

        prisma.referralEarning.findMany({
          where: { earnerId: userId },
          select: {
            amountCents: true,
          },
        }),

        prisma.transaction.findMany({
          where: {
            userId,
            createdAt: { gte: from },
            status: "COMPLETED",
          },
          select: {
            createdAt: true,
            amountCents: true,
            type: true,
          },
          orderBy: { createdAt: "asc" },
        }),
      ]);

      const balanceCents = user?.balanceCents ?? 0;

      const activeInvestmentsCount = activeInvestmentsAgg._count.id || 0;
      const activeInvestmentsCents =
        activeInvestmentsAgg._sum.amountCents || 0;

      const pendingWithdrawalsCount =
        pendingWithdrawalsAgg._count.id || 0;
      const pendingWithdrawalsCents =
        pendingWithdrawalsAgg._sum.amountCents || 0;

      const totalDepositsCents = depositsAgg._sum.amountCents || 0;
      const totalWithdrawalsCents =
        withdrawalsAgg._sum.amountCents || 0;

      const investmentReturnCents =
        investmentReturnsAgg._sum.amountCents || 0;
      const referralEarningFromTxCents =
        referralTxAgg._sum.amountCents || 0;

      const referralCommissionCents =
        (referralEarningAgg || []).reduce(
          (sum, r) => sum + r.amountCents,
          0
        ) || referralEarningFromTxCents;

      const totalEarningsCents =
        investmentReturnCents + referralEarningFromTxCents;

      // For now treat "active deposits" as total completed deposits
      const activeDepositsCents = totalDepositsCents;

      // Build 14-day performance series from transactions
      const dayMap: Record<string, number> = {};

      for (const tx of recentTransactions) {
        const d = new Date(tx.createdAt);
        const key = d.toISOString().slice(0, 10); // YYYY-MM-DD

        let sign = 1;
        if (tx.type === "WITHDRAWAL") {
          sign = -1;
        }

        const prev = dayMap[key] || 0;
        dayMap[key] = prev + sign * tx.amountCents;
      }

      const performance: { date: string; netChangeCents: number }[] = [];
      const cursor = new Date(from);

      while (cursor <= now) {
        const key = cursor.toISOString().slice(0, 10);
        performance.push({
          date: key,
          netChangeCents: dayMap[key] || 0,
        });
        cursor.setDate(cursor.getDate() + 1);
      }

      res.json({
        balanceCents,
        activeInvestmentsCount,
        activeInvestmentsCents,
        activeDepositsCents,
        pendingWithdrawalsCount,
        pendingWithdrawalsCents,
        totalDepositsCents,
        totalWithdrawalsCents,
        totalEarningsCents,
        referralCommissionCents,
        performance,
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/dashboard/overview
 * High-level overview used by the main dashboard screen.
 */
router.get(
  "/overview",
  requireAuth,
  async (req: AuthRequest, res, next) => {
    try {
      const userId = req.user!.id;

      const [user, investments, withdrawals] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            balanceCents: true,
            createdAt: true,
            emailVerifiedAt: true,
          },
        }),
        prisma.investment.findMany({
          where: { userId },
          include: { plan: true },
          orderBy: { startDate: "desc" },
        }),
        prisma.withdrawal.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const activeInvestments = investments.filter(
        (inv) => inv.status === "ACTIVE"
      );
      const pendingWithdrawals = withdrawals.filter(
        (w) => w.status === "PENDING"
      );

      return res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          balance: user.balanceCents / 100,
          createdAt: user.createdAt,
          emailVerifiedAt: user.emailVerifiedAt,
        },
        kpis: {
          totalBalance: user.balanceCents / 100,
          activeInvestments: activeInvestments.length,
          pendingWithdrawals: pendingWithdrawals.length,
        },
        investments: investments.map((inv) => ({
          id: inv.id,
          planName: inv.plan.name,
          planSlug: inv.plan.slug,
          amount: inv.amountCents / 100,
          status: inv.status,
          startDate: inv.startDate,
          endDate: inv.endDate,
          accruedReturn: inv.accruedReturnCents / 100,
        })),
        withdrawals: withdrawals.map((w) => ({
          id: w.id,
          amount: w.amountCents / 100,
          status: w.status,
          createdAt: w.createdAt,
        })),
      });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
