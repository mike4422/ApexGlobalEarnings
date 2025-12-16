import nodemailer, { SendMailOptions } from "nodemailer";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE, // boolean in your env.ts
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export type SendMailResult = {
  success: boolean;
  messageId?: string;
  error?: string;
};

export async function sendMail(
  options: SendMailOptions
): Promise<SendMailResult> {
  try {
    const info = await transporter.sendMail({
      from: env.SMTP_FROM, // e.g. "ApexGlobalEarnings <no-reply@yourdomain.com>"
      ...options,
    });

    if (env.NODE_ENV !== "production") {
      console.log("[MAIL] sent:", info.messageId);
    }

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("[MAIL] Failed to send email:", err);
    return { success: false, error: err?.message || "Unknown email error" };
  }
}
