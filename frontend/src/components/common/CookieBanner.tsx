"use client";

import { useEffect, useState } from "react";

const CONSENT_COOKIE = "apex_cookie_consent"; // "accepted" | "rejected"
const MAX_AGE_DAYS = 180;

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

function setCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;

  const maxAge = days * 24 * 60 * 60; // seconds
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
  const secure = isHttps ? "; Secure" : "";

  document.cookie =
    `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax${secure}`;
}

export default function CookieBanner() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const consent = getCookie(CONSENT_COOKIE);
    if (!consent) setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-gray-800 bg-black/95 backdrop-blur">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs sm:text-sm text-gray-200">
            <p className="font-semibold text-gray-50">We use cookies</p>
            <p className="text-gray-400">
              We use cookies to remember your preferences and improve your experience. You can accept or reject non-essential cookies.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <button
              type="button"
              onClick={() => {
                setCookie(CONSENT_COOKIE, "rejected", MAX_AGE_DAYS);
                setOpen(false);
              }}
              className="inline-flex items-center justify-center rounded-lg border border-gray-700 bg-black/60 px-4 py-2 text-xs sm:text-sm font-semibold text-gray-200 hover:border-gray-500 transition"
            >
              Reject
            </button>

            <button
              type="button"
              onClick={() => {
                setCookie(CONSENT_COOKIE, "accepted", MAX_AGE_DAYS);
                setOpen(false);
              }}
              className="inline-flex items-center justify-center rounded-lg bg-accentGold text-black px-4 py-2 text-xs sm:text-sm font-semibold hover:bg-yellow-400 transition"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
