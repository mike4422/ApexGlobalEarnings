import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  createInvestment,
  getMyInvestments,
} from "./investments.controller";

const router = Router();

// List current user's investments
router.get("/my", requireAuth, getMyInvestments);

// Create a new investment
router.post("/", requireAuth, createInvestment);

export default router;
