import {
  ShieldCheck,
  Lock,
  KeyRound,
  Server,
  Eye,
  AlertTriangle,
  Globe2,
  Smartphone,
} from "lucide-react";

export const metadata = {
  title: "Platform Security | ApexGlobalEarnings",
  description:
    "Learn how ApexGlobalEarnings protects client accounts, wallets and data through layered security controls and risk-aware processes.",
};

const LAYERS = [
  {
    icon: <ShieldCheck className="h-5 w-5 text-accentGreen" />,
    title: "Account & session security",
    description:
      "Strict login controls, secure password hashing and device-sensitive session management to protect access to your account.",
    bullets: [
      "Hashed & salted credentials",
      "Session timeouts and revocation",
      "Suspicious-login monitoring",
    ],
  },
  {
    icon: <Lock className="h-5 w-5 text-accentGold" />,
    title: "Wallet & payout controls",
    description:
      "Multi-step verification and manual checks around deposits, wallet changes and withdrawal approvals.",
    bullets: [
      "Dedicated wallet engine and audit logs",
      "Manual verification for high-value payouts",
      "Change-of-wallet review and cool-down windows",
    ],
  },
  {
    icon: <Server className="h-5 w-5 text-accentGreen" />,
    title: "Infrastructure & monitoring",
    description:
      "Hardened servers, encrypted connections and continuous monitoring for anomalies across the platform.",
    bullets: [
      "TLS encryption for all traffic",
      "Isolated application and database layers",
      "Infrastructure monitoring & alerting",
    ],
  },
  {
    icon: <Eye className="h-5 w-5 text-accentGold" />,
    title: "Transparency & reporting",
    description:
      "Clear information about plan logic, ROI calculations and payout processing directly inside your dashboard.",
    bullets: [
      "Real-time balance & ROI view",
      "Downloadable transaction history",
      "In-app explanations for key processes",
    ],
  },
];

const PRACTICES = [
  {
    title: "Data protection",
    description:
      "Client data is handled with strict access controls and used solely for operating your account, complying with legal requirements and improving the platform.",
  },
  {
    title: "Withdrawal verification",
    description:
      "Every withdrawal request is checked against account activity, plan status and internal risk parameters before being processed.",
  },
  {
    title: "Operational segregation",
    description:
      "Responsibilities for technology, operations and risk oversight are separated to reduce the likelihood of single-point failures.",
  },
  {
    title: "Continuous improvement",
    description:
      "Security reviews, monitoring and internal training are an ongoing process, not a one-off event.",
  },
];

