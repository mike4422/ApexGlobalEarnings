import Link from "next/link";

const FEATURES = [
  {
    id: 1,
    title: "Institutional-Grade Infrastructure",
    description:
      "Low-latency execution, deep liquidity access and a robust backend stack built to handle serious trading volume.",
    points: ["Real-time price feeds", "Secure wallet engine", "Scalable ROI engine"],
    badge: "Execution & Reliability",
    image: "/why-choose-1.png",
  },
  {
    id: 2,
    title: "Smart Investment Plans",
    description:
      "From Bronze to VIP, every plan is structured with clear minimums, transparent ROI and flexible durations.",
    points: ["Daily ROI updates", "Auto profit calculation", "Simple withdrawals"],
    badge: "Managed Investing",
    image: "/why-choose-2.png",
  },
  {
    id: 3,
    title: "Global Referral Ecosystem",
    description:
      "Earn from Level 1 and Level 2 commissions with a transparent referral tree and dedicated affiliate tools.",
    points: ["Unique referral links", "Multi-level payouts", "Live referral analytics"],
    badge: "Affiliate Rewards",
    image: "/why-choose-3.png",
  },
  {
    id: 4,
    title: "Security & Risk Controls",
    description:
      "Best practices around encryption, access control and withdrawal verification to protect your capital.",
    points: ["Secure sessions", "Manual & automated checks", "Auditable transaction logs"],
    badge: "Security First",
    image: "/why-choose-4.png",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-bgAlt/40 border-t border-gray-800/70">
      <div className="w-full max-w-[1400px] mx-auto page-padding py-14 md:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_minmax(0,1fr)] items-start">
          {/* ----------------- LEFT: TEXT & FEATURES GRID ----------------- */}
          <div className="space-y-8">
            {/* Section header */}
            <div className="space-y-4 max-w-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                Why Choose ApexGlobalEarnings
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
                A trading and investment experience
                <span className="text-accentGold"> built for serious investors.</span>
              </h2>
              <p className="text-sm sm:text-base text-gray-300/90">
                ApexGlobalEarnings combines a professional trading stack with managed
                investment plans, making it simple to grow your capital while keeping full
                visibility on risk, performance and payouts.
              </p>
            </div>

            {/* Features grid */}
            <div className="grid gap-5 sm:grid-cols-2">
              {FEATURES.map((feature) => (
                <div
                  key={feature.id}
                  className="card-glow hover-lift p-4 sm:p-5 text-sm slide-up"
                >
                  {/* Badge */}
                  <div className="mb-3 flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-accentGold/10 px-3 py-1 text-[11px] font-medium text-accentGold">
                      {feature.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base sm:text-lg font-semibold mb-2">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-gray-300/90 mb-3">
                    {feature.description}
                  </p>

                  {/* Bullets */}
                  <ul className="space-y-1.5 text-[11px] sm:text-xs text-gray-300">
                    {feature.points.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accentGreen" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* ----------------- RIGHT: VISUAL / TRUST CARD ----------------- */}
          <div className="space-y-5 lg:space-y-6">
            {/* Visual card with trader image */}
            <div className="overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-br from-bgAlt to-bg soft-shadow">
              {/* Image on top */}
              <div className="relative h-40 sm:h-48 md:h-56 w-full">
                <img
                  src="/istock4.jpg"
                  alt="Professional trader using ApexGlobalEarnings platform"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg/80 via-bg/30 to-transparent" />
              </div>

              {/* Text content below */}
              <div className="p-5 sm:p-6 flex flex-col gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-gray-300/80">
                    Built for performance
                  </p>
                  <h3 className="mt-1 text-lg sm:text-xl font-semibold">
                    A single platform for trading, investing and referrals.
                  </h3>
                </div>

                {/* Highlight metrics */}
                <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <p className="text-gray-300/80">Average Monthly Returns*</p>
                    <p className="mt-1 text-lg font-semibold text-accentGreen">
                      8.4%
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-300/80">Referral Payouts</p>
                    <p className="mt-1 text-lg font-semibold text-accentGold">
                      $280K+
                    </p>
                  </div>
                </div>

                {/* Disclaimer & CTA link */}
                <p className="text-[10px] text-gray-400/80">
                  *Past performance does not guarantee future results. Trading and
                  investing involve risk. Please trade responsibly.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/security"
                    className="inline-flex items-center text-xs sm:text-sm text-accentGold hover:text-yellow-300 transition-colors"
                  >
                    Learn more about our security &amp; risk controls
                  </Link>
                </div>
              </div>
            </div>

            {/* Trust / badges strip */}
            <div className="card-glow p-4 sm:p-5 text-[11px] sm:text-xs flex flex-col gap-3">
              <p className="text-gray-300/85">
                Trusted by active traders, long-term investors and affiliate partners
                across multiple markets worldwide.
              </p>
              <div className="flex flex-wrap items-center gap-3 text-gray-400">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 border border-gray-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-accentGreen" />
                  <span>Real-time trading tools</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 border border-gray-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-accentGold" />
                  <span>Transparent ROI tracking</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 border border-gray-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-accentGreen" />
                  <span>Level 1 &amp; Level 2 referrals</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
