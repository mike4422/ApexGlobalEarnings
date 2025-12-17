import { Request, Response } from "express";
import { env } from "../../config/env";

export async function verifyHuman(req: Request, res: Response) {
  try {
    const { token } = req.body as { token?: string };

    if (!token) {
      return res.status(400).json({ ok: false, error: "Missing token" });
    }

    const form = new URLSearchParams();
    form.append("secret", env.TURNSTILE_SECRET_KEY);
    form.append("response", token);

    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });

    const data: any = await r.json();

    if (!data?.success) {
      return res.status(400).json({ ok: false, error: "Verification failed", data });
    }

    return res.json({ ok: true });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "Server error" });
  }
}
