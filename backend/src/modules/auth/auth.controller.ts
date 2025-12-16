// src/modules/auth/auth.controller.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../config/prisma';
import { env } from '../../config/env';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../../middleware/auth';
import crypto from "crypto";
import { sendMail } from "../../utils/email";

// ✅ Small helper: wrap sendMail so it NEVER throws
async function safeSendMail(options: any): Promise<{ success: boolean; error?: string }> {
  try {
    await sendMail(options);
    return { success: true };
  } catch (err: any) {
    console.error("Email send error:", err);
    return { success: false, error: err?.message || "Unknown email error" };
  }
}

// POST /api/auth/register
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, username, ref } = req.body;

    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ error: 'Email, password and username are required' });
    }

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    let referredById: string | undefined;
    if (ref) {
      const refUser = await prisma.user.findUnique({
        where: { referralCode: ref },
      });
      if (refUser) referredById = refUser.id;
    }

    const referralCode = `APEX${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        passwordHash,
        referralCode,
        referredById,
        emailVerificationToken,
        emailVerificationExpiresAt,
      },
    });

    const jti = uuidv4();
    const token = jwt.sign(
      { userId: user.id, role: user.role, jti },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await prisma.session.create({
      data: {
        userId: user.id,
        jwtId: jti,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // 📧 Registration verification email (safe, non-breaking)
    try {
      const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${emailVerificationToken}`;

      const emailResult = await safeSendMail({
        to: user.email,
        subject: "Verify your ApexGlobalEarnings account",
        html: `
          <p>Hi ${user.name || user.username || "there"},</p>
          <p>Thank you for creating an account with <strong>ApexGlobalEarnings</strong>.</p>
          <p>Please confirm your email address by clicking the button below:</p>
          <p>
            <a href="${verifyUrl}" 
               style="display:inline-block;padding:10px 18px;background:#facc15;color:#000;
                      text-decoration:none;border-radius:6px;font-weight:600;">
              Verify my email
            </a>
          </p>
          <p>If you did not create this account, you can safely ignore this message.</p>
          <p>— ApexGlobalEarnings Security Team</p>
        `,
      });

      if (!emailResult.success) {
        console.error("Failed to send verification email:", emailResult.error);
        // We intentionally do NOT block registration here
      }
    } catch (err) {
      // safeSendMail already caught & logged, this is just a final guard
      console.error("Failed to send verification email (outer)", err);
    }

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        referralCode: user.referralCode,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// POST /api/auth/login
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ error: 'Incorrect password' });

    const jti = uuidv4();
    const token = jwt.sign(
      { userId: user.id, role: user.role, jti },
      env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    await prisma.session.create({
      data: {
        userId: user.id,
        jwtId: jti,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
        referralCode: user.referralCode,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/auth/me
export async function me(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        referralCode: true,
        createdAt: true,
        balanceCents: true,
        emailVerifiedAt: true, // ⬅️ important
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({ user });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /api/auth/verify-email?token=...
export async function verifyEmail(req: Request, res: Response) {
  try {
    const token = (req.query.token as string) || "";

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Invalid or expired verification token" });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: new Date(),
        emailVerificationToken: null,
        emailVerificationExpiresAt: null,
      },
      select: {
        id: true,
        email: true,
        emailVerifiedAt: true,
      },
    });

    console.log("[AUTH] Email verified for user:", updated.id, "at", updated.emailVerifiedAt);

    return res.json({
      message: "Email verified successfully",
      user: {
        id: updated.id,
        email: updated.email,
        emailVerifiedAt: updated.emailVerifiedAt,
      },
    });
  } catch (e) {
    console.error("[AUTH] verifyEmail error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/auth/resend-verification
export async function resendVerification(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.emailVerifiedAt) {
      return res.status(400).json({ error: "Email already verified" });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: token,
        emailVerificationExpiresAt: expiresAt,
      },
    });

    const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${token}`;

    const emailResult = await safeSendMail({
      to: user.email,
      subject: "Verify your ApexGlobalEarnings account",
      html: `
        <p>Hi ${user.name || user.username || "there"},</p>
        <p>This is a reminder to verify your email for <strong>ApexGlobalEarnings</strong>.</p>
        <p>Click the button below to confirm your email address:</p>
        <p>
          <a href="${verifyUrl}" 
             style="display:inline-block;padding:10px 18px;background:#facc15;color:#000;
                    text-decoration:none;border-radius:6px;font-weight:600;">
            Verify my email
          </a>
        </p>
        <p>If you have already verified your email, you can ignore this message.</p>
        <p>— ApexGlobalEarnings Security Team</p>
      `,
    });

    if (!emailResult.success) {
      console.error("Failed to resend verification email:", emailResult.error);
      return res
        .status(500)
        .json({ error: "Unable to send verification email" });
    }

    return res.json({ message: "Verification email sent" });
  } catch (err) {
    console.error("[AUTH] resendVerification error:", err);
    return res
      .status(500)
      .json({ error: "Internal server error while resending email" });
  }
}



// PUT /api/auth/profile
export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { name, username } = req.body as { name?: string; username?: string };

    const clean = (v: any) => {
      if (v === undefined) return undefined;
      if (v === null) return null;
      if (typeof v !== "string") return undefined;
      const t = v.trim();
      return t.length ? t : null;
    };

    const nextName = clean(name);
    const nextUsername = clean(username);

    // Load current user
    const current = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });

    if (!current) return res.status(404).json({ error: "User not found" });

    // If username changes, enforce uniqueness
    if (nextUsername && nextUsername !== current.username) {
      if (String(nextUsername).length < 3) {
        return res.status(400).json({ error: "Username must be at least 3 characters" });
      }

      const exists = await prisma.user.findUnique({
        where: { username: nextUsername },
        select: { id: true },
      });

      if (exists) return res.status(409).json({ error: "Username already in use" });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(nextName !== undefined ? { name: nextName } : {}),
        ...(nextUsername !== undefined ? { username: nextUsername } : {}),
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        referralCode: true,
        emailVerifiedAt: true,
        createdAt: true,
        balanceCents: true,
      },
    });

    return res.json({ message: "Profile updated", user: updated });
  } catch (e) {
    console.error("[AUTH] updateProfile error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/auth/change-password
export async function changePassword(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body as {
      currentPassword?: string;
      newPassword?: string;
    };

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }
    if (String(newPassword).length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Current password is incorrect" });

    const nextHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: nextHash },
    });

    return res.json({ message: "Password updated successfully" });
  } catch (e) {
    console.error("[AUTH] changePassword error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}



// POST /api/auth/forgot-password
export async function forgotPassword(req: Request, res: Response) {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();

    // Always respond the same (do not leak if email exists)
    const okResponse = () =>
      res.json({
        message:
          "If an account exists for that email, a password reset link has been sent.",
      });

    if (!email) return okResponse();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return okResponse();

    // Create a raw token and store a HASH only
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: expiresAt,
      },
    });

    // Build reset link to frontend
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${rawToken}`;

    // Email (non-blocking)
    try {
      await sendMail({
        to: user.email,
        subject: "Reset your password — ApexGlobalEarnings",
        html: `
          <p>Hi ${user.name || user.username || "Investor"},</p>
          <p>We received a request to reset your ApexGlobalEarnings password.</p>
          <p>Click the button below to set a new password (link expires in 1 hour):</p>
          <p>
            <a href="${resetUrl}"
               style="display:inline-block;padding:10px 18px;background:#facc15;color:#000;
                      text-decoration:none;border-radius:8px;font-weight:700;">
              Reset password
            </a>
          </p>
          <p>If you did not request this, you can safely ignore this email.</p>
          <p>— ApexGlobalEarnings Security Team</p>
        `,
      });
    } catch (err) {
      console.error("[AUTH] forgotPassword email failed:", err);
      // still return okResponse
    }

    return okResponse();
  } catch (e) {
    console.error("[AUTH] forgotPassword error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// POST /api/auth/reset-password
export async function resetPassword(req: Request, res: Response) {
  try {
    const token = String(req.body?.token || "").trim();
    const password = String(req.body?.password || "");

    if (!token || password.length < 8) {
      return res.status(400).json({
        error: "Invalid reset request. Ensure your password is at least 8 characters.",
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await prisma.user.findFirst({
      where: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: "Reset link is invalid or expired." });
    }

    const newHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        passwordResetTokenHash: null,
        passwordResetExpiresAt: null,
      },
    });

    // Optional confirmation email (non-blocking)
    try {
      await sendMail({
        to: user.email,
        subject: "Password updated — ApexGlobalEarnings",
        html: `
          <p>Hi ${user.name || user.username || "Investor"},</p>
          <p>Your password has been successfully updated.</p>
          <p>If you did not perform this action, please contact support immediately.</p>
          <p>— ApexGlobalEarnings Security Team</p>
        `,
      });
    } catch (err) {
      console.error("[AUTH] resetPassword confirmation email failed:", err);
    }

    return res.json({ message: "Password reset successful. You can now log in." });
  } catch (e) {
    console.error("[AUTH] resetPassword error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
}
