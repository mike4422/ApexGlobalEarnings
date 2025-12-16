"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Crown,
  Layers,
  ShieldCheck,
  Star,
  TrendingUp,
  Info,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type ApiPlan = {
  id: number | string;
  name: string;
  slug?: string | null;
  minAmountCents?: number | null;
  dailyRoiBps?: number | null;
  durationDays?: number | null;
  isActive?: boolean | null;
};

type PlanCard = {
  key: string;
  name: string;
  slug: string;
  highlightLabel?: string;
  minDeposit: number;
  maxDeposit: number;
  dailyReturn: number;
  durationDays: number;
  accentGradient: string;
  accentBorder: string;
  badgeVariant?: "popular" | "vip";
  description: string;
  bullets: string[];
  strategySummary: string;
  strategyPoints: string[];
};

const STATIC_PLANS: PlanCard[] = [
  {
    key: "standard",
    name: "Standard Plan",
    slug: "standard",
    minDeposit: 200,
    maxDeposit: 1999,
    dailyReturn: 5,
    durationDays: 5,
    accentGradient:
      "from-slate-900 via-slate-900/90 to-slate-800/80",
    accentBorder: "border-slate-700/80",
    description:
      "Entry-level account designed for disciplined investors testing our strategies with smaller capital.",
    bullets: [
      "Capital locked for 5 days",
      "Daily profit credited to dashboard",
      "Ideal for first-time ApexGlobalEarnings users",
    ],
    strategySummary:
      "The Standard Plan focuses on capital preservation with controlled exposure and fixed 5-day cycles.",
    strategyPoints: [
      "Shorter holding period to keep risk contained and liquidity flexible.",
      "Lower capital brackets to help you test the platform before scaling.",
      "Daily ROI generated from short-term trading cycles across selected crypto and market indices.",
      "Automatic closure at the end of 5 days, with profits reflected on your dashboard.",
    ],
  },
  {
    key: "professional",
    name: "Professional Plan",
    slug: "professional",
    minDeposit: 2000,
    maxDeposit: 29900,
    dailyReturn: 15,
    durationDays: 5,
    accentGradient:
      "from-amber-900/40 via-amber-800/40 to-slate-900",
    accentBorder: "border-amber-500/70",
    badgeVariant: "popular",
    description:
      "Optimised for active traders and investors scaling capital with higher daily returns.",
    bullets: [
      "Higher limits and enhanced monitoring",
      "Priority execution and support",
      "Balanced risk–reward profile",
    ],
    strategySummary:
      "The Professional Plan scales your exposure with tighter execution and more aggressive allocation.",
    strategyPoints: [
      "Capital is distributed across intraday and swing strategies on major crypto pairs and indices.",
      "Tighter monitoring with internal risk thresholds per session.",
      "Best suited for investors who already understand short-term volatility.",
      "Designed to be your natural upgrade path after completing the Standard Plan.",
    ],
  },
  {
    key: "premium",
    name: "Premium Members",
    slug: "premium",
    minDeposit: 30000,
    maxDeposit: 300000,
    dailyReturn: 30,
    durationDays: 5,
    accentGradient:
      "from-purple-900/50 via-purple-800/40 to-slate-900",
    accentBorder: "border-purple-500/70",
    description:
      "Reserved for high-net-worth members focusing on strong short-term growth and diversified exposure.",
    bullets: [
      "Dedicated account monitoring",
      "Structured scaling across assets",
      "Tailored capital allocation ranges",
    ],
    strategySummary:
      "The Premium Plan targets amplified returns using diversified, multi-asset allocation.",
    strategyPoints: [
      "Capital is split across crypto, metals and index strategies to spread risk.",
      "Dynamic allocation engine adjusts exposure based on volatility and liquidity.",
      "Designed for experienced investors comfortable with high short-term swings.",
      "Recommended as a progression after completing the Professional Plan.",
    ],
  },
  {
    key: "vip",
    name: "VIP Members",
    slug: "vip",
    minDeposit: 301000,
    maxDeposit: 1000000,
    dailyReturn: 45,
    durationDays: 5,
    accentGradient:
      "from-yellow-500/15 via-amber-500/10 to-slate-900",
    accentBorder: "border-yellow-500/70",
    badgeVariant: "vip",
    description:
      "Exclusive VIP allocation for large portfolios seeking aggressive short-term performance.",
    bullets: [
      "Priority routing and risk review",
      "Highest capital brackets",
      "Direct line to account specialists",
    ],
    strategySummary:
      "The VIP Plan provides the most aggressive short-term allocation for qualified capital.",
    strategyPoints: [
      "Capital concentrated across a curated set of high-conviction strategies.",
      "Dedicated internal oversight and manual review on large flows.",
      "Higher daily ROI targets with strict internal risk controls.",
      "Designed as the final tier for investors who have progressed through lower plans.",
    ],
  },
  {
    key: "joint-portfolio",
    name: "Joint Portfolio",
    slug: "joint-portfolio",
    minDeposit: 3000,
    maxDeposit: 100000,
    dailyReturn: 15,
    durationDays: 10,
    accentGradient:
      "from-emerald-900/40 via-emerald-800/40 to-slate-900",
    accentBorder: "border-emerald-500/70",
    badgeVariant: "popular",
    description:
      "Collaborative allocation structure where multiple investors pool capital into a managed portfolio.",
    bullets: [
      "Pooled exposure with structured risk",
      "Extended 10-day growth cycle",
      "Designed for joint investors & partners",
    ],
    strategySummary:
      "The Joint Portfolio Plan pools capital from multiple investors into a single professionally managed structure.",
    strategyPoints: [
      "Capital is aggregated and allocated across diversified strategies under one portfolio.",
      "10-day cycles allow longer-term positioning compared to standard plans.",
      "Suitable for partners, families, or syndicates investing together.",
      "Ideal as an intermediate step for those upgrading from Professional or Standard tiers.",
    ],
  },
];

