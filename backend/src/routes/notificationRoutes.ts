import { Router } from "express";
import { prisma } from "../config/prisma";
import { requireAuth, AuthRequest } from "../middleware/auth";

const router = Router();

/**
 * GET /api/notifications
 * Query:
 *  - take (default 20, max 50)
 *  - cursor (notification id)
 */
router.get("/", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    const takeRaw = Number(req.query.take ?? 20);
    const take = Number.isFinite(takeRaw) ? Math.min(Math.max(takeRaw, 1), 50) : 20;

    const cursor = typeof req.query.cursor === "string" ? req.query.cursor : null;

    const [items, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take,
        ...(cursor
          ? {
              cursor: { id: cursor },
              skip: 1,
            }
          : {}),
        select: {
          id: true,
          title: true,
          message: true,
          data: true,
          isRead: true,
          createdAt: true,
          readAt: true,
          createdBy: { select: { id: true, username: true, name: true, role: true } },
        },
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    const nextCursor = items.length === take ? items[items.length - 1].id : null;

    return res.json({
      items,
      unreadCount,
      nextCursor,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/notifications/unread-count
 */
router.get("/unread-count", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    return res.json({ unreadCount });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/notifications/:id/read
 */
router.post("/:id/read", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id;

    const n = await prisma.notification.findUnique({
      where: { id },
      select: { id: true, userId: true, isRead: true },
    });

    if (!n || n.userId !== userId) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (n.isRead) {
      return res.json({ message: "Already read" });
    }

    await prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });

    return res.json({ message: "Marked as read" });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/notifications/read-all
 */
router.post("/read-all", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const userId = req.user!.id;

    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });

    return res.json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
});

export default router;

