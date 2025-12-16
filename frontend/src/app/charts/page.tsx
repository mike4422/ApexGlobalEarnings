"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LineChart, MonitorPlay, Activity, Clock3 } from "lucide-react";

type SymbolKey =
  | "BTCUSDT"
  | "ETHUSDT"
  | "SOLUSDT"
  | "XRPUSDT"
  | "XAUUSD"
  | "XAGUSD"
  | "NAS100"
  | "US30"
  | "SPX500"
  | "EURUSD"
  | "GBPUSD"
  | "USDJPY"
  | "AUDUSD";

const SYMBOL_CONFIG: Record<
  SymbolKey,
  { label: string; tvSymbol: string; category: string; description: string }
> = {
  BTCUSDT: {
    label: "BTC / USDT",
    tvSymbol: "BINANCE:BTCUSDT",
    category: "Crypto",
    description: "Bitcoin vs Tether – high-liquidity crypto benchmark pair.",
  },
  ETHUSDT: {
    label: "ETH / USDT",
    tvSymbol: "BINANCE:ETHUSDT",
    category: "Crypto",
    description: "Ethereum vs Tether – second-largest crypto asset.",
  },
  SOLUSDT: {
    label: "SOL / USDT",
    tvSymbol: "BINANCE:SOLUSDT",
    category: "Crypto",
    description: "Solana vs Tether – high-performance chain with active liquidity.",
  },
  XRPUSDT: {
    label: "XRP / USDT",
    tvSymbol: "BINANCE:XRPUSDT",
    category: "Crypto",
    description: "XRP vs Tether – cross-border settlement asset with deep volume.",
  },
  XAUUSD: {
    label: "XAU / USD",
    tvSymbol: "OANDA:XAUUSD",
    category: "Metals",
    description: "Spot gold vs US dollar – classic safe-haven market.",
  },
  XAGUSD: {
    label: "XAG / USD",
    tvSymbol: "OANDA:XAGUSD",
    category: "Metals",
    description: "Spot silver vs US dollar – secondary precious metal exposure.",
  },
  NAS100: {
    label: "NAS100",
    tvSymbol: "OANDA:NAS100USD",
    category: "Index",
    description: "US Tech 100 index – exposure to leading technology stocks.",
  },
  US30: {
    label: "US30",
    tvSymbol: "OANDA:US30USD",
    category: "Index",
    description: "Dow Jones 30 – basket of major US blue-chip companies.",
  },
  SPX500: {
    label: "SPX500",
    tvSymbol: "OANDA:SPX500USD",
    category: "Index",
    description: "S&P 500 – broad exposure to 500 US large-cap stocks.",
  },
  EURUSD: {
    label: "EUR / USD",
    tvSymbol: "OANDA:EURUSD",
    category: "Forex",
    description: "Euro vs US Dollar – the most traded FX pair worldwide.",
  },
  GBPUSD: {
    label: "GBP / USD",
    tvSymbol: "OANDA:GBPUSD",
    category: "Forex",
    description: "British Pound vs US Dollar – popular major FX pair.",
  },
  USDJPY: {
    label: "USD / JPY",
    tvSymbol: "OANDA:USDJPY",
    category: "Forex",
    description: "US Dollar vs Japanese Yen – key FX pair for global traders.",
  },
  AUDUSD: {
    label: "AUD / USD",
    tvSymbol: "OANDA:AUDUSD",
    category: "Forex",
    description: "Australian Dollar vs US Dollar – commodity-linked FX pair.",
  },
};


