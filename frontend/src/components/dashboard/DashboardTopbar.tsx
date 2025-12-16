"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Moon, Sun, Bell, User, Shield, ChevronDown, LogOut, ArrowLeft } from "lucide-react";
import { apiFetch } from "@/lib/api";

type DashboardUser = {
  id: string;
  email: string;
  name?: string | null;
  username: string;
  role: string;
  emailVerifiedAt?: string | null;
};

type Props = {
  user: DashboardUser | null;
  loading: boolean;
  userError: string | null;
  onOpenSidebar: () => void;
  theme: "dark" | "light";
  onToggleTheme: () => void;
};

export default function DashboardTopbar({
  user,
  loading,
  userError,
  onOpenSidebar,
  theme,
  onToggleTheme,
}: Props) {
  const router = useRouter();

  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user?.username?.slice(0, 2).toUpperCase() ||
    "AG";

  const handleLogout = () => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem("token");
    document.cookie = "apex_token=; Max-Age=0; Path=/; SameSite=Lax;";
    window.location.href = "/login";
  };

  const [unreadCount, setUnreadCount] = useState<number>(0);

  async function fetchUnread() {
    try {
      const token =
        typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) return;

      const data = await apiFetch("/api/notifications/unread-count", {}, token);
      setUnreadCount(Number(data?.unreadCount ?? 0));
    } catch (e) {
      // silent fail (do not break topbar)
    }
  }

  useEffect(() => {
    fetchUnread();

    const onChanged = () => fetchUnread();
    window.addEventListener("apex:notifications:changed", onChanged as any);

    // ✅ NEW: also listen to a plain event name (if you dispatch that elsewhere)
    window.addEventListener("notifications:changed", onChanged as any);

    const t = window.setInterval(fetchUnread, 30000); // refresh every 30s

    return () => {
      window.removeEventListener("apex:notifications:changed", onChanged as any);
      window.removeEventListener("notifications:changed", onChanged as any);
      window.clearInterval(t);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-900/80 bg-gradient-to-b from-black/95 to-[#020617]/90 backdrop-blur">
      <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
          {/* Left: menu + page label */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile menu */}
            <button
              type="button"
              className="inline-flex lg:hidden items-center justify-center rounded-lg border border-gray-800 bg-black/70 p-1.5 text-gray-300 hover:border-accentGold hover:text-accentGold transition"
              onClick={onOpenSidebar}
              aria-label="Open sidebar"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* ✅ Back button (works for all dashboard pages) */}
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center rounded-lg border border-gray-800 bg-black/70 p-1.5 text-gray-300 hover:border-accentGold hover:text-accentGold transition"
              aria-label="Go back"
              title="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-semibold text-gray-50 truncate">
                  Dashboard Overview
                </h1>
                {!loading && user && !user.emailVerifiedAt && (
                  <span className="inline-flex items-center rounded-full border border-amber-500/60 bg-amber-500/10 px-2 py-[2px] text-[10px] text-amber-100">
                    Email not verified
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[260px] sm:max-w-[380px]">
                Monitor balances, active plans and referral performance in real time.
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification placeholder */}
            <Link
              href="/dashboard/notifications"
              className="hidden sm:inline-flex relative items-center justify-center rounded-lg border border-gray-800 bg-black/70 p-1.5 text-gray-300 hover:border-accentGold hover:text-accentGold transition"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />

              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accentGold text-black text-[10px] font-bold flex items-center justify-center border border-black/60">
                  +{unreadCount}
                </span>
              )}
            </Link>

            {/* Theme toggle */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="inline-flex items-center justify-center rounded-lg border border-gray-800 bg-black/70 px-2.5 py-1.5 text-[11px] font-medium text-gray-200 hover:border-accentGold hover:text-accentGold transition"
            >
              {theme === "dark" ? (
                <span className="flex items-center gap-1">
                  <Sun className="h-3.5 w-3.5" />
                  <span>Light</span>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Moon className="h-3.5 w-3.5" />
                  <span>Dark</span>
                </span>
              )}
            </button>

            {/* Profile avatar + dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-full border border-gray-800 bg-black/70 px-2 py-1.5 text-xs text-gray-100 hover:border-accentGold hover:text-accentGold transition"
              >
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[11px] font-semibold text-gray-50">
                  {initials}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-tight max-w-[120px]">
                  <span className="text-[11px] font-medium truncate">
                    {user?.name || user?.username || "Investor"}
                  </span>
                  <span className="text-[10px] text-gray-500 truncate">
                    {user?.role === "ADMIN" ? "Admin" : "Investor"}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl border border-gray-800 bg-black/95 shadow-xl shadow-black/60 py-2 text-xs z-40">
                  {/* Header */}
                  <div className="px-3 pb-2 border-b border-gray-800 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[11px] font-semibold text-gray-50">
                      {initials}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[12px] font-semibold text-gray-100 truncate">
                        {user?.name || user?.username || "Investor"}
                      </span>
                      <span className="text-[10px] text-gray-500 truncate">
                        {user?.email || "ApexGlobalEarnings"}
                      </span>
                    </div>
                  </div>

                  {/* Account */}
                  <Link
                    href="/dashboard/account"
                    className="flex items-start gap-2 px-3 py-2.5 hover:bg-gray-900/80 transition"
                    onClick={() => setProfileOpen(false)}
                  >
                    <div className="mt-[2px]">
                      <User className="h-4 w-4 text-accentGold" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-medium text-gray-100">
                        Account
                      </span>
                      <span className="text-[11px] text-gray-500">
                        View and edit your profile
                      </span>
                    </div>
                  </Link>

                  {/* Security */}
                  <Link
                    href="/dashboard/security"
                    className="flex items-start gap-2 px-3 py-2.5 hover:bg-gray-900/80 transition"
                    onClick={() => setProfileOpen(false)}
                  >
                    <div className="mt-[2px]">
                      <Shield className="h-4 w-4 text-accentGold" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-medium text-gray-100">
                        Security settings
                      </span>
                      <span className="text-[11px] text-gray-500">
                        Manage password and security
                      </span>
                    </div>
                  </Link>

                  {/* Divider */}
                  <div className="my-1 border-t border-gray-800" />

                  {/* Logout */}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-[12px] text-red-300 hover:bg-red-500/10 hover:text-red-200 transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
