// backend/src/routes/securityRoutes.ts
import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * GET /api/security/sessions
 * List active sessions for authenticated user.
 */
router.get("/sessions", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        jwtId: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return res.json({
      sessions: sessions.map((s) => ({
        id: s.id,
        jwtId: s.jwtId,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
      })),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/security/logout-all
 * Deletes all sessions for the user (invalidates tokens if your auth middleware checks Session.jwtId).
 */
router.post("/logout-all", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    await prisma.session.deleteMany({ where: { userId } });

    return res.json({ message: "All sessions have been logged out." });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/security/change-password
 * Body: { currentPassword, newPassword, logoutAll?: boolean }
 */
router.post("/change-password", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword, logoutAll } = req.body as {
      currentPassword?: string;
      newPassword?: string;
      logoutAll?: boolean;
    };

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }
    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Current password is incorrect" });

    const passwordHash = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      if (logoutAll) {
        await tx.session.deleteMany({ where: { userId } });
      }
    });

    return res.json({
      message: logoutAll
        ? "Password updated. All sessions have been logged out."
        : "Password updated successfully.",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
