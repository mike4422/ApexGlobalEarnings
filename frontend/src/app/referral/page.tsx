import Link from "next/link";
import {
  Users,
  Gift,
  LineChart,
  ArrowRight,
  Trophy,
  Wallet,
  Sparkles,
} from "lucide-react";

const LEVELS = [
  {
    level: "Level 1",
    label: "Direct referrals",
    rate: "8%",
    description:
      "Earn a percentage on every qualifying investment made by users who sign up directly with your link.",
  },
  {
    level: "Level 2",
    label: "Network referrals",
    rate: "3%",
    description:
      "When your direct partners build their own network, you continue to earn from their referred clients.",
  },
];

const BENEFITS = [
  {
    icon: <Users className="h-5 w-5 text-accentGold" />,
    title: "Multi-level structure",
    description:
      "Earn from both your direct clients (Level 1) and their referrals (Level 2), with transparent tracking in your dashboard.",
  },
  {
    icon: <Wallet className="h-5 w-5 text-accentGreen" />,
    title: "Real-time commission tracking",
    description:
      "Monitor referral signups, active plans and commission accrual in real time from the ApexGlobalEarnings affiliate panel.",
  },
  {
    icon: <Gift className="h-5 w-5 text-accentGold" />,
    title: "Marketing-ready assets",
    description:
      "Receive shareable links and creatives to promote ApexGlobalEarnings across social media, communities and more.",
  },
  {
    icon: <LineChart className="h-5 w-5 text-accentGreen" />,
    title: "Aligned with trading & plans",
    description:
      "Commissions are tied to real investment activity across Standard, Professional, Premium and VIP plans.",
  },
];

const STEPS = [
  {
    step: "01",
    title: "Create your account",
    description:
      "Sign up on ApexGlobalEarnings and verify your email to unlock your affiliate dashboard and referral tools.",
  },
  {
    step: "02",
    title: "Copy your unique link",
    description:
      "Generate your personal referral link and share it with your audience, clients or trading community.",
  },
  {
    step: "03",
    title: "Earn from every active plan",
    description:
      "When referrals fund and activate investment plans, you earn Level 1 and Level 2 commissions automatically.",
  },
];

const LEADERBOARD = [
  {
    rank: 1,
    name: "QuantumSignals FX",
    country: "Global",
    level1: 124,
    level2: 382,
    monthlyCommission: "$18,420.00",
  },
  {
    rank: 2,
    name: "CryptoAlpha Hub",
    country: "EU / MENA",
    level1: 89,
    level2: 210,
    monthlyCommission: "$11,305.50",
  },
  {
    rank: 3,
    name: "GoldEdge Traders",
    country: "Africa",
    level1: 72,
    level2: 168,
    monthlyCommission: "$9,760.00",
  },
];

