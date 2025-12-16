"use client";

import { useState } from "react";
import { LineChart, TrendingUp, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

type MarketCategory = "crypto" | "indices" | "metals" | "forex";

type Instrument = {
  symbol: string;
  name: string;
  type: string;
  spread: string;
  leverage: string;
  minVolume: string;
  tradingHours: string;
  description: string;
  icon?: string;
};

const CATEGORY_LABELS: Record<MarketCategory, string> = {
  crypto: "Crypto",
  indices: "Indices",
  metals: "Metals",
  forex: "Forex",
};

const MARKET_DATA: Record<MarketCategory, Instrument[]> = {
  crypto: [
    {
      symbol: "BTC/USDT",
      name: "Bitcoin",
      type: "Crypto",
      spread: "From $15",
      leverage: "Up to 1:50",
      minVolume: "0.01 BTC",
      tradingHours: "24/7",
      description: "Institutional-style BTC liquidity with fast execution.",
      icon: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
    },
    {
      symbol: "ETH/USDT",
      name: "Ethereum",
      type: "Crypto",
      spread: "From $3",
      leverage: "Up to 1:50",
      minVolume: "0.1 ETH",
      tradingHours: "24/7",
      description: "Tight spreads on the second-largest crypto asset.",
      icon: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
    },
    {
      symbol: "SOL/USDT",
      name: "Solana",
      type: "Crypto",
      spread: "From $0.5",
      leverage: "Up to 1:30",
      minVolume: "1 SOL",
      tradingHours: "24/7",
      description: "High-performance chain exposure with active liquidity.",
      icon: "https://cryptologos.cc/logos/solana-sol-logo.png",
    },
    {
      symbol: "XRP/USDT",
      name: "XRP",
      type: "Crypto",
      spread: "From $0.0008",
      leverage: "Up to 1:30",
      minVolume: "100 XRP",
      tradingHours: "24/7",
      description: "Popular cross-border settlement asset with deep volume.",
      icon: "https://cryptologos.cc/logos/xrp-xrp-logo.png",
    },
  ],
  indices: [
    {
      symbol: "NAS100",
      name: "US Tech 100",
      type: "Index CFD",
      spread: "From 1.2 pts",
      leverage: "Up to 1:200",
      minVolume: "0.1 lot",
      tradingHours: "Mon–Fri",
      description: "Exposure to leading US technology and growth stocks.",
      icon: "https://static.thenounproject.com/png/line-chart-icon-195110-512.png",
    },
    {
      symbol: "US30",
      name: "Dow Jones 30",
      type: "Index CFD",
      spread: "From 1.8 pts",
      leverage: "Up to 1:200",
      minVolume: "0.1 lot",
      tradingHours: "Mon–Fri",
      description: "Track the performance of 30 major US blue-chip stocks.",
      icon: "https://static.thenounproject.com/png/line-chart-icon-195110-512.png",
    },
    {
      symbol: "SPX500",
      name: "S&P 500",
      type: "Index CFD",
      spread: "From 0.8 pts",
      leverage: "Up to 1:200",
      minVolume: "0.1 lot",
      tradingHours: "Mon–Fri",
      description: "Broad exposure to the 500 largest US-listed companies.",
      icon: "https://static.thenounproject.com/png/line-chart-icon-195110-512.png",
    },
  ],
  metals: [
    {
      symbol: "XAU/USD",
      name: "Gold",
      type: "Spot Metal",
      spread: "From 15¢",
      leverage: "Up to 1:500",
      minVolume: "0.01 lot",
      tradingHours: "Mon–Fri (Extended)",
      description: "Trade gold with institutional-grade pricing and tight spreads.",
      icon: "https://static.thenounproject.com/png/gold-bars-icon-421626-512.png",
    },
    {
      symbol: "XAG/USD",
      name: "Silver",
      type: "Spot Metal",
      spread: "From 1.5¢",
      leverage: "Up to 1:200",
      minVolume: "0.01 lot",
      tradingHours: "Mon–Fri (Extended)",
      description: "Complement gold exposure with silver as a secondary metal.",
      icon: "https://static.thenounproject.com/png/silver-bar-stack-icon-1925932-512.png",
    },
  ],
  forex: [
    {
      symbol: "EUR/USD",
      name: "Euro / US Dollar",
      type: "Forex Major",
      spread: "From 0.3 pips",
      leverage: "Up to 1:500",
      minVolume: "0.01 lot",
      tradingHours: "Mon–Fri",
      description: "The most traded currency pair with deep global liquidity.",
      icon: "https://static.thenounproject.com/png/foreign-exchange-rate-icon-205590-512.png",
    },
    {
      symbol: "GBP/USD",
      name: "British Pound / US Dollar",
      type: "Forex Major",
      spread: "From 0.5 pips",
      leverage: "Up to 1:500",
      minVolume: "0.01 lot",
      tradingHours: "Mon–Fri",
      description: "Popular major pair offering volatility and opportunity.",
      icon: "https://static.thenounproject.com/png/foreign-exchange-rate-icon-205590-512.png",
    },
    {
      symbol: "USD/JPY",
      name: "US Dollar / Japanese Yen",
      type: "Forex Major",
      spread: "From 0.4 pips",
      leverage: "Up to 1:500",
      minVolume: "0.01 lot",
      tradingHours: "Mon–Fri",
      description: "Key FX pair with strong participation from global traders.",
      icon: "https://static.thenounproject.com/png/foreign-exchange-rate-icon-205590-512.png",
    },
    {
      symbol: "AUD/USD",
      name: "Australian Dollar / US Dollar",
      type: "Forex Major",
      spread: "From 0.4 pips",
      leverage: "Up to 1:400",
      minVolume: "0.01 lot",
      tradingHours: "Mon–Fri",
      description: "Commodity-linked currency pair with dynamic price action.",
      icon: "https://static.thenounproject.com/png/foreign-exchange-rate-icon-205590-512.png",
    },
  ],
};

export default function MarketsPage() {
  const [activeCategory, setActiveCategory] = useState<MarketCategory>("crypto");

  const instruments = MARKET_DATA[activeCategory];

  return (
    <div className="bg-bg min-h-screen">
      {/* HERO */}
      <section className="bg-bgAlt/40 border-b border-gray-800/70">
        <div className="w-full max-w-[1400px] mx-auto page-padding pt-24 pb-10 md:pt-28 md:pb-12 lg:pb-14">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
            <div className="space-y-4 slide-up">
              <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                Markets &amp; Trading
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
                Trade{" "}
                <span className="text-accentGold">
                  crypto, indices, metals &amp; FX
                </span>{" "}
                on one unified platform.
              </h1>
              <p className="text-sm sm:text-base text-gray-300/90 max-w-xl">
                ApexGlobalEarnings delivers institutional-style pricing and
                execution across major asset classes. Combine active trading
                with structured investment plans and referral rewards while
                keeping full visibility over risk.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/50 border border-gray-800 px-3 py-1">
                  <LineChart className="h-3.5 w-3.5 text-accentGreen" />
                  <span>Real-time pricing</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/50 border border-gray-800 px-3 py-1">
                  <TrendingUp className="h-3.5 w-3.5 text-accentGold" />
                  <span>Multi-asset access</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/50 border border-gray-800 px-3 py-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-accentGreen" />
                  <span>Risk controls &amp; security</span>
                </div>
              </div>
            </div>

            {/* Hero side card */}
            <div className="slide-up">
              <div className="card-glow bg-black/70 border border-gray-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                      Snapshot
                    </p>
                    <h2 className="text-sm sm:text-base font-semibold text-gray-50">
                      Key trading conditions.
                    </h2>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-accentGold/10 border border-accentGold/40 flex items-center justify-center">
                    <LineChart className="h-5 w-5 text-accentGold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="rounded-lg bg-black/60 border border-gray-800 p-3">
                    <p className="text-gray-300/85">Spreads from</p>
                    <p className="mt-1 text-lg font-semibold text-accentGreen">
                      0.3 pips
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      On major FX pairs, under normal conditions.
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/60 border border-gray-800 p-3">
                    <p className="text-gray-300/85">Leverage up to</p>
                    <p className="mt-1 text-lg font-semibold text-accentGold">
                      1:500
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Depends on instrument and jurisdiction.
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/60 border border-gray-800 p-3">
                    <p className="text-gray-300/85">Asset classes</p>
                    <p className="mt-1 text-lg font-semibold text-gray-50">
                      4+
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Crypto, indices, metals and major FX pairs.
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/60 border border-gray-800 p-3">
                    <p className="text-gray-300/85">Execution</p>
                    <p className="mt-1 text-lg font-semibold text-accentGreen">
                      Low latency
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Infrastructure designed for active traders.
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 text-[11px] sm:text-xs">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1 rounded-lg bg-accentGold text-black px-3 py-2 font-semibold hover:bg-yellow-400 transition"
                  >
                    Open trading dashboard
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <p className="text-[10px] text-gray-500">
                    View live spreads, volumes and recent activity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY TABS + TABLE */}
      <section className="bg-bg">
        <div className="w-full max-w-[1400px] mx-auto page-padding py-10 md:py-12 lg:py-14">
          {/* Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs slide-up">
              {(Object.keys(CATEGORY_LABELS) as MarketCategory[]).map((key) => {
                const label = CATEGORY_LABELS[key];
                const active = activeCategory === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveCategory(key)}
                    className={`rounded-full px-3.5 py-1.5 border transition font-medium ${
                      active
                        ? "bg-accentGold text-black border-accentGold"
                        : "bg-black/40 border-gray-700 text-gray-200 hover:border-accentGold/70"
                    }`}
                  >
                    {label} Markets
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] sm:text-[11px] text-gray-500 slide-up">
              Pricing is indicative and may vary based on liquidity and market
              conditions.
            </p>
          </div>

          {/* Table wrapper */}
          <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-black/70 card-glow slide-up">
            <table className="min-w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-800 bg-black/70">
                  <th className="px-4 sm:px-5 py-3 text-left font-medium text-gray-300">
                    Instrument
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left font-medium text-gray-300">
                    Type
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left font-medium text-gray-300">
                    Typical spread
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left font-medium text-gray-300">
                    Max leverage
                  </th>
                  <th className="hidden md:table-cell px-4 sm:px-5 py-3 text-left font-medium text-gray-300">
                    Min volume
                  </th>
                  <th className="hidden lg:table-cell px-4 sm:px-5 py-3 text-left font-medium text-gray-300">
                    Trading hours
                  </th>
                  <th className="px-4 sm:px-5 py-3 text-left font-medium text-gray-300">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {instruments.map((instrument, idx) => (
                  <tr
                    key={instrument.symbol}
                    className={`border-t border-gray-800/80 hover:bg-white/5 transition ${
                      idx % 2 === 0 ? "bg-black/40" : "bg-black/30"
                    }`}
                  >
                    {/* Instrument */}
                    <td className="px-4 sm:px-5 py-3 align-top">
                      <div className="flex items-center gap-2">
                        {instrument.icon && (
                          <div className="h-7 w-7 rounded-full bg-black/60 border border-gray-700 overflow-hidden flex-shrink-0">
                            <img
                              src={instrument.icon}
                              alt={instrument.symbol}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-gray-50">
                            {instrument.symbol}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {instrument.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="px-4 sm:px-5 py-3 align-top text-gray-300">
                      {instrument.type}
                    </td>

                    {/* Spread */}
                    <td className="px-4 sm:px-5 py-3 align-top text-accentGreen font-semibold">
                      {instrument.spread}
                    </td>

                    {/* Leverage */}
                    <td className="px-4 sm:px-5 py-3 align-top text-accentGold font-semibold">
                      {instrument.leverage}
                    </td>

                    {/* Min volume */}
                    <td className="hidden md:table-cell px-4 sm:px-5 py-3 align-top text-gray-300">
                      {instrument.minVolume}
                    </td>

                    {/* Hours */}
                    <td className="hidden lg:table-cell px-4 sm:px-5 py-3 align-top text-gray-300">
                      {instrument.tradingHours}
                    </td>

                    {/* Description */}
                    <td className="px-4 sm:px-5 py-3 align-top text-[11px] sm:text-xs text-gray-300/90">
                      {instrument.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Small note */}
          <p className="mt-4 text-[10px] sm:text-[11px] text-gray-500/95 max-w-3xl slide-up">
            Market specifications including spreads, leverage and trading hours
            are subject to change and may differ depending on your account
            type, platform configuration and jurisdiction. Please refer to your
            live ApexGlobalEarnings dashboard for the latest conditions.
          </p>
        </div>
      </section>
    </div>
  );
}
