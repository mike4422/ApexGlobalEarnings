"use client";

import { useMemo, useState } from "react";

type PlanPresetKey = "standard" | "professional" | "premium" | "vip";

/* 🔥 ADDED minDeposit and maxDeposit for each plan */
const PLAN_PRESETS: Record<
  PlanPresetKey,
  { label: string; dailyRoi: number; duration: number; min: number; max: number }
> = {
  standard: {
    label: "Standard Plan",
    dailyRoi: 5,
    duration: 5,
    min: 200,
    max: 1999,
  },
  professional: {
    label: "Professional Plan",
    dailyRoi: 15,
    duration: 5,
    min: 2000,
    max: 29900,
  },
  premium: {
    label: "Premium Members",
    dailyRoi: 30,
    duration: 5,
    min: 30000,
    max: 300000,
  },
  vip: {
    label: "VIP Members",
    dailyRoi: 45,
    duration: 5,
    min: 301000,
    max: 1000000,
  },
};

export default function CalculatorSection() {
  const [amount, setAmount] = useState<string>("1000");
  const [dailyRoi, setDailyRoi] = useState<string>("5");
  const [duration, setDuration] = useState<string>("5");
  const [activePreset, setActivePreset] = useState<PlanPresetKey | null>("standard");

  /* ---------- Parsing ---------- */
  const parsedAmount = useMemo(() => {
    const value = parseFloat(amount.replace(/,/g, ""));
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }, [amount]);

  const parsedDailyRoi = useMemo(() => {
    const value = parseFloat(dailyRoi);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }, [dailyRoi]);

  const parsedDuration = useMemo(() => {
    const value = parseInt(duration, 10);
    return Number.isFinite(value) && value >= 0 ? value : 0;
  }, [duration]);

  /* ---------- Calculations ---------- */
  const dailyEarnings = useMemo(() => (parsedAmount * parsedDailyRoi) / 100, [
    parsedAmount,
    parsedDailyRoi,
  ]);

  const totalProfit = useMemo(() => dailyEarnings * parsedDuration, [
    dailyEarnings,
    parsedDuration,
  ]);

  const totalReturn = parsedAmount + totalProfit;

  /* 🔥 APPLY MIN / MAX WHEN CLICKING PRESETS */
  const handlePresetClick = (key: PlanPresetKey) => {
    const preset = PLAN_PRESETS[key];
    setDailyRoi(String(preset.dailyRoi));
    setDuration(String(preset.duration));
    setAmount(String(preset.min)); // 👈 default amount = minimum deposit
    setActivePreset(key);
  };

  const toCurrency = (value: number) =>
    value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });

  /* 🔥 Determine if user amount is valid for the selected plan */
  const activePlan = activePreset ? PLAN_PRESETS[activePreset] : null;
  const belowMin = activePlan && parsedAmount < activePlan.min;
  const aboveMax = activePlan && parsedAmount > activePlan.max;

  return (
    <section
      id="calculator"
      className="bg-bgAlt/40 border-t border-gray-800/70"
      aria-label="Earnings calculator"
    >
      <div className="w-full max-w-[1400px] mx-auto page-padding py-14 md:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_minmax(0,1fr)] items-start">
          {/* LEFT SIDE (unchanged) */}
          <div className="space-y-6 slide-up">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                Earnings Calculator
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
                Estimate your potential{" "}
                <span className="text-accentGold">returns in seconds.</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-300/90 max-w-xl">
                Use the calculator to understand how daily ROI and duration can
                impact your potential profit. Select one of the ApexGlobalEarnings
                plans or fine-tune the values manually to match your strategy.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 text-xs sm:text-sm">
              <div className="card-glow p-4 bg-black/40 border border-gray-800 text-gray-300">
                <p className="text-gray-400">Example:</p>
                <p className="mt-1 font-semibold">
                  Invest $1,000 into the Standard Plan → potential profit of{" "}
                  <span className="text-accentGreen">$250</span> over 5 days.
                </p>
              </div>
              <div className="card-glow p-4 bg-black/40 border border-gray-800 text-gray-300">
                <p className="text-gray-400">Flexible:</p>
                <p className="mt-1 font-semibold">
                  Adjust your deposit, daily ROI and duration to see how your
                  risk and reward profile changes.
                </p>
              </div>
              <div className="card-glow p-4 bg-black/40 border border-gray-800 text-gray-300">
                <p className="text-gray-400">Transparent:</p>
                <p className="mt-1 font-semibold">
                  The calculator mirrors how returns are computed inside your
                  live ApexGlobalEarnings dashboard.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE (calculator card) */}
          <div className="slide-up">
            <div className="card-glow bg-black/70 border border-gray-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">

              {/* PLAN PRESETS */}
              <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
                {(Object.keys(PLAN_PRESETS) as Array<PlanPresetKey>).map((key) => {
                  const preset = PLAN_PRESETS[key];
                  const isActive = activePreset === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handlePresetClick(key)}
                      className={`rounded-full px-3 py-1.5 border transition text-xs font-medium ${
                        isActive
                          ? "bg-accentGold text-black border-accentGold"
                          : "bg-black/40 border-gray-700 text-gray-200 hover:border-accentGold/70"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* FORM */}
              <div className="grid gap-4 sm:grid-cols-2 text-xs sm:text-sm">
                {/* AMOUNT INPUT */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-300/90">Investment amount (USD)</label>
                  <input
                    type="number"
                    min={0}
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setActivePreset(null); // manually editing disables preset
                    }}
                    className="rounded-lg border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60"
                  />
                  
                  {/* 🔥 DISPLAY MIN / MAX WARNINGS */}
                  {activePlan && belowMin && (
                    <span className="text-[10px] text-red-400 font-medium">
                      Minimum deposit for {activePlan.label} is ${activePlan.min.toLocaleString()}.
                    </span>
                  )}

                  {activePlan && aboveMax && (
                    <span className="text-[10px] text-red-400 font-medium">
                      Maximum deposit for {activePlan.label} is ${activePlan.max.toLocaleString()}.
                    </span>
                  )}
                </div>

                {/* DAILY ROI INPUT */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-300/90">Daily ROI (%)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={dailyRoi}
                    onChange={(e) => {
                      setDailyRoi(e.target.value);
                      setActivePreset(null);
                    }}
                    className="rounded-lg border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60"
                  />
                </div>

                {/* DURATION INPUT */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-300/90">Duration (days)</label>
                  <input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => {
                      setDuration(e.target.value);
                      setActivePreset(null);
                    }}
                    className="rounded-lg border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60"
                  />
                </div>

                {/* EFFECTIVE ROI */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-gray-300/90">Effective total ROI</label>
                  <div className="rounded-lg border border-gray-700 bg-black/60 px-3 py-2 flex justify-between text-gray-50">
                    <span>Approx.</span>
                    <span className="font-semibold text-accentGold">
                      {(parsedDailyRoi * parsedDuration).toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* RESULTS */}
              <div className="mt-2 rounded-xl bg-black/60 border border-gray-800 p-4 flex flex-col gap-3 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <p className="text-gray-300/90">Daily earnings</p>
                  <p className="font-semibold text-accentGreen">
                    {toCurrency(dailyEarnings)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-300/90">Total profit</p>
                  <p className="font-semibold text-accentGreen">
                    {toCurrency(totalProfit)}
                  </p>
                </div>
                <div className="flex justify-between">
                  <p className="text-gray-300/90">Total return</p>
                  <p className="font-semibold text-accentGold">
                    {toCurrency(totalReturn)}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
