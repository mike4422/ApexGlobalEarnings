"use client";

import { Mail, Lock, ShieldCheck, MonitorSmartphone } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);

  // ✅ NEW: modern toast popup
  const [toast, setToast] = useState<{
    open: boolean;
    type: "success" | "error";
    title: string;
    message?: string;
  }>({ open: false, type: "error", title: "" });

  function showToast(
    type: "success" | "error",
    title: string,
    message?: string
  ) {
    setToast({ open: true, type, title, message });
    window.setTimeout(() => {
      setToast((p) => ({ ...p, open: false }));
    }, 4500);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // ⛔ prevent page refresh
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = form.get("email");
    const password = form.get("password");

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast("error", "Sign-in failed", data.error || "Login failed");
        setLoading(false);
        return;
      }

      // ✅ Store JWT in BOTH localStorage and cookie
      const maxAge = 7 * 24 * 60 * 60;

      if (typeof window !== "undefined") {
        // Used by dashboard layout & apiFetch()
        window.localStorage.setItem("token", data.token);

        // Used by Next.js middleware for route protection
        document.cookie = `apex_token=${data.token}; Path=/; Max-Age=${maxAge}; SameSite=Lax${
          window.location.protocol === "https:" ? "; Secure" : ""
        }`;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      showToast("error", "Network error", "Unable to connect. Please try again.");
    }

    setLoading(false);
  }

  return (
    <div className="bg-bg min-h-screen">
      {/* ✅ Toast popup (NEW) */}
      {toast.open && (
        <div className="fixed right-4 top-4 z-[9999] w-[92vw] max-w-sm">
          <div
            role="status"
            className={[
              "card-glow rounded-2xl border p-4 shadow-2xl backdrop-blur",
              toast.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-red-500/40 bg-red-500/10",
            ].join(" ")}
          >
            <div className="flex items-start gap-3">
              <div
                className={[
                  "mt-0.5 h-9 w-9 rounded-xl border flex items-center justify-center",
                  toast.type === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-red-500/30 bg-red-500/10",
                ].join(" ")}
              >
                {toast.type === "success" ? (
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                ) : (
                  <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p
                  className={[
                    "text-sm font-semibold",
                    toast.type === "success" ? "text-emerald-100" : "text-red-100",
                  ].join(" ")}
                >
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="mt-1 text-[12px] text-gray-300/90">{toast.message}</p>
                )}
              </div>

              <button
                type="button"
                onClick={() => setToast((p) => ({ ...p, open: false }))}
                className="rounded-lg border border-gray-800 bg-black/40 px-2 py-1 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
                aria-label="Close"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------- HERO / SHELL -------------- */}
      <section className="bg-bgAlt/40 border-b border-gray-800/70">
        <div className="w-full max-w-[1400px] mx-auto page-padding pt-24 pb-10 md:pt-28 md:pb-16 lg:pb-20">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] items-start">
            {/* ------------ LEFT COPY — unchanged ------------ */}
            <div className="space-y-6 slide-up">
              {/* (No changes at all here) */}
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                  Secure login
                </p>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
                  Access your{" "}
                  <span className="text-accentGold">
                    ApexGlobalEarnings dashboard.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-gray-300/90 max-w-xl">
                  Sign in to manage live investment plans, track performance in real
                  time, monitor referrals and request payouts—all from a single
                  professional interface.
                </p>
              </div>

              {/* (OTHER SECTIONS — unchanged) */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs sm:text-sm">
                <div className="card-glow bg-black/70 border border-gray-800 rounded-xl p-4 flex gap-3">
                  <div className="h-9 w-9 rounded-lg bg-black/60 border border-gray-700 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-accentGreen" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-gray-50">Security-first access.</p>
                    <p className="text-gray-300/90 text-[11px] sm:text-xs">
                      Encrypted sessions, strict password handling and monitoring for
                      unusual activity around logins and withdrawals.
                    </p>
                  </div>
                </div>

                {/* (unchanged) */}
                <div className="card-glow bg-black/70 border border-gray-800 rounded-xl p-4 flex gap-3">
                  <div className="h-9 w-9 rounded-lg bg-black/60 border border-gray-700 flex items-center justify-center">
                    <MonitorSmartphone className="h-5 w-5 text-accentGold" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-gray-50">Multi-device experience.</p>
                    <p className="text-gray-300/90 text-[11px] sm:text-xs">
                      Seamlessly monitor positions and plans from desktop, laptop or
                      mobile browsers.
                    </p>
                  </div>
                </div>
              </div>

              {/* (unchanged) */}
              <ul className="space-y-2 text-xs sm:text-sm text-gray-300/90 max-w-lg">
                <li className="flex items-start gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-accentGreen" />
                  <span>View real-time balances, active investments and accrued profits.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-accentGold" />
                  <span>
                    Generate referral links, track commissions and monitor network performance.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-accentGreen" />
                  <span>
                    Submit deposit and withdrawal requests with full status visibility.
                  </span>
                </li>
              </ul>

              {/* (unchanged) */}
              <p className="text-[10px] sm:text-[11px] text-gray-500/95 max-w-xl">
                Always confirm you are on the official ApexGlobalEarnings website before
                entering your credentials...
              </p>
            </div>

            {/* ------------ RIGHT: LOGIN FORM ------------ */}
            <div className="slide-up">
              <div className="card-glow bg-black/80 border border-gray-800 rounded-2xl p-5 sm:p-6 text-xs sm:text-sm">
                <h2 className="text-sm sm:text-base font-semibold text-gray-50 mb-1.5">
                  Sign in to your account
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-400 mb-4">
                  Enter your registered email and password to access your dashboard.
                </p>

                <form
                  onSubmit={handleSubmit}
                  method="post"
                  action="#"
                  className="space-y-4"
                  noValidate
                >
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="email" className="text-gray-300/90">
                      Email address
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                        <Mail className="h-4 w-4 text-gray-500" />
                      </span>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        className="w-full rounded-lg border border-gray-700 bg-black/60 pl-9 pr-3 py-2 text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="password" className="text-gray-300/90">
                      Password
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                        <Lock className="h-4 w-4 text-gray-500" />
                      </span>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        className="w-full rounded-lg border border-gray-700 bg-black/60 pl-9 pr-3 py-2 text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  {/* ✅ Forgot password (NEW — only addition) */}
                  <div className="flex items-center justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-[11px] text-accentGold hover:text-yellow-300 font-medium"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit button */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-accentGold text-black px-4 py-2.5 text-sm font-semibold hover:bg-yellow-400 transition"
                    >
                      {loading ? "Signing in..." : "Sign in"}
                    </button>

                    <p className="text-[11px] text-gray-400 text-center">
                      New to ApexGlobalEarnings?{" "}
                      <Link
                        href="/register"
                        className="text-accentGold hover:text-yellow-300 font-medium"
                      >
                        Create an account
                      </Link>
                    </p>
                  </div>
                </form>

                {/* Security note (unchanged) */}
                <div className="mt-4 rounded-xl bg-black/70 border border-gray-800 px-4 py-3 text-[10px] sm:text-[11px] text-gray-400 flex gap-2">
                  <ShieldCheck className="h-4 w-4 flex-shrink-0 text-accentGreen mt-[2px]" />
                  <p>If you suspect someone else has accessed your account...</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
