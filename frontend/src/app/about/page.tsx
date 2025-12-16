import { ShieldCheck, Globe2, LineChart, Users } from "lucide-react";

const STATS = [
  {
    label: "Active client accounts",
    value: "12,500+",
  },
  {
    label: "Markets & instruments",
    value: "40+",
  },
  {
    label: "Average uptime",
    value: "99.9%",
  },
  {
    label: "Average payout processing",
    value: "< 24 hrs",
  },
];

const VALUES = [
  {
    icon: <ShieldCheck className="h-5 w-5 text-accentGreen" />,
    title: "Risk-aware by design",
    description:
      "We prioritise risk controls, capital protection and clear parameters around every investment plan.",
  },
  {
    icon: <LineChart className="h-5 w-5 text-accentGold" />,
    title: "Performance with clarity",
    description:
      "Transparent daily ROI, clear plan durations and accessible reporting across all portfolios.",
  },
  {
    icon: <Users className="h-5 w-5 text-accentGreen" />,
    title: "Partner-first approach",
    description:
      "From individual traders to affiliate networks, our ecosystem is built to support long-term relationships.",
  },
  {
    icon: <Globe2 className="h-5 w-5 text-accentGold" />,
    title: "Global perspective",
    description:
      "Clients from multiple regions gain access to crypto, indices, metals and FX from a single platform.",
  },
];

export const metadata = {
  title: "About ApexGlobalEarnings | Our Story & Vision",
  description:
    "Learn more about ApexGlobalEarnings – a modern trading and investment platform focused on transparency, risk-aware returns and long-term partnerships.",
};

