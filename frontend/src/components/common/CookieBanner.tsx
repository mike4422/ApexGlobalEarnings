"use client";

import { useEffect, useState } from "react";

function getCookie(name: string) {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : "";
}

function setCookie(name: string, value: string, maxAgeSeconds: number) {
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${name}=${encodeURIComponent(
    value
  )}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure}`;
}

export default function CookieBanner() {
  const [ready, setReady] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setReady(true);
    const consent = getCookie("apex_cookie_consent");
    setShow(!consent);
  }, []);

  if (!ready || !show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] p-3">
      <div className="mx-auto w-full max-w-3xl rounded-2xl border border-gray-800 bg-black/95 backdrop-blur px-4 py-4 shadow-xl">
        <p className="text-xs sm:text-sm text-gray-200">
          We use cookies to keep you signed in and improve your experience. You can accept
          or decline non-essential cookies.
        </p>

        <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={() => {
              setCookie("apex_cookie_consent", "rejected", 60 * 60 * 24 * 365);
              setShow(false);
            }}
            className="rounded-lg border border-gray-700 bg-black/60 px-4 py-2 text-xs sm:text-sm font-semibold text-gray-200 hover:border-accentGold hover:text-accentGold transition"
          >
            Decline
          </button>

          <button
            type="button"
            onClick={() => {
              setCookie("apex_cookie_consent", "accepted", 60 * 60 * 24 * 365);
              setShow(false);
            }}
            className="rounded-lg bg-accentGold px-4 py-2 text-xs sm:text-sm font-semibold text-black hover:bg-yellow-400 transition"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
