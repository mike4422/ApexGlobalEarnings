"use client";

import { Mail, Lock, User, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);

  // ✅ FIX: avoid useSearchParams (can break static export prerender)
  const [refFromUrl, setRefFromUrl] = useState("");
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const ref =
        (sp.get("ref") ||
          sp.get("code") ||
          sp.get("referralCode") ||
          "")?.trim() || "";
      setRefFromUrl(ref);
    } catch {
      // ignore
    }
  }, []);

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
    e.preventDefault(); // ⛔ prevents page refresh
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const fullName = form.get("fullName");
    const username = form.get("username");
    const email = form.get("email");
    const password = form.get("password");
    const confirmPassword = form.get("confirmPassword");
    const referralCode = form.get("referralCode");

    if (password !== confirmPassword) {
      showToast("error", "Password mismatch", "Passwords do not match.");
      setLoading(false);
      return;
    }

    // Send to backend API
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: fullName,
            username,
            email,
            password,
            ref: referralCode || undefined,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        showToast(
          "error",
          "Registration failed",
          data.error || "Registration failed"
        );
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem("token", data.token);
        const maxAge = 7 * 24 * 60 * 60;
        document.cookie = `apex_token=${data.token}; Path=/; Max-Age=${maxAge}; SameSite=Lax${
          window.location.protocol === "https:" ? "; Secure" : ""
        }`;
      }
      window.location.href = "/dashboard";
    } catch (error) {
      console.error(error);
      showToast("error", "Network error", "Something went wrong. Try again.");
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
                    toast.type === "success"
                      ? "text-emerald-100"
                      : "text-red-100",
                  ].join(" ")}
                >
                  {toast.title}
                </p>
                {toast.message && (
                  <p className="mt-1 text-[12px] text-gray-300/90">
                    {toast.message}
                  </p>
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
            {/* ------------ LEFT: COPY / HIGHLIGHTS ------------ */}
            <div className="space-y-6 slide-up">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                  Create your account
                </p>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
                  Start investing with{" "}
                  <span className="text-accentGold">
                    ApexGlobalEarnings.
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-gray-300/90 max-w-xl">
                  Open a live account to access multi-asset markets, structured
                  investment plans and a transparent referral ecosystem—managed
                  from a single professional dashboard.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-xs sm:text-sm">
                <div className="card-glow bg-black/70 border border-gray-800 rounded-xl p-4 flex gap-3">
                  <div className="h-9 w-9 rounded-lg bg-black/60 border border-gray-700 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-accentGreen" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-gray-50">
                      Risk-aware, security-first.
                    </p>
                    <p className="text-gray-300/90 text-[11px] sm:text-xs">
                      Layered controls around logins, wallets and withdrawals to
                      help protect your capital and account.
                    </p>
                  </div>
                </div>

                <div className="card-glow bg-black/70 border border-gray-800 rounded-xl p-4 flex gap-3">
                  <div className="h-9 w-9 rounded-lg bg-black/60 border border-gray-700 flex items-center justify-center">
                    <User className="h-5 w-5 text-accentGold" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-gray-50">
                      Built for active investors.
                    </p>
                    <p className="text-gray-300/90 text-[11px] sm:text-xs">
                      Structured plans from Standard to VIP, live charts and a
                      referral program aligned with real activity.
                    </p>
                  </div>
                </div>
              </div>

              <ul className="space-y-2 text-xs sm:text-sm text-gray-300/90 max-w-lg">
                <li className="flex items-start gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-accentGreen" />
                  <span>
                    Access crypto, indices, metals and FX from one platform.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-accentGold" />
                  <span>
                    Enrol in clear investment plans with defined minimums, ROI
                    and duration.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-[6px] h-1.5 w-1.5 rounded-full bg-accentGreen" />
                  <span>
                    Unlock referral tools to earn from Level 1 &amp; Level 2
                    networks as your community grows.
                  </span>
                </li>
              </ul>

              <p className="text-[10px] sm:text-[11px] text-gray-500/95 max-w-xl">
                Trading and investing involve risk. ApexGlobalEarnings does not
                provide personalised investment advice. Only invest what you can
                afford to allocate based on your own objectives and risk
                tolerance.
              </p>
            </div>

            {/* ------------ RIGHT: REGISTER FORM ------------ */}
            <div className="slide-up">
              <div className="card-glow bg-black/80 border border-gray-800 rounded-2xl p-5 sm:p-6 text-xs sm:text-sm">
                <h2 className="text-sm sm:text-base font-semibold text-gray-50 mb-1.5">
                  Create your ApexGlobalEarnings account
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-400 mb-4">
                  Complete the form below to get started. You can fund your
                  account, select an investment plan and activate your referral
                  link after you sign in.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                  {/* Full name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="fullName" className="text-gray-300/90">
                      Full name
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                        <User className="h-4 w-4 text-gray-500" />
                      </span>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        autoComplete="name"
                        className="w-full rounded-lg border border-gray-700 bg-black/60 pl-9 pr-3 py-2 text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60"
                        placeholder="e.g. Daniel Okafor"
                      />
                    </div>
                  </div>

                  {/* ⭐ NEW — USERNAME FIELD */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="username" className="text-gray-300/90">
                      Username
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                        <User className="h-4 w-4 text-gray-500" />
                      </span>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        autoComplete="username"
                        className="w-full rounded-lg border border-gray-700 bg-black/60 pl-9 pr-3 py-2 text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60"
                        placeholder="Choose a username"
                      />
                    </div>
                  </div>

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
                        autoComplete="new-password"
                        className="w-full rounded-lg border border-gray-700 bg-black/60 pl-9 pr-3 py-2 text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60"
                        placeholder="Create a strong password"
                        minLength={8}
                      />
                    </div>
                    <p className="text-[10px] text-gray-500">
                      Use at least 8 characters, including numbers and symbols
                      where possible.
                    </p>
                  </div>

                  {/* Confirm password */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="confirmPassword"
                      className="text-gray-300/90"
                    >
                      Confirm password
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                        <Lock className="h-4 w-4 text-gray-500" />
                      </span>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        autoComplete="new-password"
                        className="w-full rounded-lg border border-gray-700 bg-black/60 pl-9 pr-3 py-2 text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60"
                        placeholder="Repeat your password"
                        minLength={8}
                      />
                    </div>
                  </div>

                  {/* Optional referral code */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="referralCode" className="text-gray-300/90">
                      Referral code (optional)
                    </label>
                    <input
                      key={refFromUrl} // ✅ ensures defaultValue updates after mount
                      id="referralCode"
                      name="referralCode"
                      type="text"
                      defaultValue={refFromUrl}
                      className="w-full rounded-lg border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60"
                      placeholder="Enter a partner or friend’s code if you have one"
                    />

                    <p className="text-[10px] text-gray-500">
                      If you join through a partner, entering their code ensures
                      they receive the correct commission.
                    </p>
                  </div>

                  {/* Terms */}
                  <div className="flex items-start gap-2 pt-1">
                    <input
                      id="terms"
                      name="terms"
                      type="checkbox"
                      required
                      className="mt-[2px] h-3.5 w-3.5 rounded border border-gray-600 bg-black/60 text-accentGold focus:ring-accentGold/60"
                    />
                    <label
                      htmlFor="terms"
                      className="text-[11px] sm:text-xs text-gray-300/90"
                    >
                      I confirm that I am opening this account for myself, I
                      have read and agree to the{" "}
                      <Link
                        href="/terms"
                        className="text-accentGold hover:text-yellow-300 cursor-pointer"
                      >
                        Terms &amp; Conditions
                      </Link>{" "}
                      and I understand the risks of trading and investing.
                    </label>
                  </div>

                  {/* Submit */}
                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center rounded-lg bg-accentGold text-black px-4 py-2.5 text-sm font-semibold hover:bg-yellow-400 transition"
                      disabled={loading}
                    >
                      {loading ? "Creating..." : "Create account"}
                    </button>
                    <p className="text-[11px] text-gray-400 text-center">
                      Already have an account?{" "}
                      <Link
                        href="/login"
                        className="text-accentGold hover:text-yellow-300 font-medium"
                      >
                        Sign in
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
