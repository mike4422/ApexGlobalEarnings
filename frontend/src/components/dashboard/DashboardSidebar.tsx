"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LineChart,
  Wallet,
  Layers,
  Receipt,
  Users,
  Settings,
  LifeBuoy,
  LogOut,
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  Shield,
} from "lucide-react";

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
  open: boolean;
  onClose: () => void;
};

const baseNavItems = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Investments",
    href: "/dashboard/investments",
    icon: LineChart,
  },
  {
    label: "Plans",
    href: "/dashboard/plans",
    icon: Layers,
  },
  {
    label: "Wallets",
    href: "/dashboard/wallet",
    icon: Wallet,
  },
  {
    label: "Deposit",
    href: "/dashboard/deposit",
    icon: ArrowDownCircle,
  },
  {
    label: "Withdrawals",
    href: "/dashboard/withdraw",
    icon: ArrowUpCircle,
  },
  {
    label: "Transactions",
    href: "/dashboard/transactions",
    icon: Receipt,
  },
  {
    label: "Referrals",
    href: "/dashboard/referrals",
    icon: Users,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export default function DashboardSidebar({
  user,
  loading,
  open,
  onClose,
}: Props) {
  const pathname = usePathname();

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    user?.username?.slice(0, 2).toUpperCase() ||
    "AG";

  // Add admin link only for admin users
  const navItems = [
    ...baseNavItems,
    ...(user?.role === "ADMIN"
      ? [
          {
            label: "Admin",
            href: "/dashboard/admin",
            icon: Shield,
          },
        ]
      : []),
  ];

  const content = (
    <div className="flex h-full flex-col bg-black/90 border-r border-gray-800/80 shadow-[0_0_35px_rgba(0,0,0,0.65)]">
      {/* Brand + close (mobile) */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-gray-800/80">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-tr from-accentGold/10 via-accentGold/30 to-yellow-500/60 border border-accentGold/70 flex items-center justify-center text-xs font-bold text-black shadow-lg shadow-accentGold/30">
            A
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[13px] font-semibold tracking-wide">
              ApexGlobalEarnings
            </span>
            <span className="text-[10px] text-gray-400">
              Investor Dashboard
            </span>
          </div>
        </Link>

        <button
          type="button"
          onClick={onClose}
          className="lg:hidden inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-700 bg-black/60 text-gray-300 hover:border-accentGold/70 hover:text-accentGold transition"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* User summary */}
      <div className="px-4 pt-4 pb-4 border-b border-gray-800/80 text-xs">
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-10 w-10 rounded-full bg-gray-800/80" />
            <div className="h-3 w-24 bg-gray-700/60 rounded" />
            <div className="h-2.5 w-32 bg-gray-800/80 rounded" />
          </div>
        ) : user ? (
          <div className="flex flex-col gap-2">
            {/* Big profile avatar */}
            <div className="h-11 w-11 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-[13px] font-semibold text-gray-50 shadow-md shadow-black/50">
              {initials}
            </div>

            <div className="flex flex-col gap-0.5">
              <p className="text-[13px] font-semibold text-gray-100">
                {user.name || user.username}
              </p>
              <p className="text-[11px] text-gray-400 truncate">
                {user.email}
              </p>
            </div>

            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-flex items-center rounded-full border border-accentGold/60 bg-accentGold/10 px-2 py-0.5 text-[10px] font-medium text-accentGold">
                {user.role === "ADMIN" ? "Admin" : "Investor"}
              </span>
              {!user.emailVerifiedAt && (
                <span className="inline-flex items-center rounded-full border border-amber-500/60 bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-300">
                  Unverified email
                </span>
              )}
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-red-400">
            Unable to load account details.
          </p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 text-xs">
        <ul className="space-y-1.5 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href ||
              pathname.startsWith(item.href + "/");

            const baseClasses =
              "flex items-center gap-2.5 rounded-lg px-3 py-2 transition border border-transparent bg-transparent text-gray-300 hover:border-accentGold/60 hover:bg-accentGold/5 hover:text-accentGold";
            const activeClasses = active
              ? " border-accentGold/80 bg-accentGold/10 text-accentGold"
              : "";

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={baseClasses + activeClasses}
                  onClick={onClose}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[12px] font-medium">
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer / support / sign out */}
      <div className="border-t border-gray-800/80 px-3 py-3 text-[11px] space-y-2">
        <Link
          href="/dashboard/support"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-300 hover:text-accentGold hover:bg-accentGold/5 transition"
        >
          <LifeBuoy className="h-3.5 w-3.5" />
          <span>Support &amp; help centre</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined") {
              window.localStorage.removeItem("token");
              document.cookie =
                "apex_token=; Max-Age=0; Path=/; SameSite=Lax;";
              window.location.href = "/login";
            }
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-red-300 hover:bg-red-500/10 hover:text-red-200 transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 xl:w-72">
        {content}
      </aside>

      {/* Mobile sidebar (overlay) */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden">
          <div className="absolute inset-y-0 left-0 w-64 max-w-[80%]">
            {content}
          </div>
          <button
            type="button"
            className="absolute inset-0 w-full h-full"
            onClick={onClose}
            aria-label="Close sidebar overlay"
          />
        </div>
      )}
    </>
  );
}
