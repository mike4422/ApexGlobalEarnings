import nodemailer, { SendMailOptions } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { env } from "../config/env";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: Number(env.SMTP_PORT),
  secure:
    String(process.env.SMTP_SECURE || "").toLowerCase() === "true" ||
    Number(env.SMTP_PORT) === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
} as SMTPTransport.Options);

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

    if (process.env.NODE_ENV !== "production") {
      console.log("[MAIL] sent:", info.messageId);
    }

    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    console.error("[MAIL] Failed to send email:", err);
    return { success: false, error: err?.message || "Unknown email error" };
  }
}
