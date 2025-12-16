import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  getWithdrawSummary,
  listMyWithdrawals,
  createWithdrawalRequest,
} from "./withdrawal.controller";

const router = Router();

router.get("/summary", requireAuth, getWithdrawSummary);
router.get("/my", requireAuth, listMyWithdrawals);
router.post("/", requireAuth, createWithdrawalRequest);

export default router;
