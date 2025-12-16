import {
  LineChart,
  ShieldCheck,
  Wallet,
  Users,
  BarChart3,
  Headset,
} from "lucide-react";
import Link from "next/link";

type Service = {
  id: number;
  title: string;
  description: string;
  bullets: string[];
  icon: React.ElementType;
};

const SERVICES: Service[] = [
  {
    id: 1,
    title: "Live Trading Environment",
    description:
      "Access institutional-style markets with real-time pricing on crypto, indices and metals from a single account.",
    bullets: [
      "Multi-asset support: BTC, ETH, GOLD, NAS100 & more",
      "Low-latency execution architecture",
      "Streaming price widgets and charts",
    ],
    icon: LineChart,
  },
  {
    id: 2,
    title: "Managed Investment Plans",
    description:
      "Curated plans like Standard, Professional, Premium and VIP, each with transparent minimums and daily ROI.",
    bullets: [
      "Auto-calculated daily returns",
      "Clear plan duration & payout schedule",
      "Portfolio view across all active plans",
    ],
    icon: BarChart3,
  },
  {
    id: 3,
    title: "Secure Wallet & Payouts",
    description:
      "Fund your account in USD via supported cryptocurrencies and request withdrawals with clear status tracking.",
    bullets: [
      "Dedicated wallet addresses per asset",
      "Secure internal ledger for balances",
      "Manual verification on large payouts",
    ],
    icon: Wallet,
  },
  {
    id: 4,
    title: "Referral & Affiliate Program",
    description:
      "Earn from Level 1 and Level 2 referrals with a transparent commission structure and live tracking.",
    bullets: [
      "Unique referral links for every user",
      "Level 1 & Level 2 earnings breakdown",
      "Referral leaderboard and analytics",
    ],
    icon: Users,
  },
  {
    id: 5,
    title: "Security & Risk Controls",
    description:
      "Enterprise-grade security practices around authentication, sessions and transaction review.",
    bullets: [
      "Secure email + password authentication",
      "Session monitoring & device checks",
      "Withdrawal review for unusual activity",
    ],
    icon: ShieldCheck,
  },
  {
    id: 6,
    title: "Dedicated Client Support",
    description:
      "A human support team ready to help with funding, plans, referrals and dashboard navigation.",
    bullets: [
      "Responsive support via email & chat",
      "Help with plan selection and upgrades",
      "Education around platform features",
    ],
    icon: Headset,
  },
];

export default function WhatWeProvide() {
  return (
    <section
      id="services"
      className="relative overflow-hidden bg-black border-t border-gray-900/70"
      aria-label="ApexGlobalEarnings services"
    >
      {/* -------- BACKGROUND IMAGE + OVERLAY -------- */}
      <div className="absolute inset-0">
        <img
          src="/services-bg.jpg" // ⬅️ put a professional trading/office background image in /public
          alt="Professional trading environment"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/80 to-bg/95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(247,181,0,0.18),_transparent_55%)]" />
      </div>

      {/* -------- FOREGROUND CONTENT -------- */}
      <div className="relative z-10 w-full max-w-[1400px] mx-auto page-padding py-16 md:py-18 lg:py-20">
        {/* Header */}
        <div className="max-w-2xl mb-10 md:mb-12">
          <p className="text-xs uppercase tracking-[0.18em] text-accentGold mb-3">
            What We Provide
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight mb-3">
            Services designed to{" "}
            <span className="text-accentGold">grow and protect</span> your
            capital.
          </h2>
          <p className="text-sm sm:text-base text-gray-200/90">
            ApexGlobalEarnings brings trading, managed investing, wallet
            infrastructure and referrals under one consistent, data-driven
            platform. Every service is built to give you clarity, control and
            speed.
          </p>
        </div>

        {/* Services grid */}
        <div className="grid gap-6 md:gap-7 lg:gap-8 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service) => {
            const Icon = service.icon;
            return (
              <article
                key={service.id}
                className="card-glow hover-lift slide-up bg-black/50 border border-gray-800/80 rounded-2xl p-4 sm:p-5 flex flex-col gap-4"
              >
                {/* Icon + title */}
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accentGold/10 border border-accentGold/40">
                    <Icon className="h-5 w-5 text-accentGold" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold">
                      {service.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm text-gray-300/90">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Bullets */}
                <ul className="mt-1 space-y-1.5 text-[11px] sm:text-xs text-gray-300/95">
                  {service.bullets.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accentGreen" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA hint */}
                <div className="mt-3 flex items-center justify-between text-[11px] sm:text-xs text-gray-400">
                  <span>Integrated directly inside your dashboard.</span>
                  <Link
                    href="/login"
                    className="text-accentGold hover:text-yellow-300 font-medium transition-colors"
                  >
                    View in platform
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
