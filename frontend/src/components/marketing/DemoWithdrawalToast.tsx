"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DEMO_COUNTRIES, DEMO_WITHDRAWAL_NAMES } from "@/lib/demoWithdrawals";
import { ArrowUpRight, X } from "lucide-react";

type ToastItem = {
  type: "WITHDRAWAL" | "DEPOSIT";
  name: string;
  country: string;
  amountUsd: number;
  minutesAgo: number;
};

function pickRandom<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAmountUsd(type?: "WITHDRAWAL" | "DEPOSIT") {
  // Professional-looking amounts (e.g., 120, 250, 500, 1200, 2500)
  const depositBuckets = [250, 350, 500, 750, 900, 1200, 1500, 2000, 2500, 3000, 4500, 5000, 8000, 11000, 19000, 23000, 24000, 33000, 44000, 50000, 88000,1000000, 550000, 670000];
  const withdrawalBuckets = [250, 350, 500, 750, 900, 1200, 1500, 2000, 2500, 3000, 4500, 5000, 8000, 11000, 19000, 23000, 24000, 33000, 44000, 50000, 88000, 500000, 850000, 300000];

  const buckets = type === "DEPOSIT" ? depositBuckets : withdrawalBuckets;
  const base = pickRandom(buckets);
  const jitter = Math.random() < 0.35 ? Math.floor(Math.random() * 40) : 0;
  return base + jitter;
}

function randomMinutesAgo() {
  return Math.floor(1 + Math.random() * 29); // 1–29 minutes
}

const STORAGE_KEY = "apex_demo_withdrawals_dismissed_until";

export default function DemoWithdrawalToast() {
  const [open, setOpen] = useState(false);
  const [item, setItem] = useState<ToastItem | null>(null);

  const timersRef = useRef<number[]>([]);

  const formatter = useMemo(
    () => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 }),
    []
  );

  function clearTimers() {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }

  function isDismissed(): boolean {
    const until = Number(localStorage.getItem(STORAGE_KEY) || "0");
    return until > Date.now();
  }

  function dismissForHours(hours: number) {
    localStorage.setItem(STORAGE_KEY, String(Date.now() + hours * 60 * 60 * 1000));
  }

  function showNewToast() {
    const isDeposit = Math.random() < 0.5;

    const next: ToastItem = {
      type: isDeposit ? "DEPOSIT" : "WITHDRAWAL",
      name: pickRandom(DEMO_WITHDRAWAL_NAMES),
      country: pickRandom(DEMO_COUNTRIES),
      amountUsd: randomAmountUsd(isDeposit ? "DEPOSIT" : "WITHDRAWAL"),
      minutesAgo: randomMinutesAgo(),
    };
    setItem(next);
    setOpen(true);

    // auto-hide after a short duration
    const hideTimer = window.setTimeout(() => setOpen(false), 6500);
    timersRef.current.push(hideTimer);
  }

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Respect “dismissed”
    if (isDismissed()) return;

    // First toast after a short delay, then periodic
    const firstDelay = window.setTimeout(() => showNewToast(), 6000);
    timersRef.current.push(firstDelay);

    // Repeat every 35–65 seconds (randomized)
    const scheduleNext = () => {
      const gap = 10000; // every 10s
      const t = window.setTimeout(() => {
        if (!isDismissed()) showNewToast();
        scheduleNext();
      }, gap);
      timersRef.current.push(t);
    };
    scheduleNext();

    return () => clearTimers();
  }, []);

  if (!item) return null;

  return (
    <div className="fixed z-[60] left-4 right-4 sm:right-auto sm:left-6 bottom-5 sm:bottom-6 pointer-events-none">
      <div
        className={[
          "pointer-events-auto",
          "max-w-md w-full sm:w-[420px]",
          "rounded-2xl border border-gray-800 bg-black/90 backdrop-blur",
          "shadow-[0_10px_30px_rgba(0,0,0,0.45)]",
          "px-4 py-3",
          "transition-all duration-300",
          open ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3",
        ].join(" ")}
        role="status"
        aria-live="polite"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 h-9 w-9 rounded-xl border border-accentGold/40 bg-accentGold/10 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 text-accentGold" />
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <p className="text-[12px] font-semibold text-gray-100">
                  {item.type === "DEPOSIT" ? "Deposit confirmed" : "Withdrawal processed"}
                </p>
                {/* <span className="text-[10px] px-2 py-[2px] rounded-full border border-gray-700 bg-black/60 text-gray-300">
                  Simulated
                </span> */}
              </div>

              <p className="text-[11px] text-gray-300 mt-0.5">
                <span className="font-medium text-gray-100">{item.name}</span>{" "}
                from <span className="text-gray-200">{item.country}</span>{" "}
                {item.type === "DEPOSIT" ? "deposited" : "withdrew"}{" "}
                <span className="font-semibold text-accentGold">{formatter.format(item.amountUsd)}</span>
              </p>

              <p className="text-[10px] text-gray-500 mt-0.5">
                {item.minutesAgo} min ago · Live feed
              </p>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-800 bg-black/60 text-gray-300 hover:border-accentGold/60 hover:text-accentGold transition"
            onClick={() => {
              setOpen(false);
              dismissForHours(24); // hide for 24h if user closes it
            }}
            aria-label="Dismiss"
            title="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