const TIMEFRAMES = ["1", "5", "15", "60", "240", "D"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

/**
 * TradingView chart wrapper.
 * Loads the TradingView script once and re-initializes whenever symbol / timeframe change.
 */
function TradingViewChart({
  symbol,
  interval,
}: {
  symbol: SymbolKey;
  interval: Timeframe;
}) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const containerId = "tv_chart_container";

    const loadWidget = () => {
      const tv = (window as any).TradingView;
      if (!tv || !document.getElementById(containerId)) return;

      // Clear previous instance
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = "";
      }

      new tv.widget({
        autosize: true,
        symbol: SYMBOL_CONFIG[symbol].tvSymbol,
        interval: interval,
        timeframe: undefined,
        container_id: containerId,
        theme: "dark",
        style: "1",
        toolbar_bg: "#050816",
        hide_top_toolbar: false,
        hide_legend: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        locale: "en",
        withdateranges: true,
        studies: [],
      });
    };

    // If script already loaded, just init widget
    if ((window as any).TradingView) {
      loadWidget();
      return;
    }

    // Otherwise inject script
    const scriptId = "tradingview-widget-script";
    const existingScript = document.getElementById(scriptId) as
      | HTMLScriptElement
      | null;

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://s3.tradingview.com/tv.js";
      script.type = "text/javascript";
      script.async = true;
      script.onload = () => {
        loadWidget();
      };
      document.head.appendChild(script);
    } else if (existingScript && (window as any).TradingView) {
      loadWidget();
    }

    return () => {
      const container = document.getElementById(containerId);
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [symbol, interval]);

  return (
    <div className="relative h-[420px] sm:h-[480px] lg:h-[560px] rounded-2xl overflow-hidden border border-gray-800 bg-black/80">
      <div id="tv_chart_container" className="h-full w-full" />
    </div>
  );
}

