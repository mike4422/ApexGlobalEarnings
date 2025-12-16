import { Request, Response } from "express";
import { prisma } from "../../config/prisma";

// GET /api/plans
export async function listPlans(req: Request, res: Response) {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { minAmountCents: "asc" },
    });

    return res.json({ plans });
  } catch (err) {
    console.error("[PLANS] listPlans error:", err);
    return res.status(500).json({ error: "Unable to load plans" });
  }
}
