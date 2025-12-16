"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Wallet as WalletIcon,
  Activity,
  Users,
  ArrowRight,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type MeResponse = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    username: string;
    emailVerifiedAt?: string | null;
  };
};

type PerformancePoint = {
  date: string; // YYYY-MM-DD
  netChangeCents: number;
};

type DashboardSummary = {
  balanceCents: number;
  activeInvestmentsCount: number;
  activeInvestmentsCents: number;
  activeDepositsCents: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsCents: number;
  totalDepositsCents: number;
  totalWithdrawalsCents: number;
  totalEarningsCents: number;
  referralCommissionCents: number;
  performance: PerformancePoint[];
};

function formatCurrencyFromCents(cents: number): string {
  const n = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

export default function DashboardPage() {
  const [user, setUser] = useState<MeResponse["user"] | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [reminderLoading, setReminderLoading] = useState(false);
  const [reminderMessage, setReminderMessage] = useState<string | null>(null);

  // Load current user (for emailVerifiedAt + welcome)
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setLoadingUser(false);
      setUserError("You are not logged in.");
      return;
    }

    try {
    const cached = typeof window !== "undefined" ? localStorage.getItem("apex_me_cache") : null;
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed?.username) setUser(parsed);
    }
  } catch {}

    apiFetch("/api/auth/me", {}, token)
      .then((data: any) => {
        const me = data as MeResponse;
        setUser(me.user);

          // ✅ refresh cache so other pages stay consistent
  if (typeof window !== "undefined") {
    window.localStorage.setItem("apex_me_cache", JSON.stringify(me.user));
  }
      })
      .catch((err: any) => {
        console.error(err);
        setUserError(err.message || "Failed to load profile.");
      })
      .finally(() => setLoadingUser(false));
  }, []);

  // Load dashboard summary
  useEffect(() => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setLoadingSummary(false);
      setSummaryError("You are not logged in.");
      return;
    }

    setLoadingSummary(true);
    apiFetch("/api/dashboard/summary", {}, token)
      .then((data: any) => {
        setSummary(data as DashboardSummary);
      })
      .catch((err: any) => {
        console.error(err);
        setSummaryError(err.message || "Unable to load dashboard summary.");
      })
      .finally(() => setLoadingSummary(false));
  }, []);

  async function handleResendVerification() {
    try {
      setReminderLoading(true);
      setReminderMessage(null);
      const token = localStorage.getItem("token");
      if (!token) {
        setReminderMessage("You need to be logged in to request a reminder.");
        return;
      }

      await apiFetch("/api/auth/resend-verification", { method: "POST" }, token);

      setReminderMessage("Verification email sent. Please check your inbox or spam .");
    } catch (err: any) {
      console.error(err);
      setReminderMessage(err.message || "Unable to send reminder. Try again.");
    } finally {
      setReminderLoading(false);
    }
  }

  const firstName = user?.name?.split(" ")[0] || user?.username || "Investor";

  const performanceSeries = summary?.performance || [];

  const performanceStats = useMemo(() => {
    if (!performanceSeries.length) {
      return { min: 0, max: 0, points: [] as PerformancePoint[] };
    }

    let min = performanceSeries[0].netChangeCents;
    let max = performanceSeries[0].netChangeCents;

    for (const p of performanceSeries) {
      if (p.netChangeCents < min) min = p.netChangeCents;
      if (p.netChangeCents > max) max = p.netChangeCents;
    }

    // Avoid flat line when all points are equal
    if (min === max) {
      min -= 100;
      max += 100;
    }

    return { min, max, points: performanceSeries };
  }, [performanceSeries]);

  if (loadingUser && loadingSummary) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-gray-300/90">
          Loading your ApexGlobalEarnings dashboard...
        </p>
      </div>
    );
  }

  if ((userError && !user) || (!summary && summaryError)) {
    return (
      <div className="max-w-xl mx-auto space-y-3">
        {userError && <p className="text-sm text-red-400 mb-1">{userError}</p>}
        {summaryError && (
          <p className="text-sm text-red-400 mb-1">{summaryError}</p>
        )}
        <p className="text-xs text-gray-400">
          Try signing in again from the{" "}
          <a href="/login" className="text-accentGold hover:text-yellow-300">
            login page
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 🔔 Email verification banner */}
      {user && !user.emailVerifiedAt && (
        <div className="rounded-xl border border-amber-500/60 bg-amber-500/10 px-4 py-3 flex items-start justify-between gap-3 text-xs sm:text-sm text-amber-100">
          <div className="flex gap-2">
            <ShieldCheck className="h-4 w-4 mt-[2px] flex-shrink-0 text-amber-300" />
            <div>
              <p className="font-medium">Verify your email address</p>
              <p className="text-amber-100/85">
                We sent a verification link to{" "}
                <span className="font-medium">{user.email}</span>. Please confirm your
                email to secure your account and unlock all features. Check your inbox, spam or junk folder
              </p>
              {reminderMessage && (
                <p className="mt-1 text-[11px] text-amber-200/90">
                  {reminderMessage}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={handleResendVerification}
            disabled={reminderLoading}
            className="inline-flex items-center rounded-lg border border-amber-400/70 bg-amber-500/10 px-3 py-1.5 text-[11px] font-medium hover:bg-amber-500/20 disabled:opacity-60"
          >
            {reminderLoading ? "Sending..." : "Resend Link"}
          </button>
        </div>
      )}

      {/* Top: welcome + key balance */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        {/* Welcome / summary card */}
        <div className="rounded-2xl border border-gray-800 bg-black/70 px-5 py-5 md:py-6 text-gray-50">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <p className="text-[11px] uppercase tracking-[0.2em] text-accentGold/90">
                ApexGlobalEarnings
              </p>
             <h1 className="text-lg sm:text-xl font-semibold">
  Welcome back, {user?.username || "Investor"}.
</h1>

<p className="text-[11px] text-gray-400 mt-1">
  {user?.name ? `Account name: ${user.name}` : null}
</p>

              <p className="text-xs sm:text-sm text-gray-400 max-w-xl">
                Monitor your live balance, active investment plans and referral
                commissions in one place. Use the quick links below to fund, withdraw
                or explore new plans.
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end text-right text-[11px] text-gray-400">
              <span className="inline-flex items-center rounded-full border border-emerald-500/60 bg-emerald-500/10 px-2 py-[2px] text-[10px] font-medium text-emerald-200 mb-1">
                Account active
              </span>
              <span>Last sync: just now</span>
            </div>
          </div>

          {/* Quick links */}
          <div className="mt-4 grid gap-3 sm:grid-cols-3 text-[11px] sm:text-xs">
            <QuickLink
              href="/dashboard/deposit"
              title="Fund account"
              description="Top up your balance in USDT, BTC or other supported assets."
            />
            <QuickLink
              href="/dashboard/withdrawals"
              title="Request payout"
              description="Move available profits to your preferred wallet."
            />
            <QuickLink
              href="/dashboard/plans"
              title="Explore plans"
              description="Review Standard, Pro and VIP structured investment plans."
            />
          </div>
        </div>

        {/* Balance highlight card */}
        <div className="rounded-2xl border border-gray-800 bg-black/75 px-5 py-5 md:py-6 text-gray-50 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <p className="text-[11px] text-gray-400">Total balance</p>
              <p className="mt-1 text-xl sm:text-2xl font-semibold">
                {summary ? formatCurrencyFromCents(summary.balanceCents) : "--"}
              </p>
            </div>
            <div className="flex flex-col items-end text-[11px] text-emerald-300">
              <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/60 px-2 py-[2px]">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Live ROI accrual</span>
              </div>
            </div>
          </div>

          <div className="mt-1 grid grid-cols-2 gap-3 text-[11px] sm:text-xs">
            <div className="rounded-xl bg-black/60 border border-gray-800 px-3 py-2.5 flex flex-col gap-0.5">
              <span className="text-gray-400">Active investments</span>
              <span className="font-medium">
                {summary
                  ? formatCurrencyFromCents(summary.activeInvestmentsCents)
                  : "--"}
              </span>
              <span className="text-[10px] text-gray-500">
                {summary?.activeInvestmentsCount ?? 0} active plan
                {summary && summary.activeInvestmentsCount !== 1 && "s"}
              </span>
            </div>
            <div className="rounded-xl bg-black/60 border border-gray-800 px-3 py-2.5 flex flex-col gap-0.5">
              <span className="text-gray-400">Pending withdrawals</span>
              <span className="font-medium text-amber-200">
                {summary
                  ? formatCurrencyFromCents(summary.pendingWithdrawalsCents)
                  : "--"}
              </span>
              <span className="text-[10px] text-gray-500">
                {summary?.pendingWithdrawalsCount ?? 0} request
                {summary && summary.pendingWithdrawalsCount !== 1 && "s"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* KPI grid */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active deposits"
          value={
            summary ? formatCurrencyFromCents(summary.activeDepositsCents) : "--"
          }
          icon={<WalletIcon className="h-4 w-4" />}
          tone="neutral"
          hint="Total funded volume currently allocated to your account."
        />
        <KpiCard
          label="Total earnings"
          value={
            summary ? formatCurrencyFromCents(summary.totalEarningsCents) : "--"
          }
          icon={<TrendingUp className="h-4 w-4" />}
          tone="success"
          hint="Investment ROI and referral earnings credited so far."
        />
        <KpiCard
          label="Total deposits"
          value={
            summary ? formatCurrencyFromCents(summary.totalDepositsCents) : "--"
          }
          icon={<ArrowDownRight className="h-4 w-4" />}
          tone="neutral"
          hint="All successfully processed deposit transactions."
        />
        <KpiCard
          label="Total withdrawals"
          value={
            summary ? formatCurrencyFromCents(summary.totalWithdrawalsCents) : "--"
          }
          icon={<ArrowUpRight className="h-4 w-4" />}
          tone="warning"
          hint="All payouts that have been approved and completed."
        />
        <KpiCard
          label="Referral commission"
          value={
            summary
              ? formatCurrencyFromCents(summary.referralCommissionCents)
              : "--"
          }
          icon={<Users className="h-4 w-4" />}
          tone="neutral"
          hint="Earnings from your partner / referral structure."
        />
      </section>

      {/* Performance + quick actions */}
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1.1fr)]">
        {/* Performance chart */}
        <div className="rounded-2xl border border-gray-800 bg-black/80 px-5 py-5 text-gray-50">
          <div className="flex items-center justify-between mb-3 gap-2">
            <div>
              <p className="text-[11px] text-gray-400">Performance (last 14 days)</p>
              <h2 className="text-sm sm:text-base font-semibold">Daily net flows</h2>
            </div>
            <span className="text-[10px] text-gray-500">
              Includes deposits, withdrawals and ROI credits.
            </span>
          </div>

          {loadingSummary ? (
            <div className="h-40 flex items-center justify-center text-xs text-gray-400">
              Loading performance...
            </div>
          ) : !performanceSeries.length ? (
            <div className="h-40 flex items-center justify-center text-xs text-gray-400">
              No recent transaction activity to display yet.
            </div>
          ) : (
            <PerformanceChart
              min={performanceStats.min}
              max={performanceStats.max}
              points={performanceStats.points}
            />
          )}
        </div>

        {/* Activity / shortcuts */}
        <div className="rounded-2xl border border-gray-800 bg-black/80 px-5 py-5 text-gray-50 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-400">Shortcuts</p>
              <h2 className="text-sm sm:text-base font-semibold">Next actions</h2>
            </div>
          </div>

          <div className="space-y-3 text-[11px] sm:text-xs">
            <ShortcutRow
              href="/dashboard/deposit"
              icon={<WalletIcon className="h-4 w-4" />}
              title="Make a new deposit"
              description="Fund your balance and allocate to one of the live plans."
            />
            <ShortcutRow
              href="/dashboard/investments"
              icon={<Activity className="h-4 w-4" />}
              title="View active plans"
              description="Track all running investments and ROI accrual in real time."
            />
            <ShortcutRow
              href="/dashboard/referrals"
              icon={<Users className="h-4 w-4" />}
              title="Share referral link"
              description="Invite partners and earn layered commission from their activity."
            />
          </div>
        </div>
      </section>

      {/* TradingView charts for all trading pairs */}
      <section className="rounded-2xl border border-gray-800 bg-black/80 px-4 sm:px-5 py-4 sm:py-5 text-gray-50">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div>
            <p className="text-[11px] text-gray-400">Market overview</p>
            <h2 className="text-sm sm:text-base font-semibold">
              Live charts – BTC, ETH, USDT, GOLD, NAS100
            </h2>
          </div>
          <span className="hidden sm:inline text-[10px] text-gray-500">
            Powered by TradingView. Data is indicative only.
          </span>
        </div>

        <TradingViewMarkets />
      </section>
    </div>
  );
}

/* ---------- Smaller subcomponents inside the same file ---------- */

type KpiCardProps = {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone?: "neutral" | "success" | "warning";
  hint?: string;
};

function KpiCard({ label, value, icon, tone = "neutral", hint }: KpiCardProps) {
  const toneBorder =
    tone === "success"
      ? "border-emerald-500/50"
      : tone === "warning"
      ? "border-amber-500/50"
      : "border-gray-800/80";

  const toneAccent =
    tone === "success"
      ? "text-emerald-300"
      : tone === "warning"
      ? "text-amber-300"
      : "text-gray-50";

  return (
    <div
      className={`rounded-2xl border ${toneBorder} bg-black/75 px-4 py-4 flex flex-col gap-2 text-gray-50`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-gray-400">{label}</p>
        <div className="h-7 w-7 rounded-lg bg-black/70 border border-gray-800 flex items-center justify-center text-gray-300">
          {icon}
        </div>
      </div>
      <p className={`text-base sm:text-lg font-semibold ${toneAccent}`}>{value}</p>
      {hint && (
        <p className="text-[10px] text-gray-500 leading-snug">
          {hint}
        </p>
      )}
    </div>
  );
}

type PerformanceChartProps = {
  min: number;
  max: number;
  points: PerformancePoint[];
};

function PerformanceChart({ min, max, points }: PerformanceChartProps) {
  const width = 100;
  const height = 40;

  const pathD = useMemo(() => {
    if (!points.length) return "";

    const range = max - min || 1;
    const step = points.length > 1 ? width / (points.length - 1) : 0;

    const coords = points.map((p, idx) => {
      const x = idx * step;
      const normalized = (p.netChangeCents - min) / range;
      const y = height - normalized * height;
      return { x, y };
    });

    return coords
      .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
      .join(" ");
  }, [points, min, max, width, height]);

  const last = points[points.length - 1]?.netChangeCents || 0;
  const positive = last >= 0;

  return (
    <div className="mt-3">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-32 sm:h-40 text-accentGold"
        preserveAspectRatio="none"
      >
        {/* baseline */}
        <line
          x1={0}
          y1={height - 1}
          x2={width}
          y2={height - 1}
          className="stroke-gray-700"
          strokeWidth={0.4}
        />
        {/* path */}
        <path
          d={pathD}
          fill="none"
          className={positive ? "stroke-emerald-400" : "stroke-amber-300"}
          strokeWidth={1.2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

type QuickLinkProps = {
  href: string;
  title: string;
  description: string;
};

function QuickLink({ href, title, description }: QuickLinkProps) {
  return (
    <a
      href={href}
      className="group rounded-xl bg-black/60 border border-gray-800 px-3 py-2.5 flex flex-col gap-1 hover:border-accentGold/60 hover:bg-accentGold/5 transition"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium text-gray-50 text-[12px]">{title}</p>
        <ArrowRight className="h-3.5 w-3.5 text-gray-500 group-hover:text-accentGold transition" />
      </div>
      <p className="text-[11px] text-gray-400">{description}</p>
    </a>
  );
}

type ShortcutRowProps = {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
};

function ShortcutRow({ href, icon, title, description }: ShortcutRowProps) {
  return (
    <a
      href={href}
      className="flex items-start gap-3 rounded-lg px-3 py-2.5 hover:bg-black/70 border border-transparent hover:border-accentGold/40 transition"
    >
      <div className="mt-[2px] flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 border border-gray-700 text-gray-300">
        {icon}
      </div>
      <div className="flex flex-col gap-0.5">
        <p className="text-[12px] font-medium text-gray-50">{title}</p>
        <p className="text-[11px] text-gray-400">{description}</p>
      </div>
    </a>
  );
}

/* ---------- TradingView advanced widget with watchlist ---------- */

function TradingViewMarkets() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const widgetCreated = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!containerRef.current) return;
    if (widgetCreated.current) return; // avoid duplicate widget in StrictMode

    widgetCreated.current = true;

    function createWidget() {
      if (!(window as any).TradingView || !containerRef.current) return;

      // container_id must match the DOM element id
      new (window as any).TradingView.widget({
        container_id: "apex-tv-markets",
        autosize: true,
        symbol: "BINANCE:BTCUSDT",
        watchlist: [
          "BINANCE:BTCUSDT",
          "BINANCE:ETHUSDT",
          "OANDA:XAUUSD",
          "OANDA:NAS100USD",
          "CRYPTOCAP:USDT.D",
        ],
        interval: "60",
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#020617",
        hide_top_toolbar: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        save_image: false,
        withdateranges: true,
        studies: [],
      });
    }

    if (!(window as any).TradingView) {
      const script = document.createElement("script");
      script.id = "tradingview-widget-loader";
      script.src = "https://s3.tradingview.com/tv.js";
      script.async = true;
      script.onload = createWidget;
      document.head.appendChild(script);
    } else {
      createWidget();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      id="apex-tv-markets"
      className="h-[360px] sm:h-[400px] w-full rounded-xl border border-gray-800/80 bg-black/90 overflow-hidden"
    />
  );
}
