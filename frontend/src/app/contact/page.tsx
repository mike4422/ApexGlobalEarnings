import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Clock,
  ShieldCheck,
} from "lucide-react";

export const metadata = {
  title: "Contact | ApexGlobalEarnings Support & Sales",
  description:
    "Get in touch with the ApexGlobalEarnings team for account questions, partnership enquiries and platform support.",
};

export default function ContactPage() {
  return (
    <div className="bg-bg min-h-screen">
      {/* ------------ HERO / INTRO ------------ */}
      <section className="bg-bgAlt/40 border-b border-gray-800/70">
        <div className="w-full max-w-[1400px] mx-auto page-padding pt-24 pb-10 md:pt-28 md:pb-12 lg:pb-14">
          <div className="grid gap-8 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-center">
            {/* Left: copy */}
            <div className="space-y-4 slide-up">
              <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                Contact ApexGlobalEarnings
              </p>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight">
                We are here to{" "}
                <span className="text-accentGold">support your trading and investments.</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-300/90 max-w-xl">
                Whether you have a question about your account, payouts,
                affiliate program or platform features, the ApexGlobalEarnings team is ready
                to help. Choose the channel that works best for you or send us a
                direct message via the form.
              </p>

              <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/55 border border-gray-800 px-3 py-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-accentGreen" />
                  <span>Account &amp; security assistance</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-black/55 border border-gray-800 px-3 py-1">
                  <MessageCircle className="h-3.5 w-3.5 text-accentGold" />
                  <span>Partnership &amp; affiliate enquiries</span>
                </div>
              </div>
            </div>

            {/* Right: contact highlight card */}
            <div className="slide-up">
              <div className="card-glow bg-black/75 border border-gray-800 rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
                <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-black/60">
                  <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />
                  <img
                    src="/contact-hero.jpg"
                    alt="ApexGlobalEarnings support and account specialists in discussion"
                    className="h-40 sm:h-48 md:h-56 w-full object-cover"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm text-gray-300/90">
                  <div className="rounded-lg bg-black/70 border border-gray-800 p-3">
                    <p className="text-gray-400">Average first reply</p>
                    <p className="mt-1 text-lg font-semibold text-accentGreen">
                      &lt; 24 hours
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      For most account, payout and plan-related questions during business
                      hours.
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/70 border border-gray-800 p-3">
                    <p className="text-gray-400">Priority tickets</p>
                    <p className="mt-1 text-lg font-semibold text-accentGold">
                      VIP support
                    </p>
                    <p className="mt-1 text-[10px] text-gray-500">
                      High-value accounts and affiliates receive dedicated follow-up.
                    </p>
                  </div>
                </div>

                <p className="text-[10px] sm:text-[11px] text-gray-500/95">
                  Response times may vary depending on ticket volume and time zone.
                  For urgent security issues, contact us as soon as possible and include
                  “Security” in the subject line.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------ CONTACT INFO + FORM ------------ */}
      <section className="bg-bg">
        <div className="w-full max-w-[1400px] mx-auto page-padding py-10 md:py-12 lg:py-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.1fr)] items-start">
            {/* Contact details */}
            <div className="space-y-6 slide-up">
              <div className="space-y-3">
                <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
                  Contact channels
                </p>
                <h2 className="text-xl sm:text-2xl font-semibold leading-tight">
                  Reach the{" "}
                  <span className="text-accentGold">ApexGlobalEarnings support team.</span>
                </h2>
                <p className="text-sm sm:text-base text-gray-300/90">
                  Share as much context as possible when you contact us—this helps us
                  respond faster and with more accurate information about your account,
                  investments and referrals.
                </p>
              </div>

              <div className="space-y-4 text-xs sm:text-sm">
                {/* Email */}
                <div className="card-glow bg-black/75 border border-gray-800 rounded-2xl p-4 flex gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-black/60 border border-gray-700 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-accentGold" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-gray-50">Email support</p>
                    <p className="text-gray-300/90">
                      For account access, wallet changes, investment plans and general
                      questions.
                    </p>
                    <p className="text-accentGold text-[11px]">
                      support@apexgloberearnings.com
                    </p>
                  </div>
                </div>

                {/* Phone / chat */}
                <div className="card-glow bg-black/75 border border-gray-800 rounded-2xl p-4 flex gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-black/60 border border-gray-700 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-accentGreen" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-gray-50">Account &amp; partnership line</p>
                    <p className="text-gray-300/90">
                      Reserved for payout status, affiliate questions and larger
                      allocation discussions.
                    </p>
                    <p className="text-[11px] text-gray-400">
                      Phone details are provided inside verified client dashboards.
                    </p>
                  </div>
                </div>

                {/* Location */}
                <div className="card-glow bg-black/75 border border-gray-800 rounded-2xl p-4 flex gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-black/60 border border-gray-700 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-accentGold" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-gray-50">Office location</p>
                    <p className="text-gray-300/90">
                      4th Floor, 58 Par-La-Ville Rd,<br />
                      Hamilton, HM11, Bermuda.
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Meetings are by prior appointment only. Please contact us to
                      arrange a suitable time.
                    </p>
                  </div>
                </div>

                {/* Hours */}
                <div className="card-glow bg-black/75 border border-gray-800 rounded-2xl p-4 flex gap-3">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-black/60 border border-gray-700 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-accentGreen" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="font-semibold text-gray-50">Support hours</p>
                    <p className="text-gray-300/90">
                      Monday – Friday: 09:00 – 18:00 (platform time)<br />
                      Weekends &amp; holidays: limited coverage.
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Trading tools may operate 24/7 depending on the market; support
                      replies are prioritised during core hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="slide-up">
              <div className="card-glow bg-black/80 border border-gray-800 rounded-2xl p-5 sm:p-6 text-xs sm:text-sm">
                <h2 className="text-sm sm:text-base font-semibold text-gray-50 mb-1.5">
                  Send us a message.
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-400 mb-4">
                  Use this form for general questions, feedback or partnership enquiries.
                  For ticket follow-up, include your registered email and any relevant
                  reference IDs.
                </p>

                <form
                  action="#"
                  method="post"
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="fullName"
                        className="text-gray-300/90"
                      >
                        Full name
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required
                        autoComplete="name"
                        className="rounded-lg border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60"
                        placeholder="e.g. Daniel Okafor"
                      />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label
                        htmlFor="email"
                        className="text-gray-300/90"
                      >
                        Email address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="email"
                        className="rounded-lg border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="topic"
                      className="text-gray-300/90"
                    >
                      Subject
                    </label>
                    <select
                      id="topic"
                      name="topic"
                      className="rounded-lg border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60"
                      defaultValue="account"
                    >
                      <option value="account">Account / login</option>
                      <option value="plans">Investment plans &amp; ROI</option>
                      <option value="payouts">Deposits &amp; withdrawals</option>
                      <option value="affiliate">Affiliate &amp; partnerships</option>
                      <option value="technical">Technical issue</option>
                      <option value="other">Other enquiry</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="message"
                      className="text-gray-300/90"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      required
                      className="rounded-lg border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60 resize-none"
                      placeholder="Share details such as your registered email, plan type, approximate dates and what you need help with."
                    />
                  </div>

                  {/* Preferred contact */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="preferred"
                      className="text-gray-300/90"
                    >
                      Preferred contact method (optional)
                    </label>
                    <input
                      id="preferred"
                      name="preferred"
                      type="text"
                      className="rounded-lg border border-gray-700 bg-black/60 px-3 py-2 text-sm text-gray-50 outline-none focus:border-accentGold focus:ring-1 focus:ring-accentGold/60"
                      placeholder="e.g. Email reply, Telegram handle, phone call time window"
                    />
                  </div>

                  {/* Submit */}
                  <div className="pt-1.5 flex flex-col gap-2">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-lg bg-accentGold text-black px-4 py-2.5 text-sm font-semibold hover:bg-yellow-400 transition"
                    >
                      Submit message
                    </button>

                    <a
                      href="https://wa.me/447831864443"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-lg bg-[#25D366] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[#1ebe5d] transition mt-3"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 32 32"
                        fill="currentColor"
                        className="w-4 h-4 mr-2"
                      >
                        <path d="M19.11 17.23c-.28-.14-1.64-.81-1.89-.9-.25-.09-.43-.14-.61.14-.18.28-.7.9-.86 1.09-.16.18-.32.21-.6.07-.28-.14-1.18-.43-2.25-1.38-.83-.74-1.39-1.66-1.55-1.94-.16-.28-.02-.43.12-.57.13-.13.28-.32.42-.48.14-.16.18-.28.28-.46.09-.18.05-.35-.02-.49-.07-.14-.61-1.47-.83-2.01-.22-.53-.45-.46-.61-.47-.16-.01-.35-.01-.53-.01-.18 0-.46.07-.7.35-.25.28-.92.9-.92 2.19 0 1.29.94 2.54 1.07 2.71.14.18 1.85 2.83 4.48 3.97.63.27 1.12.43 1.51.55.63.2 1.2.17 1.65.1.5-.07 1.64-.67 1.87-1.31.23-.64.23-1.19.16-1.31-.07-.12-.25-.18-.53-.32z" />
                        <path d="M16.04 2.67C8.86 2.67 3.01 8.5 3.01 15.66c0 2.77.73 5.47 2.11 7.83L3 29.33l5.98-2.08a12.92 12.92 0 0 0 7.06 2.06h.01c7.18 0 13.03-5.83 13.03-12.99 0-3.47-1.35-6.73-3.81-9.19a12.96 12.96 0 0 0-9.23-3.8zm0 23.5h-.01c-2.35 0-4.66-.63-6.69-1.82l-.48-.28-3.55 1.23 1.19-3.46-.31-.5a10.84 10.84 0 0 1-1.66-5.74c0-6.01 4.9-10.9 10.92-10.9 2.91 0 5.64 1.13 7.7 3.19a10.84 10.84 0 0 1 3.19 7.7c0 6.01-4.9 10.88-10.9 10.88z" />
                      </svg>
                      Chat on WhatsApp
                    </a>


                    <p className="text-[10px] text-gray-500/95">
                      By submitting this form, you agree that ApexGlobalEarnings may
                      use the provided information to respond to your enquiry and
                      follow up where necessary.
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
