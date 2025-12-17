"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import MainNavbar from "@/components/layout/MainNavbar";
import { Footer } from "@/components/layout/Footer";
import RobotGate from "@/components/security/RobotGate";
import CookieBanner from "@/components/common/CookieBanner";


type Props = {
  children: ReactNode;
};

export default function RootShell({ children }: Props) {
  const pathname = usePathname();

  // More defensive check so it works with potential locales/basePath
  const isDashboard =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname.includes("/dashboard");

  // 🌐 Public pages (home, about, etc.)
  if (!isDashboard) {
    return (
      <div className="bg-bg min-h-screen flex flex-col">
        <RobotGate />
        <MainNavbar />
        <main className="flex-1">{children}</main>
        <CookieBanner />
        <Footer />
      </div>
    );
  }

  // 📊 Dashboard pages – clean shell, no navbar/footer, background handled by dashboard layout
  return (
    <div className="min-h-screen">
      <RobotGate />
      {children}
    </div>
  );
}
