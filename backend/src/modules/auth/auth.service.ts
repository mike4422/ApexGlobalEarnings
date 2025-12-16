import { prisma } from "../../config/prisma";
import { env } from "../../config/env";
import { sendMail, SendMailResult } from "../../utils/email";
import crypto from "crypto";

// import your User type if you have it in a model file

export async function createEmailVerificationToken(userId: string) {
  // Example simple token using uuid:
  const token = crypto.randomUUID();

  // Store token directly on User (matches your schema)
  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerificationToken: token,
      emailVerificationExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    },
  });

  return token;
}

export async function sendVerificationEmail(
  user: { id: string; email: string; name?: string | null; username: string },
  token: string
): Promise<SendMailResult> {
  const verifyUrl = `${env.CLIENT_URL}/verify-email?token=${encodeURIComponent(
    token
  )}`;

  const greeting = user.name || user.username || "Investor";

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 24px; background-color: #020617; color: #f9fafb;">
      <h2 style="color:#facc15; margin-bottom: 8px;">Confirm your ApexGlobalEarnings email</h2>
      <p style="font-size:14px; color:#e5e7eb; margin-bottom: 16px;">
        Hi ${greeting},
      </p>
      <p style="font-size:14px; color:#e5e7eb; margin-bottom: 16px;">
        Please confirm this email address to secure your account and unlock full access to your dashboard.
      </p>
      <p style="margin-bottom: 20px;">
        <a href="${verifyUrl}" style="display:inline-block; padding:10px 18px; background-color:#facc15; color:#020617; border-radius:999px; font-weight:600; text-decoration:none;">
          Verify email
        </a>
      </p>
      <p style="font-size:12px; color:#9ca3af; margin-top: 12px;">
        If you did not create an ApexGlobalEarnings account, you can safely ignore this email.
      </p>
    </div>
  `;

  return sendMail({
    to: user.email,
    subject: "Verify your ApexGlobalEarnings email address",
    html,
  });
}
