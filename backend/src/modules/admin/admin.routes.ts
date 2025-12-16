import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireAdmin } from "../../middleware/auth";
import {
  listDepositRequests,
  approveDepositRequest,
  rejectDepositRequest,
  getPlatformSettings,
  updatePlatformSettings,
  listWithdrawalRequests,
  approveWithdrawalRequest,
  rejectWithdrawalRequest,
  sendUserNotification,

  // ✅ NEW
  adminListUsers,
  adminUpdateUser,
  adminDeleteUser,
  adminAdjustUserBalance,
} from "./admin.controller";

const router = Router();

router.get("/deposits", requireAuth, requireAdmin, listDepositRequests);
router.post("/deposits/:id/approve", requireAuth, requireAdmin, approveDepositRequest);
router.post("/deposits/:id/reject", requireAuth, requireAdmin, rejectDepositRequest);

router.get("/settings", requireAuth, requireAdmin, getPlatformSettings);
router.put("/settings", requireAuth, requireAdmin, updatePlatformSettings);

router.get("/withdrawals", requireAuth, requireAdmin, listWithdrawalRequests);
router.post("/withdrawals/:id/approve", requireAuth, requireAdmin, approveWithdrawalRequest);
router.post("/withdrawals/:id/reject", requireAuth, requireAdmin, rejectWithdrawalRequest);

router.post("/notifications/send", requireAuth, requireAdmin, sendUserNotification);

// ✅ NEW: User management
router.get("/users", requireAuth, requireAdmin, adminListUsers);
router.put("/users/:id", requireAuth, requireAdmin, adminUpdateUser);
router.delete("/users/:id", requireAuth, requireAdmin, adminDeleteUser);
router.post("/users/:id/balance", requireAuth, requireAdmin, adminAdjustUserBalance);

export default router;
