import { Users, Share2, LineChart, Gift } from "lucide-react";
import Link from "next/link";

export default function ReferralSection() {
  return (
    <section
      id="referral"
      className="bg-bg border-t border-gray-800/70"
      aria-label="Referral and affiliate program"
    >
      <div className="w-full max-w-[1400px] mx-auto page-padding py-14 md:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_minmax(0,1fr)] items-start">
          {/* -------- LEFT: COPY + HIGHLIGHTS -------- */}
          <div className="space-y-7 slide-up">
            {/* Header */}
            <div className="space-y-3 max-w-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                Referral & Affiliate Program
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
                Earn more with{" "}
                <span className="text-accentGold">Level 1 &amp; Level 2</span>{" "}
                commissions.
              </h2>
              <p className="text-sm sm:text-base text-gray-300/90">
                ApexGlobalEarnings rewards you every time you introduce new
                investors to the platform. Share your unique referral link,
                track your tree and monitor Level 1 and Level 2 earnings in
                real-time inside your dashboard.
              </p>
            </div>

            {/* Key points */}
            <div className="grid gap-4 sm:grid-cols-3 text-xs sm:text-sm">
              <div className="card-glow p-4 bg-black/50 border border-gray-800 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-accentGold/10 border border-accentGold/40">
                    <Share2 className="h-4 w-4 text-accentGold" />
                  </div>
                  <p className="font-semibold">Level 1 Earnings</p>
                </div>
                <p className="text-gray-300/85 text-[11px] sm:text-xs">
                  Earn commissions from direct referrals who join via your unique
                  link and fund their accounts.
                </p>
              </div>

              <div className="card-glow p-4 bg-black/50 border border-gray-800 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-accentGreen/10 border border-accentGreen/40">
                    <Users className="h-4 w-4 text-accentGreen" />
                  </div>
                  <p className="font-semibold">Level 2 Network</p>
                </div>
                <p className="text-gray-300/85 text-[11px] sm:text-xs">
                  Earn additional commissions from the referrals of your direct
                  partners, expanding your network depth.
                </p>
              </div>

              <div className="card-glow p-4 bg-black/50 border border-gray-800 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-accentGold/10 border border-accentGold/40">
                    <LineChart className="h-4 w-4 text-accentGold" />
                  </div>
                  <p className="font-semibold">Real-Time Tracking</p>
                </div>
                <p className="text-gray-300/85 text-[11px] sm:text-xs">
                  A dedicated referral dashboard shows total signups, active
                  investors, and paid commissions.
                </p>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid gap-4 sm:grid-cols-3 text-xs sm:text-sm">
              <div className="card-glow p-4 bg-black/60 border border-gray-800 flex flex-col gap-1.5">
                <p className="text-gray-300/85">Total referred investors*</p>
                <p className="text-2xl font-semibold text-accentGreen">
                  3,482+
                </p>
                <p className="text-[10px] text-gray-500">
                  Across all markets and plan tiers.
                </p>
              </div>
              <div className="card-glow p-4 bg-black/60 border border-gray-800 flex flex-col gap-1.5">
                <p className="text-gray-300/85">Referral commissions paid*</p>
                <p className="text-2xl font-semibold text-accentGold">
                  $280K+
                </p>
                <p className="text-[10px] text-gray-500">
                  Combined Level 1 &amp; Level 2 payouts.
                </p>
              </div>
              <div className="card-glow p-4 bg-black/60 border border-gray-800 flex flex-col gap-1.5">
                <p className="text-gray-300/85">Top referrer ROI uplift*</p>
                <p className="text-2xl font-semibold text-accentGreen">
                  +36%
                </p>
                <p className="text-[10px] text-gray-500">
                  Additional earnings driven by referral income.
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-accentGold text-black font-semibold px-4 py-2.5 hover:bg-yellow-400 transition"
              >
                Create account &amp; get your link
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-gray-700 px-4 py-2.5 text-gray-100 hover:border-accentGold transition"
              >
                View referral dashboard
              </Link>
              <p className="text-[10px] text-gray-500">
                *Illustrative metrics, updated in real-time inside the live platform.
              </p>
            </div>
          </div>

          {/* -------- RIGHT: DIAGRAM / VISUAL -------- */}
          <div className="slide-up">
            <div className="card-glow bg-bgAlt/60 border border-gray-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-5">
              {/* Header */}
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-xl bg-accentGold/10 border border-accentGold/40 flex items-center justify-center">
                  <Gift className="h-4 w-4 text-accentGold" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-gray-400">
                    Referral structure
                  </p>
                  <h3 className="text-sm sm:text-base font-semibold">
                    How Level 1 &amp; Level 2 rewards work.
                  </h3>
                </div>
              </div>

              {/* Diagram */}
              <div className="relative rounded-xl bg-black/70 border border-gray-800 p-4 sm:p-5 text-xs sm:text-sm overflow-hidden">
                {/* Background graphic (optional placeholder) */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <img
                    src="/referral-graph.png"
                    alt="Referral network visualization"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-bg/40 to-transparent" />
                </div>

                <div className="relative z-10 space-y-4">
                  {/* You node */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="rounded-full bg-accentGold/15 border border-accentGold/60 px-4 py-1.5 text-xs font-semibold">
                      You
                    </div>
                    <p className="text-[11px] text-gray-300/90 text-center max-w-xs">
                      Share your unique referral link with traders and investors
                      in your network.
                    </p>
                  </div>

                  {/* Level 1 row */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-px w-10 bg-gray-700" />
                      <span className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                        Level 1
                      </span>
                      <span className="h-px w-10 bg-gray-700" />
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <div className="rounded-lg bg-black/70 border border-accentGreen/40 px-3 py-2 text-[11px] text-gray-200 min-w-[120px] text-center">
                        Direct referrals
                        <p className="mt-1 font-semibold text-accentGreen">
                          % commission per active plan
                        </p>
                      </div>
                      <p className="text-[11px] text-gray-400 max-w-xs text-center">
                        Every investor who signs up and funds their account via your
                        link is tracked as Level 1.
                      </p>
                    </div>
                  </div>

                  {/* Level 2 row */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-center gap-2">
                      <span className="h-px w-10 bg-gray-700" />
                      <span className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                        Level 2
                      </span>
                      <span className="h-px w-10 bg-gray-700" />
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <div className="rounded-lg bg-black/70 border border-gray-700 px-3 py-2 text-[11px] text-gray-200 min-w-[120px] text-center">
                        Referrals of your Level 1
                        <p className="mt-1 font-semibold text-accentGold">
                          Extra % override on their activity
                        </p>
                      </div>
                      <p className="text-[11px] text-gray-400 max-w-xs text-center">
                        When your direct referrals share their own link, their
                        network becomes your Level 2 – and you earn from their
                        activity too.
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="mt-2 rounded-lg bg-black/60 border border-gray-800 px-3 py-3 text-[11px] text-gray-300/95">
                    Referral percentages are configurable by the admin and
                    displayed clearly inside your dashboard, along with total
                    earnings, pending payouts and historical referral activity.
                  </div>
                </div>
              </div>

              {/* Footnote */}
              <p className="text-[10px] sm:text-[11px] text-gray-500">
                ApexGlobalEarnings may adjust referral percentages over time in line
                with platform performance and market conditions. Any changes are
                communicated transparently inside your dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
