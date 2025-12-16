import Link from "next/link";

type Plan = {
  id: number;
  name: string;
  tag?: string;
  popular?: boolean;
  minDeposit: string;
  maxDeposit: string;
  dailyReturn: string;
  durationDays: number;
  totalReturnExample: string;
  bestFor: string;
  features: string[];
  exampleDeposit: string;
  exampleProfit: string;
  icon: string;
};

const PLANS: Plan[] = [
  {
    id: 1,
    name: "Standard Plan",
    tag: "Getting Started",
    minDeposit: "$200",
    maxDeposit: "$1,999",
    dailyReturn: "5%",
    durationDays: 5,
    totalReturnExample: "25% in 5 days",
    bestFor: "New investors testing the platform with controlled exposure.",
    features: [
      "Capital range: $200 – $1,999",
      "Daily ROI credited automatically",
      "Transparent performance tracking",
      "Fast withdrawal processing after plan ends",
    ],
    exampleDeposit: "$1,000",
    exampleProfit: "+$250 total profit",
    icon: "/plan-standard.png", // placeholder icon/image
  },
  {
    id: 2,
    name: "Professional Plan",
    tag: "Most Popular",
    popular: true,
    minDeposit: "$2,000",
    maxDeposit: "$29,900",
    dailyReturn: "15%",
    durationDays: 5,
    totalReturnExample: "75% in 5 days",
    bestFor:
      "Active traders and investors seeking higher short-term returns with elevated risk.",
    features: [
      "Capital range: $2,000 – $29,900",
      "Priority plan processing",
      "Enhanced referral earnings on active capital",
      "Support from a dedicated account liaison",
    ],
    exampleDeposit: "$10,000",
    exampleProfit: "+$7,500 total profit",
    icon: "/plan-professional.png",
  },
  {
    id: 3,
    name: "Premium Members",
    tag: "High Net-Worth",
    minDeposit: "$30,000",
    maxDeposit: "$300,000",
    dailyReturn: "30%",
    durationDays: 5,
    totalReturnExample: "150% in 5 days",
    bestFor:
      "Sophisticated investors willing to allocate significant capital for aggressive growth.",
    features: [
      "Capital range: $30,000 – $300,000",
      "Early access to new plan structures",
      "Priority review on withdrawals",
      "Detailed performance reporting",
    ],
    exampleDeposit: "$50,000",
    exampleProfit: "+$75,000 total profit",
    icon: "/plan-premium.png",
  },
  {
    id: 4,
    name: "VIP Members",
    tag: "Exclusive Tier",
    minDeposit: "$301,000",
    maxDeposit: "$1,000,000",
    dailyReturn: "45%",
    durationDays: 5,
    totalReturnExample: "225% in 5 days",
    bestFor:
      "Ultra high net-worth clients with a focus on aggressive, short-duration strategies.",
    features: [
      "Capital range: $301,000 – $1,000,000",
      "Highest daily ROI structure",
      "Direct communication with senior account team",
      "Enhanced referral commission overrides",
    ],
    exampleDeposit: "$300,000",
    exampleProfit: "+$675,000 total profit",
    icon: "/plan-vip.png",
  },
];

