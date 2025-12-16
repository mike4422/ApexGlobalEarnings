"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type FaqItem = {
  id: number;
  question: string;
  answer: string;
};

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 1,
    question: "What is ApexGlobalEarnings and how does it work?",
    answer:
      "ApexGlobalEarnings is a trading investment platform that combines real-time market tools with structured investment plans. You can fund your account in USD via supported cryptocurrencies, select a plan that matches your capital and risk profile, and track your portfolio, profits and referrals from a unified dashboard.",
  },
  {
    id: 2,
    question: "How are daily returns (ROI) calculated for each plan?",
    answer:
      "Each plan has a fixed daily ROI and duration. Your daily profit is calculated as (investment amount × daily ROI%), and the total projected profit is based on the number of days in the plan. The Calculator section on this page mirrors how returns are computed inside your live dashboard. Please note that all ROI figures are plan-based projections and do not represent guaranteed performance.",
  },
  {
    id: 3,
    question: "What are the minimum and maximum deposit amounts?",
    answer:
      "Minimum and maximum deposits depend on the plan you choose. For example, the Standard Plan starts from $200, the Professional Plan from $2,000, Premium Members from $30,000 and VIP Members from $301,000. You will always see the allowed range before confirming any investment.",
  },
  {
    id: 4,
    question: "How do withdrawals work and how long do they take?",
    answer:
      "You can request withdrawals directly from your dashboard, typically back to the crypto wallet you used for deposits or another verified address. Withdrawals may be subject to security checks and manual review, especially on larger amounts. Payout speed may depend on network congestion and internal verification steps, but our operations team aims to process requests as quickly as possible.",
  },
  {
    id: 5,
    question: "How does the referral program pay Level 1 and Level 2 commissions?",
    answer:
      "When someone signs up using your unique referral link and funds their account, they become your Level 1 referral. When your Level 1 referrals introduce others, those new users become your Level 2 network. You earn a percentage-based commission on eligible activity from both levels. Exact percentages are configured by the platform and shown transparently inside your referral dashboard.",
  },
  {
    id: 6,
    question: "Is my capital safe and what risks should I be aware of?",
    answer:
      "All forms of trading and investing involve risk, including the potential loss of capital. ApexGlobalEarnings implements security best practices around authentication, wallet infrastructure and withdrawal verification. However, market risk remains inherent to all investment activity. You should only invest funds you can afford to place at risk and always review plan details and risk disclosures before proceeding.",
  },
  {
    id: 7,
    question: "Do I need to complete KYC to use ApexGlobalEarnings?",
    answer:
      "At this stage, ApexGlobalEarnings uses email and password authentication without mandatory KYC for standard usage. However, additional verification or documentation may be requested for compliance or security reasons, particularly for high-value transactions or account reviews.",
  },
  {
    id: 8,
    question: "How can I contact support if I have questions about my account?",
    answer:
      "You can reach our support team directly from your dashboard or via the Contact page. Our team is available to help with funding, plan selection, referrals, technical questions and general account queries.",
  },
];

export default function FAQSection() {
  const [openId, setOpenId] = useState<number | null>(FAQ_ITEMS[0]?.id ?? null);

  const toggleItem = (id: number) => {
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <section
      id="faq"
      className="bg-bgAlt/40 border-t border-gray-800/70"
      aria-label="Frequently Asked Questions"
    >
      <div className="w-full max-w-[1400px] mx-auto page-padding py-14 md:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-start">
          {/* ---------- LEFT: FAQ LIST ---------- */}
          <div className="space-y-6 slide-up">
            {/* Header */}
            <div className="space-y-3 max-w-xl">
              <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                FAQ &amp; Key Information
              </p>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
                Answers to{" "}
                <span className="text-accentGold">common questions</span> about
                ApexGlobalEarnings.
              </h2>
              <p className="text-sm sm:text-base text-gray-300/90">
                If you are just getting started with the platform, these
                frequently asked questions will help you understand how funding,
                plans, withdrawals and referrals work in practice.
              </p>
            </div>

            {/* FAQ Accordion */}
            <div className="space-y-3">
              {FAQ_ITEMS.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <div
                    key={item.id}
                    className="card-glow bg-black/60 border border-gray-800 rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-3.5 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm sm:text-base font-medium text-gray-100">
                        {item.question}
                      </span>
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full bg-black/60 border border-gray-700 transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        <ChevronDown className="h-4 w-4 text-gray-300" />
                      </span>
                    </button>

                    {isOpen && (
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-gray-300/90 border-t border-gray-800/80">
                        <p className="pt-2 leading-relaxed">{item.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ---------- RIGHT: INFO CARD / ILLUSTRATION ---------- */}
          <div className="slide-up">
            <div className="card-glow bg-gradient-to-b from-bgAlt/80 via-black/70 to-bg/90 border border-gray-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
              {/* Illustration */}
              <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-black/60">
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
                <img
                  src="/faq-illustration.jpg"
                  alt="Investors reviewing trading and investment FAQs"
                  className="h-40 sm:h-48 md:h-56 w-full object-cover"
                />
              </div>

              {/* Quick highlights */}
              <div className="space-y-3 text-xs sm:text-sm text-gray-300/90">
                <h3 className="text-sm sm:text-base font-semibold text-gray-50">
                  Need clarity before funding your account?
                </h3>
                <p>
                  The FAQ is designed to give you a clear picture of how
                  ApexGlobalEarnings operates, including plan configuration,
                  expected ROI behaviour, withdrawal flows and referral
                  structures. If a question is not covered here, our support
                  team is always ready to help.
                </p>
                <ul className="space-y-1.5 text-[11px] sm:text-xs">
                  <li className="flex items-start gap-1.5">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accentGreen" />
                    <span>Transparent description of each investment plan.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accentGold" />
                    <span>Clear explanation of daily ROI, duration and payouts.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accentGreen" />
                    <span>
                      Guidance around referral earnings and network structure.
                    </span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accentGold" />
                    <span>
                      Risk reminders so you can make informed capital decisions.
                    </span>
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <div className="mt-2 text-[11px] sm:text-xs text-gray-400/90">
                Still have questions? Visit the Contact page or reach out from
                inside your ApexGlobalEarnings dashboard and our team will be happy
                to assist.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