export default function AboutPage() {
  return (
    <div className="bg-bg min-h-screen">
      {/* ------------ HERO / INTRO ------------ */}
      <section className="bg-bgAlt/40 border-b border-gray-800/70">
        <div className="w-full max-w-[1400px] mx-auto page-padding pt-24 pb-10 md:pt-28 md:pb-12 lg:pb-14">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
            {/* Left: text */}
            <div className="space-y-4 slide-up">
              <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                About ApexGlobalEarnings
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
                A trading &amp; investment platform{" "}
                <span className="text-accentGold">
                  built for serious capital.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-gray-300/90 max-w-xl">
                ApexGlobalEarnings was created to bridge the gap between
                professional trading infrastructure and accessible investment
                products. Our mission is to make it simple for clients to
                allocate capital into structured plans while retaining full
                visibility on performance, risk and payouts.
              </p>
              <p className="text-sm sm:text-base text-gray-300/90 max-w-xl">
                From day one, we have focused on clear numbers, transparent
                reporting and a technology stack that can scale with active
                traders, long-term investors and affiliate partners around the
                world.
              </p>

              <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs pt-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/50 border border-gray-800 px-3 py-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-accentGreen" />
                  <span>Risk-aware, security-first approach</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/50 border border-gray-800 px-3 py-1">
                  <LineChart className="h-3.5 w-3.5 text-accentGold" />
                  <span>Real-time tools &amp; transparent ROI</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/50 border border-gray-800 px-3 py-1">
                  <Globe2 className="h-3.5 w-3.5 text-accentGreen" />
                  <span>Multi-region, multi-asset access</span>
                </div>
              </div>
            </div>

            {/* Right: hero image / card */}
            <div className="slide-up">
              <div className="card-glow bg-black/75 border border-gray-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-black/60">
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
                  <img
                    src="/about-hero.jpg"
                    alt="ApexGlobalEarnings team reviewing trading and investment performance"
                    className="h-40 sm:h-48 md:h-56 w-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm text-gray-300/90">
                  <div className="rounded-lg bg-black/70 border border-gray-800 p-3">
                    <p className="text-gray-400">Core focus</p>
                    <p className="mt-1 text-sm font-semibold text-accentGreen">
                      Technology-driven investing
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Combining a professional trading stack with structured ROI
                      plans and referral tools.
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/70 border border-gray-800 p-3">
                    <p className="text-gray-400">Approach</p>
                    <p className="mt-1 text-sm font-semibold text-accentGold">
                      Data, process, discipline
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Every plan, strategy and payout is rooted in clear rules
                      and transparent reporting.
                    </p>
                  </div>
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-500/95">
                  Trading and investing involve risk. ApexGlobalEarnings does not
                  provide investment advice; clients should always evaluate their
                  own risk tolerance and objectives before allocating capital.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------ STATS / SNAPSHOT ------------ */}
      <section className="bg-bg">
        <div className="w-full max-w-[1400px] mx-auto page-padding py-10 md:py-12 lg:py-14">
          <div className="card-glow bg-black/75 border border-gray-800 rounded-2xl px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                  Snapshot
                </p>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-50">
                  Where ApexGlobalEarnings stands today.
                </h2>
              </div>
              <p className="text-[10px] sm:text-[11px] text-gray-500 max-w-md">
                Figures are illustrative and may reflect rolling internal
                metrics. For the latest information, please refer to your
                live dashboard and platform disclosures.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs sm:text-sm">
              {STATS.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl bg-black/60 border border-gray-800 px-4 py-4 flex flex-col gap-1"
                >
                  <p className="text-[11px] text-gray-400">{stat.label}</p>
                  <p className="text-lg font-semibold text-accentGold">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------ OUR STORY & VALUES ------------ */}
      <section className="bg-bgAlt/40 border-t border-gray-800/70">
        <div className="w-full max-w-[1400px] mx-auto page-padding py-10 md:py-12 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.1fr)] items-start">
            {/* Story */}
            <div className="space-y-5 slide-up">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                  Our story
                </p>
                <h2 className="text-xl sm:text-2xl font-semibold leading-tight">
                  Built by traders,{" "}
                  <span className="text-accentGold">
                    designed for investors.
                  </span>
                </h2>
              </div>
              <p className="text-sm sm:text-base text-gray-300/90">
                ApexGlobalEarnings was founded by traders and technologists who
                saw how complex infrastructure, fragmented tools and opaque
                products were holding investors back. Our vision was simple:
                provide a single platform where clients could enrol into clear
                investment plans, monitor performance in real time and benefit
                from a global referral ecosystem.
              </p>
              <p className="text-sm sm:text-base text-gray-300/90">
                Today, ApexGlobalEarnings connects multi-asset trading tools,
                automated ROI calculations, manual risk checks and affiliate
                rewards into one cohesive environment. Every feature you see on
                the platform—from live charts and wallets to investment plans and
                analytics—is designed to serve that vision.
              </p>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-300/90">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accentGreen" />
                  <span>
                    Professional infrastructure on the backend, simplified
                    workflows on the frontend.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accentGold" />
                  <span>
                    Clear plan parameters: minimums, durations, daily ROI and
                    payout logic.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accentGreen" />
                  <span>
                    Integrated referral system to reward partners who help us
                    grow the ecosystem responsibly.
                  </span>
                </li>
              </ul>
            </div>

            {/* Values */}
            <div className="space-y-4 slide-up">
              <h3 className="text-sm sm:text-base font-semibold text-gray-50">
                The principles we operate by.
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 text-xs sm:text-sm">
                {VALUES.map((value) => (
                  <div
                    key={value.title}
                    className="card-glow bg-black/70 border border-gray-800 rounded-xl p-4 flex flex-col gap-2"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-black/60 border border-gray-700 flex items-center justify-center">
                        {value.icon}
                      </div>
                      <p className="font-semibold text-gray-50">
                        {value.title}
                      </p>
                    </div>
                    <p className="text-[11px] sm:text-xs text-gray-300/90">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
              <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-black/60 mt-3">
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
                <img
                  src="/about-team.jpg"
                  alt="ApexGlobalEarnings operations and risk team collaborating"
                  className="h-36 sm:h-40 md:h-44 w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------ GLOBAL & RESPONSIBLE ------------ */}
      <section className="bg-bg">
        <div className="w-full max-w-[1400px] mx-auto page-padding py-10 md:py-12 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] items-start">
            {/* Global presence */}
            <div className="space-y-4 slide-up">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                  Global perspective
                </p>
                <h2 className="text-xl sm:text-2xl font-semibold leading-tight">
                  Serving clients across{" "}
                  <span className="text-accentGold">multiple regions</span> and
                  time zones.
                </h2>
              </div>
              <p className="text-sm sm:text-base text-gray-300/90">
                ApexGlobalEarnings works with clients from different regions,
                each with unique trading styles, capital profiles and time zone
                constraints. Our platform is built to handle that diversity,
                providing 24/7 access to key markets such as crypto alongside
                extended-hours trading on major indices and metals.
              </p>
              <p className="text-sm sm:text-base text-gray-300/90">
                Whether you are a day trader, a long-term allocator or an
                affiliate community leader, our tools, dashboards and reporting
                are structured to be clear, consistent and accessible.
              </p>
              <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-black/60">
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/50 to-transparent" />
                <img
                  src="/about-global.jpg"
                  alt="Global financial skyline representing ApexGlobalEarnings markets"
                  className="h-40 sm:h-44 md:h-48 w-full object-cover"
                />
              </div>
            </div>

            {/* Responsibility & risk note */}
            <div className="space-y-4 slide-up">
              <h3 className="text-sm sm:text-base font-semibold text-gray-50">
                Responsible trading, clear communication.
              </h3>
              <div className="card-glow bg-black/75 border border-gray-800 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-gray-300/90 space-y-3">
                <p>
                  We believe that long-term relationships are only possible
                  when expectations are aligned. That is why ApexGlobalEarnings
                  emphasises clarity around how returns are calculated, how
                  withdrawals work, and how risk is managed on the backend.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accentGreen" />
                    <span>
                      Clear documentation explaining plan logic, ROI
                      assumptions and payout schedules.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accentGold" />
                    <span>
                      Manual checks on withdrawals and account activity to help
                      prevent abuse and protect client balances.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accentGreen" />
                    <span>
                      Dedicated channels for support, account questions and
                      affiliate-related queries.
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