export default function ReferralPage() {
  return (
    <div className="bg-bg min-h-screen">
      {/* ---------------- HERO SECTION ---------------- */}
      <section className="bg-bgAlt/40 border-b border-gray-800/70">
        <div className="w-full max-w-[1400px] mx-auto page-padding pt-24 pb-10 md:pt-28 md:pb-12 lg:pb-14">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
            {/* Left: copy */}
            <div className="space-y-4 slide-up">
              <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                Affiliate Program
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
                Turn your{" "}
                <span className="text-accentGold">network and audience</span> into
                recurring commissions with ApexGlobalEarnings.
              </h1>
              <p className="text-sm sm:text-base text-gray-300/90 max-w-xl">
                Introduce traders and investors to ApexGlobalEarnings and earn multi-level
                commissions whenever they fund and activate investment plans. Track
                performance live, withdraw commissions and grow a long-term revenue
                stream around your community.
              </p>

              <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/50 border border-gray-800 px-3 py-1">
                  <Users className="h-3.5 w-3.5 text-accentGreen" />
                  <span>Level 1 &amp; Level 2 commissions</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/50 border border-gray-800 px-3 py-1">
                  <Gift className="h-3.5 w-3.5 text-accentGold" />
                  <span>Lifetime attribution</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/50 border border-gray-800 px-3 py-1">
                  <LineChart className="h-3.5 w-3.5 text-accentGreen" />
                  <span>Transparent analytics</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accentGold text-black px-4 py-2.5 text-sm font-semibold hover:bg-yellow-400 transition"
                >
                  Join the affiliate program
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/login"
                  className="text-xs sm:text-sm text-accentGold hover:text-yellow-300 transition-colors"
                >
                  Already a partner? Access your dashboard
                </Link>
              </div>
            </div>

            {/* Right: illustration card */}
            <div className="slide-up">
              <div className="card-glow bg-black/75 border border-gray-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                {/* Image */}
                <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-black/60">
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
                  <img
                    src="/affiliate-hero.jpg"
                    alt="Affiliate partners growing with ApexGlobalEarnings"
                    className="h-40 sm:h-48 md:h-56 w-full object-cover"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm text-gray-300/90">
                  <div className="rounded-lg bg-black/70 border border-gray-800 p-3">
                    <p className="text-gray-400">Top partners</p>
                    <p className="mt-1 text-lg font-semibold text-accentGreen">
                      $18,000+
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Monthly commission potential for high-performing affiliates.
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/70 border border-gray-800 p-3">
                    <p className="text-gray-400">Global reach</p>
                    <p className="mt-1 text-lg font-semibold text-accentGold">
                      40+ Countries
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Build your network across regions and time zones.
                    </p>
                  </div>
                </div>

                <p className="text-[10px] sm:text-[11px] text-gray-500/95">
                  Commissions are calculated based on real investment activity
                  and subject to the ApexGlobalEarnings affiliate terms. Actual
                  results may vary depending on your audience and performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- COMMISSION STRUCTURE ---------------- */}
      <section className="bg-bg">
        <div className="w-full max-w-[1400px] mx-auto page-padding py-10 md:py-12 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] items-start">
            {/* Commission breakdown */}
            <div className="space-y-5 slide-up">
              <div className="space-y-3 max-w-xl">
                <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                  Commission structure
                </p>
                <h2 className="text-2xl sm:text-3xl font-semibold leading-tight">
                  Earn on{" "}
                  <span className="text-accentGold">
                    Level 1 &amp; Level 2 referrals
                  </span>{" "}
                  with transparent tracking.
                </h2>
                <p className="text-sm sm:text-base text-gray-300/90">
                  ApexGlobalEarnings is designed for long-term partners. When you introduce
                  clients who invest through Standard, Professional, Premium or VIP
                  plans, you earn multi-level commissions as those plans remain active.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 text-xs sm:text-sm">
                {LEVELS.map((lvl) => (
                  <div
                    key={lvl.level}
                    className="card-glow bg-black/70 border border-gray-800 rounded-xl p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                          {lvl.level}
                        </span>
                        <span className="text-sm font-semibold text-gray-50">
                          {lvl.label}
                        </span>
                      </div>
                      <span className="text-lg font-semibold text-accentGold">
                        {lvl.rate}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-300/90">
                      {lvl.description}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-[10px] sm:text-[11px] text-gray-500/95 max-w-xl">
                Commission percentages are indicative and can be adjusted by
                ApexGlobalEarnings based on campaign type, volume and regional
                requirements. Your exact rates will always be visible inside your
                affiliate dashboard.
              </p>
            </div>

            {/* Benefits grid */}
            <div className="space-y-4 slide-up">
              <h3 className="text-sm sm:text-base font-semibold text-gray-50">
                Why affiliates choose ApexGlobalEarnings.
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 text-xs sm:text-sm">
                {BENEFITS.map((b) => (
                  <div
                    key={b.title}
                    className="card-glow bg-black/70 border border-gray-800 rounded-xl p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-black/60 border border-gray-700 flex items-center justify-center">
                        {b.icon}
                      </div>
                      <p className="font-semibold text-gray-50">{b.title}</p>
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-300/90">
                      {b.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- HOW IT WORKS + LEADERBOARD ---------------- */}
      <section className="bg-bgAlt/40 border-t border-gray-800/70">
        <div className="w-full max-w-[1400px] mx-auto page-padding py-10 md:py-12 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] items-start">
            {/* How it works */}
            <div className="space-y-5 slide-up">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                  How it works
                </p>
                <h2 className="text-xl sm:text-2xl font-semibold leading-tight">
                  Launch your{" "}
                  <span className="text-accentGold">ApexGlobalEarnings affiliate</span>{" "}
                  in three simple steps.
                </h2>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                {STEPS.map((step) => (
                  <div
                    key={step.step}
                    className="card-glow bg-black/70 border border-gray-800 rounded-xl p-4 flex gap-3"
                  >
                    <div className="flex-shrink-0">
                      <div className="h-9 w-9 rounded-lg bg-accentGold/10 border border-accentGold/50 flex items-center justify-center">
                        <span className="text-[11px] font-semibold text-accentGold">
                          {step.step}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-gray-50">
                        {step.title}
                      </p>
                      <p className="text-[11px] sm:text-xs text-gray-300/90">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-1">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accentGold text-black px-4 py-2.5 text-sm font-semibold hover:bg-yellow-400 transition"
                >
                  Become an ApexGlobalEarnings affiliate
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            {/* Leaderboard preview */}
            <div className="space-y-4 slide-up">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                    Leaderboard preview
                  </p>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-50">
                    Top performing partners this month.
                  </h3>
                </div>
                <div className="h-9 w-9 rounded-full bg-black/70 border border-gray-700 flex items-center justify-center">
                  <Trophy className="h-4 w-4 text-accentGold" />
                </div>
              </div>

              <div className="card-glow bg-black/75 border border-gray-800 rounded-2xl overflow-hidden">
                <table className="min-w-full text-[11px] sm:text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 bg-black/70">
                      <th className="px-4 sm:px-5 py-3 text-left font-medium text-gray-300">
                        Partner
                      </th>
                      <th className="hidden sm:table-cell px-4 sm:px-5 py-3 text-left font-medium text-gray-300">
                        Region
                      </th>
                      <th className="px-4 sm:px-5 py-3 text-left font-medium text-gray-300">
                        Level 1
                      </th>
                      <th className="hidden md:table-cell px-4 sm:px-5 py-3 text-left font-medium text-gray-300">
                        Level 2
                      </th>
                      <th className="px-4 sm:px-5 py-3 text-left font-medium text-gray-300">
                        Monthly commission
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {LEADERBOARD.map((row, idx) => (
                      <tr
                        key={row.rank}
                        className={`border-t border-gray-800/80 ${
                          idx % 2 === 0 ? "bg-black/40" : "bg-black/30"
                        }`}
                      >
                        <td className="px-4 sm:px-5 py-3 align-top">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-black/60 border border-gray-700 flex items-center justify-center">
                              <Sparkles className="h-3.5 w-3.5 text-accentGold" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-50">
                                #{row.rank} · {row.name}
                              </span>
                              <span className="text-[10px] text-gray-500">
                                Active network builder
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-4 sm:px-5 py-3 align-top text-gray-300">
                          {row.country}
                        </td>
                        <td className="px-4 sm:px-5 py-3 align-top text-gray-300">
                          {row.level1}
                        </td>
                        <td className="hidden md:table-cell px-4 sm:px-5 py-3 align-top text-gray-300">
                          {row.level2}
                        </td>
                        <td className="px-4 sm:px-5 py-3 align-top text-accentGreen font-semibold">
                          {row.monthlyCommission}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[10px] sm:text-[11px] text-gray-500/95">
                Leaderboard data is illustrative and based on simulated partner
                performance. Your actual results will depend on your network size,
                engagement and the quality of your referrals.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
