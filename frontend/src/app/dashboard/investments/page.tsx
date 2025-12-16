"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Info,
  LineChart,
  Loader2,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

type ApiPlan = {
  id: number | string;
  name: string;
  slug?: string | null;
  minAmountCents?: number | null;
  maxAmountCents?: number | null;
  dailyRoiBps?: number | null;
  durationDays?: number | null;
  isActive?: boolean | null;
};

type PlanView = {
  id?: number | string;
  key: string;
  name: string;
  slug: string;
  minDeposit: number;
  maxDeposit: number;
  dailyReturn: number;
  durationDays: number;
};

type InvestmentWithPlan = {
  id: string;
  amountCents: number;
  status: "ACTIVE" | "COMPLETED" | "CANCELLED";
  startDate: string;
  endDate?: string | null;
  accruedReturnCents: number;
  plan: {
    id: number;
    name: string;
    slug: string;
    dailyRoiBps: number | null;
    durationDays: number | null;
  };
};

type OverviewResponse = {
  user?: {
    balance?: number; // USD
    balanceCents?: number; // optional if ever returned
  };
  kpis?: {
    totalBalance?: number; // USD
  };
  [key: string]: any;
};

const STATIC_PLANS: PlanView[] = [
  {
    key: "standard",
    name: "Standard Plan",
    slug: "standard",
    minDeposit: 200,
    maxDeposit: 1999,
    dailyReturn: 5,
    durationDays: 5,
  },
  {
    key: "professional",
    name: "Professional Plan",
    slug: "professional",
    minDeposit: 2000,
    maxDeposit: 29900,
    dailyReturn: 15,
    durationDays: 5,
  },
  {
    key: "premium",
    name: "Premium Members",
    slug: "premium",
    minDeposit: 30000,
    maxDeposit: 300000,
    dailyReturn: 30,
    durationDays: 5,
  },
  {
    key: "vip",
    name: "VIP Members",
    slug: "vip",
    minDeposit: 301000,
    maxDeposit: 1000000,
    dailyReturn: 45,
    durationDays: 5,
  },
  {
    key: "joint-portfolio",
    name: "Joint Portfolio",
    slug: "joint-portfolio",
    minDeposit: 3000,
    maxDeposit: 100000,
    dailyReturn: 15,
    durationDays: 10,
  },
];

function mergePlans(apiPlans: ApiPlan[] | null): PlanView[] {
  if (!apiPlans || apiPlans.length === 0) return STATIC_PLANS;

  // keep only active plans if backend sends isActive
  const activeApi = apiPlans.filter((p) => p.isActive !== false);

  const merged = STATIC_PLANS.map((base) => {
    const match = activeApi.find((p) => {
      const slugMatch = p.slug && p.slug.toLowerCase() === base.slug.toLowerCase();
      const nameMatch = p.name.toLowerCase() === base.name.toLowerCase();
      return slugMatch || nameMatch;
    });

    // ✅ IMPORTANT: if API exists and there is no match, do NOT expose this base plan
    if (!match) return null;

    const minUsd =
      typeof match.minAmountCents === "number" ? match.minAmountCents / 100 : base.minDeposit;

    const maxUsd =
      typeof match.maxAmountCents === "number" ? match.maxAmountCents / 100 : base.maxDeposit;

    const roiPercent =
      typeof match.dailyRoiBps === "number" ? match.dailyRoiBps / 100 : base.dailyReturn;

    const duration =
      typeof match.durationDays === "number" ? match.durationDays : base.durationDays;

    return {
      ...base,
      id: match.id,
      slug: (match.slug || base.slug), // ✅ use DB slug if present
      minDeposit: minUsd,
      maxDeposit: maxUsd,
      dailyReturn: roiPercent,
      durationDays: duration,
    };
  }).filter(Boolean) as PlanView[];

  // fallback: if nothing matched static list, build purely from API
  if (merged.length > 0) return merged;

  return activeApi.map((p) => ({
    key: String(p.slug || p.id),
    id: p.id,
    name: p.name,
    slug: String(p.slug || p.id),
    minDeposit: typeof p.minAmountCents === "number" ? p.minAmountCents / 100 : 0,
    maxDeposit: typeof p.maxAmountCents === "number" ? p.maxAmountCents / 100 : 999999999,
    dailyReturn: typeof p.dailyRoiBps === "number" ? p.dailyRoiBps / 100 : 0,
    durationDays: typeof p.durationDays === "number" ? p.durationDays : 0,
  }));
}


