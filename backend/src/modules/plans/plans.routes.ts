import { Router } from "express";
import { listPlans } from "./plans.controller";
import { requireAuth } from "../../middleware/auth";

const router = Router();

// All plans visible to authenticated users
router.get("/", requireAuth, listPlans);

export default router;
