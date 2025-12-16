"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, ShieldCheck } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setMsg(null);

    try {
      const data = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });

      setMsg(
        data?.message ||
          "If an account exists for that email, a password reset link has been sent."
      );
    } catch (e: any) {
      setErr(e.message || "Failed to request password reset.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-bg min-h-screen">
      <section className="bg-bgAlt/40 border-b border-gray-800/70">
        <div className="w-full max-w-[900px] mx-auto page-padding pt-24 pb-10 md:pt-28 md:pb-16">
          <div className="card-glow bg-black/80 border border-gray-800 rounded-2xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                  Account recovery
                </p>
                <h1 className="mt-1 text-xl sm:text-2xl font-semibold text-gray-50">
                  Forgot your password?
                </h1>
                <p className="mt-2 text-xs sm:text-sm text-gray-400 max-w-xl">
                  Enter your email and we will send you a secure password reset link.
                </p>
              </div>

              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-[11px] text-gray-200 hover:border-accentGold hover:text-accentGold transition"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>

            {msg && (
              <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm text-emerald-100 flex gap-2">
                <ShieldCheck className="h-4 w-4 mt-[2px] text-emerald-300" />
                <span>{msg}</span>
              </div>
            )}

            {err && (
              <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-100">
                {err}
              </div>
            )}

            <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] text-gray-300/90">Email address</label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                    <Mail className="h-4 w-4 text-gray-500" />
                  </span>
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="w-full rounded-lg border border-gray-700 bg-black/60 pl-9 pr-3 py-2 text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-lg bg-accentGold text-black px-4 py-2.5 text-sm font-semibold hover:bg-yellow-400 transition disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>

              <p className="text-[11px] text-gray-500">
                For your security, we do not confirm whether an email exists in our system.
              </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