export default function TradingChartsPage() {
  const [activeSymbol, setActiveSymbol] = useState<SymbolKey>("BTCUSDT");
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>("60");

  const current = SYMBOL_CONFIG[activeSymbol];

  return (
    <div className="bg-bg min-h-screen">
      {/* ---------------- HERO / INTRO ---------------- */}
      <section className="bg-bgAlt/40 border-b border-gray-800/70">
        <div className="w-full max-w-[1400px] mx-auto page-padding pt-24 pb-10 md:pt-28 md:pb-12 lg:pb-14">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
            {/* Left: copy */}
            <div className="space-y-4 slide-up">
              <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                Trading Charts
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
                Monitor{" "}
                <span className="text-accentGold">
                  live markets in real time
                </span>{" "}
                directly from your ApexGlobalEarnings dashboard.
              </h1>
              <p className="text-sm sm:text-base text-gray-300/90 max-w-xl">
                Use professional TradingView charts to track crypto, metals and
                indices. Combine live market analysis with your ApexGlobalEarnings
                investment plans and referral income for a complete view of your
                capital.
              </p>

              <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/50 border border-gray-800 px-3 py-1">
                  <LineChart className="h-3.5 w-3.5 text-accentGreen" />
                  <span>TradingView chart integration</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/50 border border-gray-800 px-3 py-1">
                  <MonitorPlay className="h-3.5 w-3.5 text-accentGold" />
                  <span>Multiple markets &amp; timeframes</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/50 border border-gray-800 px-3 py-1">
                  <Activity className="h-3.5 w-3.5 text-accentGreen" />
                  <span>Real-time price action</span>
                </div>
              </div>
            </div>

            {/* Right: info card */}
            <div className="slide-up">
              <div className="card-glow bg-black/75 border border-gray-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                      Active symbol
                    </p>
                    <h2 className="text-sm sm:text-base font-semibold text-gray-50">
                      {current.label} · {current.category}
                    </h2>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-accentGold/10 border border-accentGold/40 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-accentGold" />
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-gray-300/90">
                  {current.description} Use the tabs below the chart to quickly
                  switch between markets and intraday/daily timeframes.
                </p>
                <div className="grid gap-3 sm:grid-cols-2 text-[11px] sm:text-xs">
                  <div className="rounded-lg bg-black/70 border border-gray-800 p-3">
                    <p className="text-gray-300/80">Ideal for</p>
                    <p className="mt-1 font-semibold text-accentGreen">
                      Active traders &amp; plan holders
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Combine chart analysis with structured ROI plans.
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/70 border border-gray-800 p-3">
                    <p className="text-gray-300/80">Best practice</p>
                    <p className="mt-1 font-semibold text-accentGold">
                      Align timeframes with your strategy
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      For short-term ideas, focus on 5–15m and 1H candles.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-gray-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  <span>
                    Price data and charting is provided by TradingView; actual
                    execution conditions are visible inside your live trading
                    account.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- MAIN CHART AREA ---------------- */}
      <section className="bg-bg">
        <div className="w-full max-w-[1400px] mx-auto page-padding py-10 md:py-12 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,0.9fr)] items-start">
            {/* Chart + controls */}
            <div className="space-y-4 slide-up">
              {/* Symbol tabs */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
                  {(Object.keys(SYMBOL_CONFIG) as SymbolKey[]).map((key) => {
                    const s = SYMBOL_CONFIG[key];
                    const active = activeSymbol === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveSymbol(key)}
                        className={`rounded-full px-3.5 py-1.5 border transition font-medium ${
                          active
                            ? "bg-accentGold text-black border-accentGold"
                            : "bg-black/40 border-gray-700 text-gray-200 hover:border-accentGold/70"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Timeframe buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
                  {TIMEFRAMES.map((tf) => {
                    const active = activeTimeframe === tf;
                    return (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => setActiveTimeframe(tf)}
                        className={`rounded-full px-2.5 py-1 border transition ${
                          active
                            ? "bg-accentGold text-black border-accentGold"
                            : "bg-black/40 border-gray-700 text-gray-200 hover:border-accentGold/70"
                        }`}
                      >
                        {tf === "D" ? "1D" : `${tf}m`}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-500">
                  Timeframe is applied to the TradingView chart in real-time.
                </p>
              </div>

              {/* TradingView chart */}
              <TradingViewChart
                symbol={activeSymbol}
                interval={activeTimeframe}
              />
            </div>

            {/* Right column: watchlist / info */}
            <div className="space-y-5 slide-up">
              {/* Watchlist */}
              <div className="card-glow bg-black/75 border border-gray-800 rounded-2xl p-4 sm:p-5 flex flex-col gap-3 text-xs sm:text-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                      Quick market overview
                    </p>
                    <h3 className="text-sm font-semibold text-gray-50">
                      Key ApexGlobalEarnings markets.
                    </h3>
                  </div>
                  <LineChart className="h-4 w-4 text-accentGold" />
                </div>

                <div className="space-y-2 mt-1">
                  {(Object.keys(SYMBOL_CONFIG) as SymbolKey[]).map((key) => {
                    const item = SYMBOL_CONFIG[key];
                    const active = activeSymbol === key;
                    // Mock price & change for UI only
                    const mockPrice =
                      key === "BTCUSDT"
                        ? "64,280.50"
                        : key === "ETHUSDT"
                        ? "3,420.80"
                        : key === "XAUUSD"
                        ? "2,365.40"
                        : "18,920.30";
                    const mockChange =
                      key === "BTCUSDT"
                        ? "+1.84%"
                        : key === "ETHUSDT"
                        ? "+2.12%"
                        : key === "XAUUSD"
                        ? "-0.45%"
                        : "+0.96%";
                    const positive = mockChange.startsWith("+");

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveSymbol(key)}
                        className={`w-full flex items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left transition ${
                          active
                            ? "border-accentGold bg-accentGold/5"
                            : "border-gray-800 bg-black/40 hover:border-accentGold/60"
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-50 text-xs sm:text-sm">
                            {item.label}
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {item.category}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs sm:text-sm text-gray-100">
                            {mockPrice}
                          </p>
                          <p
                            className={`text-[10px] font-semibold ${
                              positive ? "text-accentGreen" : "text-red-400"
                            }`}
                          >
                            {mockChange}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Guidance card */}
              <div className="card-glow bg-bgAlt/70 border border-gray-800 rounded-2xl p-4 sm:p-5 text-[11px] sm:text-xs text-gray-300/90 space-y-2">
                <h3 className="text-sm font-semibold text-gray-50">
                  Using charts together with ApexGlobalEarnings plans.
                </h3>
                <p>
                  Many clients use TradingView charts to refine entries and exits
                  when allocating into Standard, Professional, Premium or VIP
                  plans. While plans focus on structured ROI, charts help you time
                  market exposure more effectively.
                </p>
                <ul className="space-y-1.5">
                  <li className="flex items-start gap-1.5">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accentGreen" />
                    <span>
                      Use higher timeframes (1H, 4H, 1D) to understand overall
                      trend direction.
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accentGold" />
                    <span>
                      Use lower timeframes (5m, 15m) to refine specific entry and
                      exit windows.
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accentGreen" />
                    <span>
                      Never risk capital you cannot afford to lose and always
                      respect your risk limits.
                    </span>
                  </li>
                </ul>
                <p className="text-[10px] text-gray-500/95">
                  Charts are for informational purposes only and do not constitute
                  investment advice. All trading involves risk.
                </p>
                <div className="pt-1">
                  <Link
                    href="/#plans"
                    className="inline-flex items-center text-[11px] text-accentGold hover:text-yellow-300 transition-colors"
                  >
                    Review ApexGlobalEarnings investment plans
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