export default function PlansSection() {
  return (
    <section id="plans" className="bg-bg border-t border-gray-800/60">
      <div className="w-full max-w-[1400px] mx-auto page-padding py-14 md:py-16 lg:py-20">
        {/* ----------------- HEADER ----------------- */}
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <p className="text-xs uppercase tracking-[0.18em] text-accentGold mb-3">
            Investment Plans
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight mb-3">
            Choose the{" "}
            <span className="text-accentGold">plan that fits</span> your capital
            and risk profile.
          </h2>
          <p className="text-sm sm:text-base text-gray-300/90">
            Each plan is structured with clear minimums, maximums, daily ROI and
            duration so you always know how your capital is deployed. Returns
            are auto-calculated and visible inside your dashboard.
          </p>
        </div>

        {/* ----------------- PLANS GRID ----------------- */}
        <div className="grid gap-6 md:gap-7 lg:gap-8 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((plan) => {
            const isPopular = plan.popular;

            return (
              <div
                key={plan.id}
                className={`relative card-glow hover-lift slide-up flex flex-col h-full ${
                  isPopular
                    ? "border-accentGold/70 bg-gradient-to-b from-bgAlt to-bg"
                    : ""
                }`}
              >
                {/* Most popular badge */}
                {isPopular && (
                  <div className="absolute -top-3 left-4">
                    <span className="inline-flex items-center rounded-full bg-accentGold px-3 py-1 text-[11px] font-semibold text-black shadow-md">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Top section */}
                <div className="p-4 sm:p-5 flex flex-col gap-4">
                  {/* Icon + name */}
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                        {plan.tag}
                      </p>
                      <h3 className="text-lg sm:text-xl font-semibold mt-1">
                        {plan.name}
                      </h3>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-accentGold/10 border border-accentGold/40 flex items-center justify-center overflow-hidden">
                      <img
                        src={plan.icon}
                        alt={plan.name}
                        className="h-8 w-8 object-contain"
                      />
                    </div>
                  </div>

                  {/* ROI + duration summary */}
                  <div className="rounded-lg bg-black/40 border border-gray-800 p-3 text-xs sm:text-sm flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300/85">Daily Return</span>
                      <span className="font-semibold text-accentGreen">
                        {plan.dailyReturn}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300/85">Duration</span>
                      <span className="font-semibold">
                        {plan.durationDays} days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300/85">Total Potential ROI*</span>
                      <span className="font-semibold text-accentGold">
                        {plan.totalReturnExample}
                      </span>
                    </div>
                  </div>

                  {/* Min / Max */}
                  <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div>
                      <p className="text-gray-300/80">Min Deposit</p>
                      <p className="mt-1 font-semibold">{plan.minDeposit}</p>
                    </div>
                    <div>
                      <p className="text-gray-300/80">Max Deposit</p>
                      <p className="mt-1 font-semibold">{plan.maxDeposit}</p>
                    </div>
                  </div>

                  {/* Best for */}
                  <p className="text-[11px] sm:text-xs text-gray-300/90">
                    <span className="font-semibold text-gray-200">Best for: </span>
                    {plan.bestFor}
                  </p>
                </div>

                {/* Divider */}
                <div className="mx-4 sm:mx-5 border-t border-gray-800/80" />

                {/* Bottom section – features + example */}
                <div className="p-4 sm:p-5 flex flex-col gap-3 text-[11px] sm:text-xs flex-1">
                  <p className="text-gray-300/85 mb-1">
                    Key benefits in this plan:
                  </p>
                  <ul className="space-y-1.5 text-gray-300">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accentGreen" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Example projection */}
                  <div className="mt-4 rounded-lg bg-black/50 border border-gray-800 p-3">
                    <p className="text-[11px] text-gray-300/90 mb-1">
                      Example projection:
                    </p>
                    <p className="text-xs font-semibold text-gray-100">
                      Invest {plan.exampleDeposit} →{" "}
                      <span className="text-accentGreen">
                        {plan.exampleProfit}*
                      </span>
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <Link
                      href="/register"
                      className={`inline-flex flex-1 items-center justify-center rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold transition ${
                        isPopular
                          ? "bg-accentGold text-black hover:bg-yellow-400"
                          : "bg-accentGold/10 text-accentGold hover:bg-accentGold/20"
                      }`}
                    >
                      Get Started
                    </Link>
                    <Link
                      href="/login"
                      className="hidden sm:inline-flex items-center justify-center rounded-lg px-3 py-2 text-xs sm:text-sm border border-gray-700 hover:border-accentGold transition text-gray-100"
                    >
                      Log in
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
