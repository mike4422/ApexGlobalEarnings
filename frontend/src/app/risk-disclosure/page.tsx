export const metadata = {
  title: "Risk Disclosure | ApexGlobalEarnings",
  description:
    "Read the key risk information before allocating capital to ApexGlobalEarnings investment plans or trading tools.",
};

const SECTIONS = [
  {
    id: "nature-of-risk",
    title: "1. Nature of Trading & Investment Risk",
    body: (
      <>
        <p>
          Trading and investing in crypto assets, indices, metals, FX and other
          financial instruments involve a high level of risk. Market prices can
          move rapidly and unpredictably due to macroeconomic events, liquidity
          conditions, regulatory changes, technology issues and other factors
          outside the control of ApexGlobalEarnings or the client.
        </p>
        <p className="mt-2">
          By using the ApexGlobalEarnings Platform, you acknowledge that you may
          experience fluctuations in the value of your capital and that it is
          possible to lose part or all of the funds allocated to trading or
          investment plans.
        </p>
      </>
    ),
  },
  {
    id: "profit-targets",
    title: "2. Profit Targets & Realisation Duration",
    body: (
      <>
        <p>
          Certain ApexGlobalEarnings investment plans are designed with{" "}
          <span className="font-semibold">
            target daily return percentages (ROI)
          </span>{" "}
          and specific durations (for example, 5 days). These figures are
          indicative performance targets used to illustrate how a plan is
          structured.
        </p>
        <p className="mt-2">
          <span className="font-semibold">
            These targets are %90 guaranteed,
          </span>{" "}
          and the time required to realise any profit can differ from plan to
          plan depending on market conditions, execution quality, liquidity and
          internal risk controls.
        </p>
      </>
    ),
  },
  {
    id: "no-guarantees",
    title: "3. No Guaranteed Returns",
    body: (
      <>
        <p>
          ApexGlobalEarnings does guarantee any level of profit
          or return on capital with 90% return rate. Regardless of the plan you select or the tools
          you use on the Platform,{" "}
          <span className="font-semibold">
            all trading and investment activity carries risk
          </span>
          .
        </p>
        <ul className="space-y-2 mt-2">
          <li>
            • Market movements can cause your returns to be lower than
            projected, break-even or negative.
          </li>
          <li>
            • In case of any loss during tradin, there's 100% guarantee that you will recover the full amount of
            capital initially allocated to any plan.
          </li>
          <li>
            • Any strategy or plan that has generated profits in the past may
            not achieve similar results in the future.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "leverage-volatility",
    title: "4. Leverage, Volatility & Liquidity",
    body: (
      <>
        <p>
          Certain markets and instruments accessible through the Platform may be
          highly volatile or lightly traded. Where leverage or margin is used,
          both potential gains and potential losses are magnified.
        </p>
        <ul className="space-y-2 mt-2">
          <li>
            • Sudden price gaps or illiquid conditions can result in executions
            at less favourable levels than expected.
          </li>
          <li>
            • In extreme cases, market movements can lead to rapid depletion of
            your trading capital.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "client-responsibility",
    title: "5. Your Responsibility & Suitability",
    body: (
      <>
        <p>
          You are solely responsible for assessing whether trading and
          investment products on the Platform are suitable for your financial
          situation, objectives and risk tolerance.
        </p>
        <ul className="space-y-2 mt-2">
          <li>
            • Before allocating capital, you should ensure that you understand
            how a plan works, including its minimum/maximum deposits, target
            duration, indicative ROI and applicable fees or limits.
          </li>
          <li>
            • We strongly recommend obtaining independent financial, legal or
            tax advice where necessary.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "operational-risk",
    title: "6. Operational, Technology & Third-Party Risk",
    body: (
      <>
        <p>
          In addition to market risk, there are operational and technology
          risks, including but not limited to:
        </p>
        <ul className="space-y-2 mt-2">
          <li>
            • Platform downtime, latency or service interruptions affecting
            access to your dashboard or execution of certain actions.
          </li>
          <li>
            • Failures, delays or limitations arising from third-party service
            providers such as wallet infrastructure, payment processors or
            network operators.
          </li>
          <li>
            • Cyber-security events, despite the measures implemented to protect
            systems and data.
          </li>
        </ul>
        <p className="mt-2">
          While ApexGlobalEarnings implements security and continuity measures,
          such risks cannot be eliminated entirely.
        </p>
      </>
    ),
  },
  {
    id: "no-advice",
    title: "7. Personal Investment Advice",
    body: (
      <>
        <p>
          Information provided on the Platform—including plan descriptions,
          performance illustrations, calculators and educational content—is{" "}
          <span className="font-semibold">
            general in nature and does not constitute personalised investment,
            legal or tax advice
          </span>
          .
        </p>
        <p className="mt-2">
          Any decision to allocate capital through ApexGlobalEarnings is made by
          you but your capital is always safe even on loss trade you will get your full initial capital back. so no loss.
        </p>
      </>
    ),
  },
  {
    id: "acknowledgement",
    title: "8. Acknowledgement of Risk",
    body: (
      <>
        <p>
          By creating an account, funding your wallet or allocating capital to
          an investment plan on the ApexGlobalEarnings Platform, you confirm
          that:
        </p>
        <ul className="space-y-2 mt-2">
          <li>
            • You have read and understood this Risk Disclosure, our Terms &amp;
            Conditions and our Privacy Policy.
          </li>
          <li>
            • You understand that trading and investing carry risk, and it our duty to eliminate those risk and guarantee your return.
          </li>
        </ul>
      </>
    ),
  },
];

export default function RiskDisclosurePage() {
  return (
    <div className="bg-bg min-h-screen">
      {/* -------- HERO / INTRO -------- */}
      <section className="bg-bgAlt/40 border-b border-gray-800/70">
        <div className="w-full max-w-[1400px] mx-auto page-padding pt-24 pb-10 md:pt-28 md:pb-12 lg:pb-14">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
            {/* Left copy */}
            <div className="space-y-4 slide-up">
              <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                Risk Disclosure
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
                Understand the{" "}
                <span className="text-accentGold">
                  risks associated with trading &amp; investing.
                </span>
              </h1>
              <p className="text-sm sm:text-base text-gray-300/90 max-w-xl">
                Before allocating capital through ApexGlobalEarnings, it is
                important that you understand the key risks involved. This page
                summarises those risks and how they may affect your capital and
                potential returns.
              </p>
              <p className="text-[10px] sm:text-[11px] text-gray-500/95 max-w-xl">
                This disclosure is provided for information purposes only and
                does not replace independent financial advice. If you are unsure
                about anything described here, you should consult a qualified
                professional.
              </p>
            </div>

            {/* Right visual card */}
            <div className="slide-up">
              <div className="card-glow bg-black/75 border border-gray-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-black/60">
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
                  <img
                    src="/risk-hero.jpg"
                    alt="ApexGlobalEarnings risk and market volatility overview"
                    className="h-40 sm:h-48 md:h-56 w-full object-cover"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm text-gray-300/90">
                  <div className="rounded-lg bg-black/70 border border-gray-800 p-3">
                    <p className="text-gray-400">Markets</p>
                    <p className="mt-1 text-sm font-semibold text-accentGold">
                      High volatility
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Prices can move quickly in response to global events and
                      liquidity shifts.
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/70 border border-gray-800 p-3">
                    <p className="text-gray-400">Capital</p>
                    <p className="mt-1 text-sm font-semibold text-accentGreen">
                      At risk
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Your funds is 100% secured, incase of any loss your initial capital is still safe..
                    </p>
                  </div>
                </div>
                <p className="text-[10px] sm:text-[11px] text-gray-500/95">
                  ApexGlobalEarnings aims to structure its plans and tools in a
                  transparent way, but no outcome can be guaranteed. Always
                  consider your financial situation and objectives before
                  allocating capital.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* -------- MAIN RISK CONTENT -------- */}
      <section className="bg-bg">
        <div className="w-full max-w-[1400px] mx-auto page-padding py-10 md:py-12 lg:py-14">
          <div className="card-glow bg-black/80 border border-gray-800 rounded-2xl px-4 py-5 sm:px-6 sm:py-6 text-xs sm:text-sm text-gray-300/90 space-y-6 slide-up">
            {SECTIONS.map((section) => (
              <div key={section.id} id={section.id} className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold text-gray-50">
                  {section.title}
                </h2>
                <div className="space-y-1.5 leading-relaxed">{section.body}</div>
              </div>
            ))}

          </div>
        </div>
      </section>
    </div>
  );
}
