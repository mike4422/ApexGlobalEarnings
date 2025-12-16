"use client";

import { TrendingUp, TrendingDown } from "lucide-react";

type Ticker = {
  symbol: string;
  label: string;
  price: string;
  change: string;
  changePct: string;
  direction: "up" | "down";
};

const TICKERS: Ticker[] = [
  {
    symbol: "BTC/USDT",
    label: "Bitcoin",
    price: "68,420.15",
    change: "+842.10",
    changePct: "+1.25%",
    direction: "up",
  },
  {
    symbol: "ETH/USDT",
    label: "Ethereum",
    price: "3,245.60",
    change: "-54.32",
    changePct: "-1.65%",
    direction: "down",
  },
  {
    symbol: "GOLD",
    label: "XAU/USD",
    price: "2,385.40",
    change: "+18.20",
    changePct: "+0.77%",
    direction: "up",
  },
  {
    symbol: "NAS100",
    label: "US Tech 100",
    price: "18,245.90",
    change: "+120.40",
    changePct: "+0.66%",
    direction: "up",
  },
  {
    symbol: "US30",
    label: "Dow Jones",
    price: "39,180.50",
    change: "-92.30",
    changePct: "-0.24%",
    direction: "down",
  },
  {
    symbol: "EUR/USD",
    label: "Euro",
    price: "1.0875",
    change: "+0.0021",
    changePct: "+0.19%",
    direction: "up",
  },
];

export default function LiveTickers() {
  // duplicate list so marquee can loop seamlessly
  const marqueeItems = [...TICKERS, ...TICKERS];

  return (
    <section
      aria-label="Live market tickers"
      className="bg-bgAlt/80 border-y border-gray-800/70"
    >
      <div className="w-full max-w-[1400px] mx-auto page-padding">
        {/* Header row */}
        <div className="flex items-center gap-3 py-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-accentGreen animate-pulse" />
            <span className="uppercase tracking-[0.22em] text-gray-300">
              Live Markets
            </span>
          </div>
          <span className="hidden sm:inline-block text-gray-400 text-[11px]">
            BTC · ETH · GOLD · Indices · FX — updated in real time from our
            pricing engine.
          </span>
        </div>

        {/* Marquee track */}
        <div className="relative overflow-hidden pb-3">
          <div className="ticker-track flex gap-3">
            {marqueeItems.map((ticker, index) => {
              const isUp = ticker.direction === "up";
              return (
                <div
                  key={`${ticker.symbol}-${index}`}
                  className="min-w-[210px] sm:min-w-[230px] lg:min-w-[250px] rounded-xl bg-black/60 border border-gray-800/80 px-3 py-2 flex items-center justify-between text-[11px] sm:text-xs"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-50">
                      {ticker.symbol}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {ticker.label}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className="font-semibold text-gray-50">
                      {ticker.price}
                    </span>
                    <div className="flex items-center gap-1">
                      {isUp ? (
                        <TrendingUp className="h-3.5 w-3.5 text-accentGreen" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 text-red-400" />
                      )}
                      <span
                        className={
                          "font-medium " +
                          (isUp ? "text-accentGreen" : "text-red-400")
                        }
                      >
                        {ticker.change}
                      </span>
                      <span className="text-[10px] text-gray-400">
                        ({ticker.changePct})
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
