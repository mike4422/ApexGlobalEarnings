"use client";

import { ReactNode, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";

type DashboardUser = {
  id: string;
  email: string;
  name?: string | null;
  username: string;
  role: string;
  emailVerifiedAt?: string | null;
};

type Props = {
  children: ReactNode;
};

export default function DashboardShell({ children }: Props) {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [userError, setUserError] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [themeReady, setThemeReady] = useState(false);

  // Theme init
  useEffect(() => {
    if (typeof window === "undefined") return;

    const stored = localStorage.getItem("apex-theme") as "dark" | "light" | null;
    let initial: "dark" | "light" = "dark";

    if (stored) {
      initial = stored;
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      initial = prefersDark ? "dark" : "light";
    }

    setTheme(initial);
    setThemeReady(true);

    const root = document.documentElement;
    if (initial === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
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

  // Load user
  useEffect(() => {
    async function loadUser() {
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;

        if (!token) {
          setUserError("You are not logged in.");
          setUser(null);
          return;
        }

        const data = await apiFetch("/api/auth/me", {}, token);
        setUser(data.user as DashboardUser);
      } catch (err: any) {
        console.error(err);
        setUserError(err.message || "Failed to load profile.");
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    }

    loadUser();
  }, []);

  // Avoid flicker while theme is not ready
  if (!themeReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <p className="text-sm text-gray-300/80">Loading dashboard...</p>
      </div>
    );
  }

  // 🔷 Clean dashboard background + layout
  return (
    <div className="min-h-screen bg-[#020617] text-gray-100">
      <div className="flex min-h-screen">
        {/* Sidebar (your component) */}
        <DashboardSidebar
          user={user}
          loading={loadingUser}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content area */}
        <div className="flex-1 min-w-0 flex flex-col bg-gradient-to-br from-black via-[#020617] to-[#020617]">
          <DashboardTopbar
            user={user}
            loading={loadingUser}
            userError={userError}
            onOpenSidebar={() => setSidebarOpen(true)}
            theme={theme}
            onToggleTheme={toggleTheme}
          />

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
