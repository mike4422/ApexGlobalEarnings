"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Slide = {
  id: number;
  image: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  badge: string;
};

const SLIDES: Slide[] = [
  {
    id: 0,
    // Real trader / charts scene
    image: "/istock3.jpg",
    eyebrow: "Multi-Asset Trading",
    title: "Trade Crypto, Indices & Metals with Institutional Precision.",
    subtitle:
      "Access real-time charts, smart investment plans and instant withdrawals all from a single, secure interface.",
    badge: "BTC · ETH · GOLD · NAS100",
  },
  {
    id: 1,
    // Professional in office with laptop & analytics
    image: "/istock1.jpg",
    eyebrow: "Automated Earnings",
    title: "Let Your Capital Work While You Focus on What Matters.",
    subtitle:
      "Choose curated plans like Bronze, Silver, Gold and VIP and track your daily ROI in a transparent, data-driven dashboard.",
    badge: "Daily ROI · Compounding · Smart Payouts",
  },
  {
    id: 2,
    // Team / meeting with screens & charts
    image: "/istock2.jpg",
    eyebrow: "Global Brokerage Experience",
    title: "Premium Trading Infrastructure for Every Serious Investor.",
    subtitle:
      "Backed by institutional-grade tooling, referral programs and robust risk controls designed for long-term growth.",
    badge: "Real-Time Tools · Referral Rewards",
  },
];

const AUTOPLAY_INTERVAL = 5000; // 5 seconds

export default function Hero() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    }, AUTOPLAY_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  const activeSlide = SLIDES[activeIndex];

  return (
    <section
      aria-label="ApexGlobalEarnings trading hero"
      className="relative overflow-hidden bg-black"
    >
      {/* ---------- BACKGROUND SLIDES ---------- */}
      <div className="absolute inset-0">
        {SLIDES.map((slide, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ease-out
                ${isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}
              `}
              style={{
                backgroundImage: `url(${slide.image})`,
              }}
            >
              {/* Dark overlay gradient to make text readable */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-bg/95" />
            </div>
          );
        })}
      </div>

      {/* ---------- FOREGROUND CONTENT ---------- */}
      <div className="relative z-10">
        <div className="w-full max-w-[1400px] mx-auto page-padding pt-32 pb-20 md:pt-36 md:pb-24 lg:pt-40 lg:pb-28">
          <div className="max-w-2xl">
            {/* Eyebrow + dynamic badge */}
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accentGold/40 bg-black/40 px-3 py-1 text-[11px] uppercase tracking-wide text-accentGold">
              <span>{activeSlide.eyebrow}</span>
              <span className="h-1 w-1 rounded-full bg-accentGold" />
              <span className="text-[10px] text-gray-200">
                {activeSlide.badge}
              </span>
            </div>

            {/* Main heading */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-4">
              {activeSlide.title}
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-gray-200/90 mb-6 max-w-xl">
              {activeSlide.subtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-8">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-accentGold px-6 py-3 text-sm font-semibold text-black shadow-md hover:bg-yellow-400 transition"
              >
                Open Live Account
              </Link>
              <Link
                href="/#plans"
                className="inline-flex items-center justify-center rounded-lg border border-gray-400/60 px-6 py-3 text-sm font-semibold text-white hover:border-accentGold transition"
              >
                View Investment Plans
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs sm:text-sm">
              <div>
                <p className="text-gray-300/80">Active Investors</p>
                <p className="mt-1 text-base font-semibold">12,540+</p>
              </div>
              <div>
                <p className="text-gray-300/80">Total Payouts</p>
                <p className="mt-1 text-base font-semibold text-accentGreen">
                  $4.2M+
                </p>
              </div>
              <div>
                <p className="text-gray-300/80">Avg. Execution</p>
                <p className="mt-1 text-base font-semibold">&lt; 30 ms</p>
              </div>
              <div>
                <p className="text-gray-300/80">Supported Markets</p>
                <p className="mt-1 text-base font-semibold">Crypto · Indices</p>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- CAROUSEL INDICATORS ---------- */}
        <div className="w-full max-w-[1400px] mx-auto px-2 pb-6 flex justify-start">
          <div className="flex items-center gap-2">
            {SLIDES.map((slide, index) => {
              const isActive = index === activeIndex;
              return (
                <button
                  key={slide.id}
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => setActiveIndex(index)}
                  className={`h-[6px] rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-6 bg-accentGold"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