export default function InvestmentsPage() {
  const searchParams = useSearchParams();
  const initialPlanSlug = searchParams.get("plan");

  const [plans, setPlans] = useState<PlanView[]>([]);
  const [selectedPlanSlug, setSelectedPlanSlug] = useState<string | null>(
    initialPlanSlug
  );
  const [balanceUsd, setBalanceUsd] = useState<number>(0);
  const [investments, setInvestments] = useState<InvestmentWithPlan[]>([]);

  const [amount, setAmount] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load plans, overview (balance) and user investments
  useEffect(() => {
    async function loadData() {
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

        const [plansRes, overviewRes, invRes] = await Promise.all([
          apiFetch("/api/plans", {}, token),
          apiFetch("/api/dashboard/overview", {}, token),
          apiFetch("/api/investments/my", {}, token),
        ]);

        const merged = mergePlans(plansRes.plans || []);
        setPlans(merged);

        const overview = overviewRes as OverviewResponse;

        // ✅ FIX: read balance from the real API shape
        const balanceFromUser =
          typeof overview?.user?.balance === "number"
            ? overview.user.balance
            : typeof overview?.user?.balanceCents === "number"
            ? overview.user.balanceCents / 100
            : null;

        const balanceFromKpis =
          typeof overview?.kpis?.totalBalance === "number"
            ? overview.kpis.totalBalance
            : null;

        setBalanceUsd(balanceFromUser ?? balanceFromKpis ?? 0);

        setInvestments((invRes.investments || []) as InvestmentWithPlan[]);

        setError(null);

        // Preselect plan from query or default
        if (initialPlanSlug) {
          const found = merged.find(
            (p) => p.slug.toLowerCase() === initialPlanSlug.toLowerCase()
          );
          if (found) {
            setSelectedPlanSlug(found.slug);
            setAmount(found.minDeposit.toString());
          } else if (merged[0]) {
            setSelectedPlanSlug(merged[0].slug);
            setAmount(merged[0].minDeposit.toString());
          }
        } else if (merged[0]) {
          setSelectedPlanSlug(merged[0].slug);
          setAmount(merged[0].minDeposit.toString());
        }
      } catch (err: any) {
        console.error("Failed to load investments screen:", err);
        setError(
          err?.message || "Unable to load investments. Please try again shortly."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [initialPlanSlug]);

  const selectedPlan = useMemo(
    () =>
      plans.find(
        (p) => p.slug.toLowerCase() === (selectedPlanSlug || "").toLowerCase()
      ) || null,
    [plans, selectedPlanSlug]
  );

  function handlePlanChange(slug: string) {
    setSelectedPlanSlug(slug);
    const plan = plans.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
    if (plan) {
      setAmount(plan.minDeposit.toString());
    }
    setSuccess(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccess(null);
    setError(null);

    const token =
      typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    if (!selectedPlan) {
      setError("Please select an investment plan.");
      return;
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid investment amount.");
      return;
    }

    // Client-side validation for min/max
    if (numericAmount < selectedPlan.minDeposit) {
      setError(
        `Minimum for ${selectedPlan.name} is $${selectedPlan.minDeposit.toLocaleString()}.`
      );
      return;
    }
    if (numericAmount > selectedPlan.maxDeposit) {
      setError(
        `Maximum for ${selectedPlan.name} is $${selectedPlan.maxDeposit.toLocaleString()}.`
      );
      return;
    }

    if (numericAmount > balanceUsd) {
      setError(
        "Insufficient balance for this plan. Please deposit funds or choose a lower plan."
      );
      return;
    }

    try {
      setSubmitLoading(true);

      const res = await apiFetch(
        "/api/investments",
        {
          method: "POST",
          body: JSON.stringify({
            planId: selectedPlan.id, 
            planSlug: selectedPlan.slug,
            amountUsd: numericAmount,
          }),
        },
        token
      );

      // Expecting { investment }
      const created = res.investment as InvestmentWithPlan;
      setInvestments((prev) => [created, ...prev]);

      // Update local balance
      setBalanceUsd((prev) => prev - numericAmount);

      setSuccess(
        `Your investment of $${numericAmount.toLocaleString()} in ${selectedPlan.name} has started.`
      );
      setError(null);
    } catch (err: any) {
      console.error("Create investment error:", err);
      const msg: string =
        err?.message || "Unable to start investment. Please try again.";

      // Map specific messages to friendly hints
      if (msg.toLowerCase().includes("insufficient balance")) {
        setError(
          "You do not have enough available balance for this allocation. Please deposit or reduce the amount."
        );
      } else if (msg.toLowerCase().includes("upgrade to the next plan")) {
        setError(
          "You have already used this plan. To continue scaling, please upgrade to the next plan tier."
        );
      } else if (msg.toLowerCase().includes("minimum for this plan")) {
        setError(msg);
      } else if (msg.toLowerCase().includes("maximum for this plan")) {
        setError(msg);
      } else {
        setError(msg);
      }
    } finally {
      setSubmitLoading(false);
    }
  }

  const activeInvestments = investments.filter((inv) => inv.status === "ACTIVE");
  const completedInvestments = investments.filter(
    (inv) => inv.status === "COMPLETED"
  );

function getLiveProfit(inv: InvestmentWithPlan) {
  const amountUsd = inv.amountCents / 100;

  // ✅ bps -> fraction (500 => 0.05)
  const dailyRoiFraction =
    typeof inv.plan.dailyRoiBps === "number" ? inv.plan.dailyRoiBps / 10000 : 0;

  const durationDays =
    typeof inv.plan.durationDays === "number" ? inv.plan.durationDays : 0;

  if (!amountUsd || !dailyRoiFraction || !durationDays) {
    return { estimatedProfitUsd: 0, progress: 0 };
  }

  const start = new Date(inv.startDate);
  const endDate = inv.endDate
    ? new Date(inv.endDate)
    : new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000);

  const now = new Date();

  const totalMs = Math.max(1, endDate.getTime() - start.getTime());
  const elapsedMs = Math.min(Math.max(now.getTime() - start.getTime(), 0), totalMs);

  const progress = elapsedMs / totalMs;

  // ✅ total target profit for full duration (simple ROI)
  const totalTargetProfit = amountUsd * dailyRoiFraction * durationDays;

  // ✅ profit accrues smoothly over time (every minute/second)
  const estimatedProfitUsd = totalTargetProfit * progress;

  return { estimatedProfitUsd, progress };
}



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-lg sm:text-xl font-semibold text-gray-50">
            Investments
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 max-w-2xl">
            Allocate your balance into structured plans and track live performance.
            You can only complete each plan once before upgrading to the next tier.
          </p>
        </div>

        <div className="rounded-xl border border-gray-800 bg-black/70 px-4 py-2 text-xs sm:text-sm flex items-center gap-2">
          <LineChart className="h-4 w-4 text-accentGold" />
          <div className="flex flex-col leading-tight">
            <span className="text-gray-400 text-[11px]">Available balance</span>
            <span className="text-gray-50 font-semibold">
              ${balanceUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="rounded-2xl border border-gray-800/80 bg-black/70 px-4 py-4 flex items-center gap-2 text-xs text-gray-300">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Loading your plans and investments…</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-500/70 bg-red-500/10 px-4 py-3 flex gap-2 text-xs sm:text-sm text-red-100">
          <AlertCircle className="h-4 w-4 mt-[1px]" />
          <p>{error}</p>
        </div>
      )}

      {/* Success */}
      {success && (
        <div className="rounded-2xl border border-emerald-500/70 bg-emerald-500/10 px-4 py-3 flex gap-2 text-xs sm:text-sm text-emerald-100">
          <CheckCircle2 className="h-4 w-4 mt-[1px]" />
          <p>{success}</p>
        </div>
      )}

      {/* Main content grid */}
      {!loading && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)]">
          {/* Left: New investment form */}
          <div className="rounded-2xl border border-gray-800 bg-black/80 px-4 py-4 sm:px-5 sm:py-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-black/70 border border-accentGold/60 flex items-center justify-center">
                <LineChart className="h-4 w-4 text-accentGold" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-gray-50">
                  Start a new investment
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-400">
                  Select a plan, confirm the amount and allocate from your available
                  balance.
                </p>
              </div>
            </div>

            {/* Plan selector */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="plan" className="text-[11px] sm:text-xs text-gray-300">
                  Investment plan
                </label>
                <select
                  id="plan"
                  value={selectedPlanSlug || ""}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-black/70 px-3 py-2 text-xs sm:text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60"
                >
                  {plans.map((plan) => (
                    <option key={plan.slug} value={plan.slug}>
                      {plan.name} — min ${plan.minDeposit.toLocaleString()} / daily{" "}
                      {plan.dailyReturn.toFixed(0)}% · {plan.durationDays} days
                    </option>
                  ))}
                </select>
              </div>

              {/* Constraints summary */}
              {selectedPlan && (
                <div className="grid grid-cols-2 gap-3 text-[11px] sm:text-xs">
                  <div className="rounded-xl border border-gray-800 bg-black/60 px-3 py-2 flex flex-col gap-0.5">
                    <span className="text-gray-400">Min / Max allocation</span>
                    <span className="text-gray-50 font-semibold">
                      ${selectedPlan.minDeposit.toLocaleString()} – $
                      {selectedPlan.maxDeposit.toLocaleString()}
                    </span>
                  </div>
                  <div className="rounded-xl border border-gray-800 bg-black/60 px-3 py-2 flex flex-col gap-0.5">
                    <span className="text-gray-400">Cycle &amp; target ROI</span>
                    <span className="text-gray-50 font-semibold">
                      {selectedPlan.dailyReturn.toFixed(0)}% daily ·{" "}
                      {selectedPlan.durationDays} days
                    </span>
                  </div>
                </div>
              )}

              {/* Amount input */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="amount" className="text-[11px] sm:text-xs text-gray-300">
                  Investment amount (USD)
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs text-gray-500">
                    $
                  </span>
                  <input
                    id="amount"
                    type="number"
                    min={selectedPlan?.minDeposit ?? 0}
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full rounded-lg border border-gray-700 bg-black/70 pl-6 pr-3 py-2 text-xs sm:text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60"
                    placeholder={selectedPlan ? selectedPlan.minDeposit.toString() : "0.00"}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>
                    Available: $
                    {balanceUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </span>
                  {selectedPlan && (
                    <span>
                      Target daily profit: ~$
                      {(
                        (Number(amount || 0) || 0) *
                        (selectedPlan.dailyReturn / 100)
                      ).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </span>
                  )}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="rounded-xl border border-gray-800 bg-black/60 px-3 py-2 text-[10px] sm:text-[11px] text-gray-400 flex gap-2">
                <Info className="h-3.5 w-3.5 mt-[1px] text-gray-500" />
                <p>
                  Once started, your capital remains allocated for the full plan
                  duration. Profits accrue over time and become withdrawable once
                  the plan completes.
                </p>
              </div>

              {/* Submit */}
              <div className="pt-1">
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-accentGold text-black px-4 py-2.5 text-xs sm:text-sm font-semibold hover:bg-yellow-400 transition disabled:opacity-75"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Starting investment…</span>
                    </>
                  ) : (
                    <>
                      <span>Start investment</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right: Active + completed investments */}
          <div className="space-y-4">
            {/* Active investments */}
            <div className="rounded-2xl border border-gray-800 bg-black/80 px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-gray-50">
                    Active investments
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-400">
                    Live positions showing estimated profit progression until completion.
                  </p>
                </div>
              </div>

              {activeInvestments.length === 0 ? (
                <p className="text-[11px] sm:text-xs text-gray-500">
                  You do not have any active investments yet. Start a plan on the left
                  to see it appear here.
                </p>
              ) : (
                <div className="space-y-3">
                  {activeInvestments.map((inv) => {
                    const { estimatedProfitUsd, progress } = getLiveProfit(inv);
                    const amountUsd = inv.amountCents / 100;
                    const dailyRoi = (inv.plan.dailyRoiBps ?? 0) / 10000; // ✅ fraction (0.05)
                    const durationDays = inv.plan.durationDays ?? 0;
                    const targetProfit = amountUsd * dailyRoi * durationDays;

                    return (
                      <div
                        key={inv.id}
                        className="rounded-xl border border-gray-800 bg-black/60 px-3 py-3 text-[11px] sm:text-xs flex flex-col gap-2"
                      >
                        <div className="flex justify-between gap-2">
                          <div>
                            <p className="text-gray-50 font-medium">{inv.plan.name}</p>
                            <p className="text-gray-400">
                              Amount: $
                              {amountUsd.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400">Est. profit</p>
                            <p className="text-accentGold font-semibold">
                              $
                              {estimatedProfitUsd.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                              <span className="text-[10px] text-gray-500 ml-1">
                                / $
                                {targetProfit.toLocaleString(undefined, {
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-gray-800 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-accentGold"
                              style={{
                                width: `${Math.max(
                                  3,
                                  Math.min(progress * 100, 100)
                                ).toFixed(1)}%`,
                              }}
                            />
                          </div>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {Math.round(progress * 100)}% complete
                          </span>
                        </div>

                        <p className="text-[10px] text-gray-500">
                          Started {new Date(inv.startDate).toLocaleString()} · duration{" "}
                          {durationDays} days · target daily{` ${(dailyRoi * 100).toFixed(0)}%`}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Completed investments */}
            <div className="rounded-2xl border border-gray-800 bg-black/80 px-4 py-4 sm:px-5 sm:py-5">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div>
                  <h2 className="text-sm sm:text-base font-semibold text-gray-50">
                    Completed investments
                  </h2>
                  <p className="text-[11px] sm:text-xs text-gray-400">
                    Plans that have reached full duration. Profits are available for
                    withdrawal while capital continues to be used for ongoing trading.
                  </p>
                </div>
              </div>

              {completedInvestments.length === 0 ? (
                <p className="text-[11px] sm:text-xs text-gray-500">
                  You do not have any completed investments yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {completedInvestments.map((inv) => {
                    const amountUsd = inv.amountCents / 100;
                    const profitUsd = inv.accruedReturnCents / 100;

                    return (
                      <div
                        key={inv.id}
                        className="rounded-xl border border-gray-800 bg-black/60 px-3 py-3 text-[11px] sm:text-xs flex flex-col gap-2"
                      >
                        <div className="flex justify-between gap-2">
                          <div>
                            <p className="text-gray-50 font-medium">{inv.plan.name}</p>
                            <p className="text-gray-400">
                              Capital: $
                              {amountUsd.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-gray-400">Profit realised</p>
                            <p className="text-emerald-400 font-semibold">
                              $
                              {profitUsd.toLocaleString(undefined, {
                                maximumFractionDigits: 2,
                              })}
                            </p>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-500">
                          Completed on{" "}
                          {inv.endDate ? new Date(inv.endDate).toLocaleString() : "—"}.
                          You can withdraw the profit from the Withdraw section while
                          your capital stays allocated.
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
