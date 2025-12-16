"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

type Status = "idle" | "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    async function verify() {
      if (!token) {
        setStatus("error");
        setMessage("Verification token is missing.");
        return;
      }

      setStatus("loading");
      setMessage("");

      try {
        const data = await apiFetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        setStatus("success");
        setMessage(data.message || "Email verified successfully.");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Verification link is invalid or has expired.");
      }
    }

    verify();
  }, [token]);

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="bg-bg min-h-screen">
      <section className="bg-bgAlt/40 border-b border-gray-800/70">
        <div className="w-full max-w-[1400px] mx-auto page-padding pt-24 pb-10 md:pt-28 md:pb-16 lg:pb-20">
          <div className="max-w-md mx-auto card-glow bg-black/80 border border-gray-800 rounded-2xl px-6 py-8 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-accentGold mb-2">
              Email verification
            </p>

            {/* Icon */}
            <div className="mb-4 flex justify-center">
              {isLoading && (
                <Loader2 className="h-10 w-10 text-accentGold animate-spin" />
              )}
              {isSuccess && (
                <CheckCircle2 className="h-10 w-10 text-accentGreen" />
              )}
              {isError && (
                <XCircle className="h-10 w-10 text-red-500" />
              )}
            </div>

            {/* Title */}
            <h1 className="text-lg sm:text-xl font-semibold text-gray-50 mb-2">
              {isLoading && "Verifying your email..."}
              {isSuccess && "Your email has been verified"}
              {isError && "We could not verify your email"}
              {status === "idle" && "Checking verification link..."}
            </h1>

            {/* Message */}
            <p className="text-xs sm:text-sm text-gray-300/90 mb-6">
              {message ||
                "Please wait while we confirm your email address. This usually only takes a moment."}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg bg-accentGold text-black px-4 py-2.5 text-sm font-semibold hover:bg-yellow-400 transition"
              >
                Go to login
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-lg border border-gray-700 bg-black/60 text-gray-100 px-4 py-2.5 text-sm font-semibold hover:border-accentGold hover:text-accentGold transition"
              >
                Go to dashboard
              </Link>
            </div>

            {/* Extra hint */}
            {isError && (
              <p className="mt-4 text-[11px] text-gray-500">
                If this link has expired, sign in and request a new verification email
                from your dashboard.
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