export default function PlansPage() {
  const router = useRouter();

  const [apiPlans, setApiPlans] = useState<ApiPlan[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [strategyOpen, setStrategyOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanCard | null>(null);

  // Load plans from backend (for alignment with DB config)
  useEffect(() => {
    async function loadPlans() {
      try {
        const token =
          typeof window !== "undefined"
            ? window.localStorage.getItem("token")
            : null;
        if (!token) {
          setError("You are not logged in.");
          setLoading(false);
          return;
        }

        const data = await apiFetch("/api/plans", {}, token);
        setApiPlans((data.plans || []) as ApiPlan[]);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load plans:", err);
        setError(
          err?.message ||
            "Unable to load plans. Please try again shortly."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlans();
  }, []);

  const mergedPlans: PlanCard[] = useMemo(() => {
    if (!apiPlans || apiPlans.length === 0) {
      // Fallback to static definitions only
      return STATIC_PLANS;
    }

    return STATIC_PLANS.map((base) => {
      const match = apiPlans.find((p) => {
        const slugMatch =
          p.slug &&
          p.slug.toLowerCase() === base.slug.toLowerCase();
        const nameMatch =
          p.name.toLowerCase() === base.name.toLowerCase();
        return slugMatch || nameMatch;
      });

      if (!match) return base;

      const minUsd =
        typeof match.minAmountCents === "number"
          ? match.minAmountCents / 100
          : base.minDeposit;
      const roiPercent =
        typeof match.dailyRoiBps === "number"
          ? match.dailyRoiBps / 100
          : base.dailyReturn;
      const duration =
        typeof match.durationDays === "number"
          ? match.durationDays
          : base.durationDays;

      return {
        ...base,
        minDeposit: minUsd,
        dailyReturn: roiPercent,
        durationDays: duration,
      };
    });
  }, [apiPlans]);

  function openStrategy(plan: PlanCard) {
    setSelectedPlan(plan);
    setStrategyOpen(true);
  }

  function closeStrategy() {
    setStrategyOpen(false);
    setSelectedPlan(null);
  }

  function handleStartInvestment(plan: PlanCard) {
    // Navigate to investments page with plan pre-selected
    router.push(
      `/dashboard/investments?plan=${encodeURIComponent(plan.slug)}`
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-50">
              Investment Plans
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl">
              Choose the account type that aligns with your capital and
              risk tolerance. All plans are managed from your
              ApexGlobalEarnings dashboard with full visibility on returns.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-gray-400">
            <ShieldCheck className="h-3.5 w-3.5 text-accentGold" />
            <span>
              Returns are indicative and depend on live market
              conditions. 90% ROI guaranteed.
            </span>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="rounded-2xl border border-gray-800/80 bg-black/70 px-4 py-4 text-xs text-gray-300">
            Loading plans…
          </div>
        )}

        {error && !loading && (
          <div className="rounded-2xl border border-red-500/70 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-100">
            {error}
          </div>
        )}

        {/* Plans grid */}
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {mergedPlans.map((plan) => {
            const isPopular = plan.badgeVariant === "popular";
            const isVip = plan.badgeVariant === "vip";

            return (
              <div
                key={plan.key}
                className={`relative rounded-2xl border ${plan.accentBorder} bg-gradient-to-br ${plan.accentGradient} px-4 py-4 sm:px-5 sm:py-5 shadow-[0_18px_45px_rgba(0,0,0,0.65)] flex flex-col gap-3.5`}
              >
                {/* Badge */}
                {(isPopular || isVip) && (
                  <div className="absolute right-4 top-3 flex items-center gap-1 rounded-full border border-amber-400/70 bg-amber-500/15 px-2.5 py-[3px] text-[10px] font-medium text-amber-100">
                    {isVip ? (
                      <Crown className="h-3.5 w-3.5" />
                    ) : (
                      <Star className="h-3.5 w-3.5" />
                    )}
                    <span>{isVip ? "VIP Tier" : "Most popular"}</span>
                  </div>
                )}

                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2">
                      <Layers className="h-4 w-4 text-accentGold" />
                      <h2 className="text-sm sm:text-base font-semibold text-gray-50">
                        {plan.name}
                      </h2>
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-400 max-w-xs">
                      {plan.description}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] text-gray-400">
                      Daily return
                    </p>
                    <p className="text-base sm:text-lg font-semibold text-accentGold">
                      {plan.dailyReturn.toFixed(0)}%
                      <span className="text-[11px] text-gray-400 font-normal">
                        {" "}
                        / day
                      </span>
                    </p>
                  </div>
                </div>

                {/* Numbers */}
                <div className="grid grid-cols-2 gap-3 text-[11px] sm:text-xs">
                  <div className="rounded-xl border border-gray-800/70 bg-black/40 px-3 py-2.5 flex flex-col gap-0.5">
                    <span className="text-gray-400">
                      Minimum deposit
                    </span>
                    <span className="text-gray-50 font-semibold">
                      ${plan.minDeposit.toLocaleString()}
                    </span>
                  </div>
                  <div className="rounded-xl border border-gray-800/70 bg-black/40 px-3 py-2.5 flex flex-col gap-0.5">
                    <span className="text-gray-400">
                      Maximum deposit
                    </span>
                    <span className="text-gray-50 font-semibold">
                      ${plan.maxDeposit.toLocaleString()}
                    </span>
                  </div>
                  <div className="rounded-xl border border-gray-800/70 bg-black/40 px-3 py-2.5 flex flex-col gap-0.5">
                    <span className="text-gray-400">Duration</span>
                    <span className="text-gray-50 font-semibold">
                      {plan.durationDays} days
                    </span>
                  </div>
                  <div className="rounded-xl border border-gray-800/70 bg-black/40 px-3 py-2.5 flex flex-col gap-0.5">
                    <span className="text-gray-400">
                      Projected total
                    </span>
                    <span className="text-gray-50 font-semibold">
                      ~
                      {(
                        plan.minDeposit *
                        (1 +
                          (plan.dailyReturn / 100) *
                            plan.durationDays)
                      ).toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>

                {/* Highlights */}
                <ul className="space-y-1.5 text-[11px] sm:text-xs text-gray-300 mt-1">
                  {plan.bullets.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-1.5"
                    >
                      <span className="mt-[5px] h-1 w-1 rounded-full bg-accentGold"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="mt-2 flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStartInvestment(plan)}
                    className="inline-flex items-center justify-center rounded-lg bg-accentGold text-black px-3.5 py-2 text-xs sm:text-sm font-semibold hover:bg-yellow-400 transition"
                  >
                    Start with $
                    {plan.minDeposit.toLocaleString()}
                  </button>
                  <button
                    type="button"
                    onClick={() => openStrategy(plan)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-gray-700 bg-black/40 px-3.5 py-1.5 text-[11px] text-gray-300 hover:border-accentGold/70 hover:text-accentGold transition"
                  >
                    <TrendingUp className="h-3.5 w-3.5" />
                    <span>View strategy details</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Risk note */}
        <div className="mt-2 rounded-2xl border border-gray-800/80 bg-black/70 px-4 py-3 text-[11px] sm:text-xs text-gray-400 flex gap-2">
          <Info className="h-3.5 w-3.5 text-gray-500 mt-[2px]" />
           <p>
          Returns are %90 guaranteed. Trading involve risk and it our responsibility to reduce the risk and give you a guaranteed return.
           Ensure each plan matches your objectives.
        </p>
        </div>
      </div>

      {/* Strategy modal */}
      {strategyOpen && selectedPlan && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg rounded-2xl border border-gray-800 bg-gradient-to-br from-black via-slate-950 to-slate-900 px-5 py-4 sm:px-6 sm:py-5 shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative">
            <button
              type="button"
              onClick={closeStrategy}
              className="absolute right-4 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full border border-gray-700 bg-black/70 text-gray-300 hover:border-accentGold hover:text-accentGold transition"
              aria-label="Close strategy details"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="flex items-start gap-3 mb-3.5">
              <div className="h-9 w-9 rounded-xl bg-black/70 border border-accentGold/60 flex items-center justify-center">
                <Layers className="h-4 w-4 text-accentGold" />
              </div>
              <div className="space-y-0.5">
                <h2 className="text-sm sm:text-base font-semibold text-gray-50">
                  {selectedPlan.name} – Strategy overview
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-400 max-w-md">
                  {selectedPlan.strategySummary}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-[11px] sm:text-xs text-gray-300">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-gray-800 bg-black/50 px-3 py-2 flex flex-col gap-0.5">
                  <span className="text-gray-400">Capital range</span>
                  <span className="text-gray-50 font-semibold">
                    ${selectedPlan.minDeposit.toLocaleString()} – $
                    {selectedPlan.maxDeposit.toLocaleString()}
                  </span>
                </div>
                <div className="rounded-xl border border-gray-800 bg-black/50 px-3 py-2 flex flex-col gap-0.5">
                  <span className="text-gray-400">Cycle &amp; ROI</span>
                  <span className="text-gray-50 font-semibold">
                    {selectedPlan.dailyReturn.toFixed(0)}% daily ·{" "}
                    {selectedPlan.durationDays} days
                  </span>
                </div>
              </div>

              <p className="text-[11px] sm:text-xs text-gray-400 mt-1">
                How this plan is typically managed:
              </p>
              <ul className="space-y-1.5">
                {selectedPlan.strategyPoints.map((pt) => (
                  <li
                    key={pt}
                    className="flex items-start gap-1.5"
                  >
                    <span className="mt-[5px] h-1 w-1 rounded-full bg-accentGold"></span>
                    <span>{pt}</span>
                  </li>
                ))}
              </ul>

              <p className="text-[10px] text-gray-500 mt-1.5">
                Note: Strategy descriptions are indicative of how the
                plan is structured internally. Market conditions may
                require adjustments to execution and allocation.
              </p>
            </div>

            <div className="mt-4 flex flex-col sm:flex-row sm:justify-end gap-2">
              <button
                type="button"
                onClick={closeStrategy}
                className="inline-flex items-center justify-center rounded-lg border border-gray-700 bg-black/60 px-3.5 py-1.5 text-[11px] sm:text-xs text-gray-300 hover:border-accentGold/70 hover:text-accentGold transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedPlan) {
                    handleStartInvestment(selectedPlan);
                  }
                }}
                className="inline-flex items-center justify-center rounded-lg bg-accentGold text-black px-3.5 py-1.5 text-[11px] sm:text-xs font-semibold hover:bg-yellow-400 transition"
              >
                Proceed to invest
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
