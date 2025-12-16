"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";

type MeUser = {
  id: string;
  email: string;
  name?: string | null;
  username: string;
  role: string;
  emailVerifiedAt?: string | null;
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<MeUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [themeReady, setThemeReady] = useState(false);

  // ---------- THEME SETUP ----------
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("apex-theme") as
      | "dark"
      | "light"
      | null;
    let initial: "dark" | "light" = "dark";

    if (stored) {
      initial = stored;
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      initial = prefersDark ? "dark" : "light";
    }

    setTheme(initial);
    setThemeReady(true);

    const root = document.documentElement;
    if (initial === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window === "undefined") return;
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      localStorage.setItem("apex-theme", next);
      const root = document.documentElement;
      if (next === "dark") root.classList.add("dark");
      else root.classList.remove("dark");
      return next;
    });
  };

  // ---------- AUTH + USER LOADING & PROTECTION ----------
  useEffect(() => {
    async function loadUser() {
      if (typeof window === "undefined") return;

      // 1) Try localStorage token
      let token = localStorage.getItem("token");

      // 2) If missing, try to recover from cookie "apex_token"
      if (!token) {
        const match = document.cookie.match(
          /(?:^|;\s*)apex_token=([^;]+)/
        );
        if (match) {
          token = decodeURIComponent(match[1]);
          // keep localStorage in sync for apiFetch
          localStorage.setItem("token", token);
        }
      }

      // 3) If still no token → redirect to login
      if (!token) {
        setLoadingUser(false);
        const from =
          typeof window !== "undefined"
            ? window.location.pathname
            : "/dashboard";
        router.replace(`/login?from=${encodeURIComponent(from)}`);
        return;
      }

      // 4) If token exists, call /api/auth/me
      try {
        const data = await apiFetch("/api/auth/me", {}, token);
        setUser(data.user as MeUser);
        setUserError(null);
      } catch (err: any) {
        console.error(err);
        const msg = err?.message || "Failed to load user profile.";

        // If backend says unauthorized / expired → redirect to login
        if (
          msg.toLowerCase().includes("unauthorized") ||
          msg.toLowerCase().includes("expired") ||
          msg.toLowerCase().includes("invalid token")
        ) {
          // Clear bad token
          localStorage.removeItem("token");
          document.cookie =
            "apex_token=; Max-Age=0; Path=/; SameSite=Lax;";
          setLoadingUser(false);
          router.replace("/login");
          return;
        }

        // Any other error → show error but keep on page
        setUser(null);
        setUserError(msg);
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, [router]);

  // While theme not initialized, avoid flicker
  if (!themeReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-sm text-gray-300/80">Loading dashboard...</p>
      </div>
    );
  }

  const isLight = theme === "light";

  return (
    // outer wrapper – theme-aware
    <div
      className={`min-h-screen ${
        isLight ? "bg-white text-slate-900" : "bg-[#020617] text-gray-100"
      }`}
    >
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <DashboardSidebar
          user={user}
          loading={loadingUser}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main column */}
        <div
          className={`flex-1 min-w-0 flex flex-col ${
            isLight
              ? "bg-gradient-to-br from-white via-slate-50 to-slate-100"
              : "bg-gradient-to-br from-black via-[#020617] to-[#020617]"
          }`}
        >
          {/* Topbar */}
          <DashboardTopbar
            user={user}
            loading={loadingUser}
            userError={userError}
            onOpenSidebar={() => setSidebarOpen(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
          />

          {/* Content */}
          <main className="flex-1">
            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pb-8 pt-4">
              {loadingUser && (
                <div className="py-4">
                  <div className="h-5 w-40 rounded bg-gray-800/80 animate-pulse mb-2" />
                  <div className="h-4 w-64 rounded bg-gray-800/80 animate-pulse" />
                </div>
              )}

              {userError && !loadingUser && (
                <div className="mt-2 mb-4 rounded-xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-200">
                  {userError}
                </div>
              )}

              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
