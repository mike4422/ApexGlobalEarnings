import Link from "next/link";
import {
  MapPin,
  Mail,
  Phone,
  Twitter,
  Instagram,
  Send,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-black border-t border-gray-900/80 mt-10">
      <div className="w-full max-w-[1400px] mx-auto page-padding py-10 md:py-12 lg:py-14">
        {/* --------------- TOP GRID --------------- */}
        <div className="grid gap-8 lg:gap-10 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] items-start slide-up">
          {/* Brand / summary */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="/logo.png"
                  alt="ApexGlobalEarnings Logo"
                  className="h-9 w-9 object-contain"
                />
                <span className="text-sm sm:text-base font-semibold tracking-wide">
                  <span className="text-accentGold">ApexGlobal</span>Earnings
                </span>
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-gray-300/90 max-w-md">
              ApexGlobalEarnings is a trading investment platform that combines
              live market tools, structured investment plans and referral
              rewards in a single, professional environment.
            </p>

            <div className="flex flex-wrap gap-2 text-[11px] sm:text-xs">
              <span className="inline-flex items-center rounded-full px-3 py-1 bg-black/60 border border-gray-800 text-gray-300">
                Trading &amp; Investments
              </span>
              <span className="inline-flex items-center rounded-full px-3 py-1 bg-black/60 border border-gray-800 text-gray-300">
                Managed ROI Plans
              </span>
              <span className="inline-flex items-center rounded-full px-3 py-1 bg-black/60 border border-gray-800 text-gray-300">
                Referral Ecosystem
              </span>
            </div>

            {/* Socials */}
            <div className="flex items-center gap-3 text-gray-400 pt-1">
              <span className="text-[11px] uppercase tracking-[0.18em]">
                Connect
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href="#"
                  aria-label="ApexGlobalEarnings on Twitter"
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-black/60 border border-gray-800 hover:border-accentGold hover:text-accentGold transition"
                >
                  <Twitter className="h-4 w-4" />
                </Link>
                <Link
                  href="#"
                  aria-label="ApexGlobalEarnings on Instagram"
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-black/60 border border-gray-800 hover:border-accentGold hover:text-accentGold transition"
                >
                  <Instagram className="h-4 w-4" />
                </Link>
                <Link
                  href="#"
                  aria-label="ApexGlobalEarnings on Telegram"
                  className="h-8 w-8 flex items-center justify-center rounded-full bg-black/60 border border-gray-800 hover:border-accentGold hover:text-accentGold transition"
                >
                  <Send className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Platform links */}
          <div className="space-y-3 text-xs sm:text-sm">
            <h3 className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-gray-400">
              Platform
            </h3>
            <div className="flex flex-col gap-2 text-gray-300/90">
              <Link
                href="/markets"
                className="hover:text-accentGold transition-colors"
              >
                Markets &amp; Trading
              </Link>
              <Link
                href="/#plans"
                className="hover:text-accentGold transition-colors"
              >
                Investment Plans
              </Link>
              <Link
                href="#calculator"
                className="hover:text-accentGold transition-colors"
              >
                Earnings Calculator
              </Link>
              <Link
                href="/referral"
                className="hover:text-accentGold transition-colors"
              >
                Referral &amp; Affiliates
              </Link>
              <Link
                href="/login"
                className="hover:text-accentGold transition-colors"
              >
                Client Dashboard
              </Link>
            </div>
          </div>

          {/* Company links */}
          <div className="space-y-3 text-xs sm:text-sm">
            <h3 className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-gray-400">
              Company
            </h3>
            <div className="flex flex-col gap-2 text-gray-300/90">
              <Link
                href="/about"
                className="hover:text-accentGold transition-colors"
              >
                About ApexGlobalEarnings
              </Link>
              <Link
                href="/security"
                className="hover:text-accentGold transition-colors"
              >
                Security &amp; Risk Controls
              </Link>
              <Link
                href="#testimonials"
                className="hover:text-accentGold transition-colors"
              >
                Client Testimonials
              </Link>
              <Link
                href="#faq"
                className="hover:text-accentGold transition-colors"
              >
                FAQs
              </Link>
              <Link
                href="/contact"
                className="hover:text-accentGold transition-colors"
              >
                Contact &amp; Support
              </Link>
            </div>
          </div>

          {/* Contact / legal */}
          <div className="space-y-4 text-xs sm:text-sm">
            <h3 className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-gray-400">
              Contact &amp; Registered Address
            </h3>

            <div className="space-y-2 text-gray-300/90">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-accentGold" />
                <p>
                  4th Floor, 58 Par-La-Ville Rd,<br />
                  Hamilton, HM11, Bermuda.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-accentGold" />
                <a
                  href="mailto:support@apexglobaleearnings.com"
                  className="hover:text-accentGold transition-colors"
                >
                  support@apexglobaleearnings.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-accentGold" />
                <span>+1 (000) 000-0000</span>
              </div>
            </div>

            <div className="text-[10px] sm:text-[11px] text-gray-500/95 space-y-2">
              <p>
                ApexGlobalEarnings is a trading investment platform providing
                access to markets, structured investment plans and referral
                rewards. Availability of services may depend on your
                jurisdiction.
              </p>
            </div>
          </div>
        </div>

        {/* --------------- SEPARATOR --------------- */}
        <div className="mt-8 border-t border-gray-900/80 pt-6 slide-up">
          {/* Bottom row */}
          <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-[10px] sm:text-[11px] text-gray-500/90">
            <p>
              © {new Date().getFullYear()} ApexGlobalEarnings. All rights
              reserved.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/terms"
                className="hover:text-accentGold transition-colors"
              >
                Terms &amp; Conditions
              </Link>
              <span className="h-3 w-px bg-gray-700 hidden sm:inline-block" />
              <Link
                href="/privacy"
                className="hover:text-accentGold transition-colors"
              >
                Privacy Policy
              </Link>
              <span className="h-3 w-px bg-gray-700 hidden sm:inline-block" />
              <Link
                href="/risk-disclosure"
                className="hover:text-accentGold transition-colors"
              >
                Risk Disclosure
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
