"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, MapPin } from "lucide-react";  // <-- added MapPin icon

export default function MainNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 backdrop-blur-xl transition-all duration-300 ${
        scrolled ? "bg-black/40 shadow-lg shadow-black/40" : "bg-black/10"
      }`}
    >

     {/* --------------------------------------------------
    LOCATION BAR (NEW — HIDE ON SCROLL)
-------------------------------------------------- */}
    <div
    className={`w-full bg-black/60 border-b border-gray-800 transition-all duration-300 overflow-hidden ${
        scrolled ? "max-h-0 opacity-0" : "max-h-[40px] opacity-100"
    }`}
    >
    <div className="mx-auto px-2 w-full max-w-[1400px] h-[34px] flex items-center gap-2 text-[12px] text-gray-300">
        <MapPin size={14} className="text-accentGold" />
        <span>4th Floor, 58 Par-La-Ville Rd, Hamilton, HM11, Bermuda.</span>
    </div>
    </div>


      {/* --------------------------------------------------
          ORIGINAL NAVBAR (UNCHANGED)
      -------------------------------------------------- */}
      <nav className="mx-auto px-2 h-[70px] flex items-center justify-between w-full max-w-[1400px]">
        {/* ----------- LOGO SECTION ----------- */}
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="ApexGlobalEarnings Logo"
            className="w-27 h-27 object-contain mt-1"
          />
        </Link>

        {/* ----------- DESKTOP NAV ----------- */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          <Link
            href="/markets"
            className="hover:text-accentGold transition-colors"
          >
            Markets
          </Link>

          <Link
            href="/#plans"
            className="hover:text-accentGold transition-colors"
          >
            Investment Plans
          </Link>

          <Link
            href="/charts"
            className="hover:text-accentGold transition-colors"
          >
            Trading Charts
          </Link>

          <Link
            href="/referral"
            className="hover:text-accentGold transition-colors"
          >
            Affiliate Program
          </Link>

          {/* Company dropdown (desktop only) */}
          <div className="group relative cursor-pointer">
            <span className="hover:text-accentGold transition-colors">
              Company
            </span>

            <div className="absolute invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all duration-200 bg-bgAlt border border-gray-800 rounded-xl w-48 p-3 top-6 shadow-xl">
              <Link
                href="/about"
                className="block py-2 px-2 text-sm hover:text-accentGold"
              >
                About Us
              </Link>
              <Link
                href="/security"
                className="block py-2 px-2 text-sm hover:text-accentGold"
              >
                Security
              </Link>
              <Link
                href="/contact"
                className="block py-2 px-2 text-sm hover:text-accentGold"
              >
                Contact
              </Link>
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/register"
            className="px-5 py-2 rounded-lg bg-accentGold text-black text-sm font-semibold hover:bg-yellow-400 transition"
          >
            Start Investing
          </Link>

          {/* Login Button */}
          <Link
            href="/login"
            className="px-4 py-2 rounded-lg border border-gray-700 hover:border-accentGold transition"
          >
            Login
          </Link>
        </div>

        {/* ----------- MOBILE MENU BUTTON ----------- */}
        <button
          className="md:hidden text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* ----------- MOBILE MENU ----------- */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 bg-bgAlt border-t border-gray-800 ${
          mobileOpen ? "max-h-[420px] py-4" : "max-h-0 py-0"
        }`}
      >
        <div className="container mx-auto px-4 flex flex-col gap-4 text-sm">
          <Link
            href="/markets"
            onClick={() => setMobileOpen(false)}
            className="hover:text-accentGold transition"
          >
            Markets
          </Link>
          <Link
            href="/#plans"
            onClick={() => setMobileOpen(false)}
            className="hover:text-accentGold transition"
          >
            Investment Plans
          </Link>
          <Link
            href="/charts"
            onClick={() => setMobileOpen(false)}
            className="hover:text-accentGold transition"
          >
            Trading Charts
          </Link>
          <Link
            href="/referral"
            onClick={() => setMobileOpen(false)}
            className="hover:text-accentGold transition"
          >
            Affiliate Program
          </Link>

          {/* Company Accordion */}
          <details className="text-sm">
            <summary className="cursor-pointer">Company</summary>
            <div className="flex flex-col ml-4 mt-2 gap-2">
              <Link
                href="/about"
                onClick={() => setMobileOpen(false)}
                className="hover:text-accentGold"
              >
                About Us
              </Link>
              <Link
                href="/security"
                onClick={() => setMobileOpen(false)}
                className="hover:text-accentGold"
              >
                Security
              </Link>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="hover:text-accentGold"
              >
                Contact
              </Link>
            </div>
          </details>

          {/* CTA & Login */}
          <Link
            href="/register"
            onClick={() => setMobileOpen(false)}
            className="w-full text-center px-5 py-3 rounded-lg bg-accentGold text-black font-semibold hover:bg-yellow-400 transition"
          >
            Start Investing
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="w-full text-center px-4 py-3 rounded-lg border border-gray-700 hover:border-accentGold transition"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  );
}
