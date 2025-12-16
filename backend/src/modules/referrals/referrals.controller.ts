import { Response, Request } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { prisma } from '../../config/prisma';

export async function myReferralSummary(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    include: {
      referrals: {
        select: { id: true, email: true, createdAt: true },
      },
      referralEarnings: true,
    },
  });

  if (!user) return res.status(404).json({ error: 'User not found' });

  const totalEarnings = user.referralEarnings.reduce(
    (sum, e) => sum + e.amountCents,
    0
  );

  return res.json({
    referralCode: user.referralCode,
    totalEarningsCents: totalEarnings,
    totalReferrals: user.referrals.length,
    earnings: user.referralEarnings,
    referrals: user.referrals,
  });
}

export async function leaderboard(req: Request, res: Response) {
  const rows = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      referralEarnings: true,
    },
  });

  const ranked = rows
    .map((u) => ({
      id: u.id,
      name: u.name ?? u.email,
      totalEarningsCents: u.referralEarnings.reduce(
        (sum, e) => sum + e.amountCents,
        0
      ),
    }))
    .sort((a, b) => b.totalEarningsCents - a.totalEarningsCents)
    .slice(0, 20);

  return res.json({ leaderboard: ranked });
}

export async function updateCommissionSettings(req: AuthRequest, res: Response) {
  const { level1Bps, level2Bps } = req.body;
  const settings = await prisma.settings.update({
    where: { id: 1 },
    data: { level1Bps, level2Bps },
  });
  return res.json({ settings });
}
