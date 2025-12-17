"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";

declare global {
  interface Window {
    turnstile?: any;
  }
}

const STORAGE_KEY = "apex_human_ok_until";

export default function RobotGate() {
  const [ready, setReady] = useState(false);
  const [passed, setPassed] = useState(false);
  const widgetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const until = Number(localStorage.getItem(STORAGE_KEY) || "0");
    if (until > Date.now()) {
      setPassed(true);
      return;
    }

    // load Turnstile script once
    const existing = document.querySelector('script[data-turnstile="true"]');
    if (!existing) {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.setAttribute("data-turnstile", "true");
      s.onload = () => setReady(true);
      document.body.appendChild(s);
    } else {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (passed) return;
    if (!ready) return;
    if (!widgetRef.current) return;
    if (!window.turnstile) return;

    widgetRef.current.innerHTML = "";

    window.turnstile.render(widgetRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
      theme: "dark",
      callback: async (token: string) => {
        try {
          const r = await apiFetch(
            "/api/security/verify-human",
            {
              method: "POST",
              body: JSON.stringify({ token }),
            }
          );

          if (r?.ok) {
            // allow for 24 hours (change if you want)
            localStorage.setItem(STORAGE_KEY, String(Date.now() + 24 * 60 * 60 * 1000));
            setPassed(true);
          }
        } catch {
          // keep gate open if verify fails
        }
      },
    });
  }, [ready, passed]);

  if (passed) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-black/90 p-6 text-center">
        <h2 className="text-base font-semibold text-gray-50">Verify you’re not a robot</h2>
        <p className="mt-2 text-xs text-gray-400">
          Complete this check to continue to ApexGlobalEarnings.
        </p>
        <div className="mt-5 flex justify-center">
          <div ref={widgetRef} />
        </div>
      </div>
    </div>
  );
}
