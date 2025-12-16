import { Router } from 'express';
import { requireAuth, requireAdmin } from '../../middleware/auth';
import {
  myReferralSummary,
  leaderboard,
  updateCommissionSettings,
} from './referrals.controller';

export const referralsRouter = Router();

referralsRouter.get('/summary', requireAuth, myReferralSummary);
referralsRouter.get('/leaderboard', leaderboard);
referralsRouter.put(
  '/settings',
  requireAuth,
  requireAdmin,
  updateCommissionSettings
);