export default function SecurityPage() {
  return (
    <div className="bg-bg min-h-screen">
      {/* ---------- HERO ---------- */}
      <section className="bg-bgAlt/40 border-b border-gray-800/70">
        <div className="w-full max-w-[1400px] mx-auto page-padding pt-24 pb-10 md:pt-28 md:pb-12 lg:pb-14">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
            {/* Left: copy */}
            <div className="space-y-4 slide-up">
              <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                Platform Security
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
                Safeguarding your{" "}
                <span className="text-accentGold">capital, data and access</span>{" "}
                on ApexGlobalEarnings.
              </h1>
              <p className="text-sm sm:text-base text-gray-300/90 max-w-xl">
                ApexGlobalEarnings is built on the principle that performance is
                meaningful only when it is backed by robust security controls.
                We combine modern infrastructure, layered account protection and
                clear operational processes to help protect your funds and
                information.
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/55 border border-gray-800 px-3 py-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-accentGreen" />
                  <span>Layered protection</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/55 border border-gray-800 px-3 py-1">
                  <Lock className="h-3.5 w-3.5 text-accentGold" />
                  <span>Secure wallets &amp; payouts</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/55 border border-gray-800 px-3 py-1">
                  <Globe2 className="h-3.5 w-3.5 text-accentGreen" />
                  <span>Always-on monitoring</span>
                </div>
              </div>
            </div>

            {/* Right: hero visual card */}
            <div className="slide-up">
              <div className="card-glow bg-black/75 border border-gray-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-black/60">
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
                  <img
                    src="/security-hero.jpg"
                    alt="ApexGlobalEarnings security operations monitoring the platform"
                    className="h-40 sm:h-48 md:h-56 w-full object-cover"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm text-gray-300/90">
                  <div className="rounded-lg bg-black/70 border border-gray-800 p-3">
                    <p className="text-gray-400">Infrastructure uptime</p>
                    <p className="mt-1 text-lg font-semibold text-accentGreen">
                      99.9%
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Targeted uptime for trading tools, dashboards and wallet
                      access.
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/70 border border-gray-800 p-3">
                    <p className="text-gray-400">Security checks</p>
                    <p className="mt-1 text-lg font-semibold text-accentGold">
                      24 / 7
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      Continuous monitoring of key systems and payout flows.
                    </p>
                  </div>
                </div>

                <p className="text-[10px] sm:text-[11px] text-gray-500/95">
                  Figures are indicative and reflect internal targets. ApexGlobalEarnings
                  continuously improves its controls as technology and threats
                  evolve.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- LAYERS OF SECURITY ---------- */}
      <section className="bg-bg">
        <div className="w-full max-w-[1400px] mx-auto page-padding py-10 md:py-12 lg:py-14">
          <div className="space-y-6 max-w-3xl slide-up">
            <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
              Layers of protection
            </p>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold leading-tight">
              Security that spans{" "}
              <span className="text-accentGold">
                accounts, wallets and infrastructure.
              </span>
            </h2>
            <p className="text-sm sm:text-base text-gray-300/90">
              Instead of relying on a single control, ApexGlobalEarnings applies
              multiple layers of security. Each layer is designed to reduce a
              specific category of risk—from unauthorised account access, to
              malicious withdrawal attempts, to infrastructure failures.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-xs sm:text-sm">
            {LAYERS.map((layer) => (
              <div
                key={layer.title}
                className="card-glow bg-black/75 border border-gray-800 rounded-2xl p-4 flex flex-col gap-2"
              >
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-black/60 border border-gray-700 flex items-center justify-center">
                    {layer.icon}
                  </div>
                  <p className="font-semibold text-gray-50">{layer.title}</p>
                </div>
                <p className="text-[11px] sm:text-xs text-gray-300/90">
                  {layer.description}
                </p>
                <ul className="mt-1 space-y-1.5 text-[10px] sm:text-[11px] text-gray-400">
                  {layer.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-1.5">
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accentGreen" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- OPERATIONAL PRACTICES & RESPONSIBLE USE ---------- */}
      <section className="bg-bgAlt/40 border-t border-gray-800/70">
        <div className="w-full max-w-[1400px] mx-auto page-padding py-10 md:py-12 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)] items-start">
            {/* Operational security practices */}
            <div className="space-y-5 slide-up">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                  Operational security
                </p>
                <h2 className="text-xl sm:text-2xl font-semibold leading-tight">
                  Controls that go beyond{" "}
                  <span className="text-accentGold">technology alone.</span>
                </h2>
              </div>
              <p className="text-sm sm:text-base text-gray-300/90">
                Technology is only one part of a secure platform. ApexGlobalEarnings
                combines technical measures with defined processes, oversight and
                human review where it matters most—especially around withdrawals
                and changes to critical account details.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 text-xs sm:text-sm">
                {PRACTICES.map((p) => (
                  <div
                    key={p.title}
                    className="card-glow bg-black/75 border border-gray-800 rounded-xl p-4 flex flex-col gap-2"
                  >
                    <p className="font-semibold text-gray-50">{p.title}</p>
                    <p className="text-[11px] sm:text-xs text-gray-300/90">
                      {p.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Responsible usage & client-side tips */}
            <div className="space-y-4 slide-up">
              <h3 className="text-sm sm:text-base font-semibold text-gray-50">
                How you can help keep your account secure.
              </h3>
              <div className="card-glow bg-black/80 border border-gray-800 rounded-2xl p-4 sm:p-5 text-xs sm:text-sm text-gray-300/90 space-y-3">
                <p>
                  Security is a shared responsibility. While ApexGlobalEarnings
                  provides the infrastructure, controls and monitoring, there are
                  important steps you can take to strengthen your own protection.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <KeyRound className="mt-[2px] h-4 w-4 text-accentGold flex-shrink-0" />
                    <span>
                      Use a strong, unique password for your ApexGlobalEarnings
                      account and avoid sharing it with anyone.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Smartphone className="mt-[2px] h-4 w-4 text-accentGreen flex-shrink-0" />
                    <span>
                      Always access the platform from trusted devices and
                      networks. Avoid logging in from shared or public systems
                      when possible.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Eye className="mt-[2px] h-4 w-4 text-accentGold flex-shrink-0" />
                    <span>
                      Be cautious of unsolicited messages or links claiming to
                      represent ApexGlobalEarnings. Always verify the URL
                      before signing in.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertTriangle className="mt-[2px] h-4 w-4 text-accentGreen flex-shrink-0" />
                    <span>
                      Contact support immediately if you notice unusual login
                      activity, unexpected withdrawal requests or changes you
                      did not initiate.
                    </span>
                  </li>
                </ul>
                <p className="text-[10px] text-gray-500/95">
                  ApexGlobalEarnings does not ask for your password, seed
                  phrase or full private keys. If you receive any such request,
                  treat it as suspicious and notify support.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
