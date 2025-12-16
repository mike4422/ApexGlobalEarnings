"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  Users,
  Link2,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Gift,
  RefreshCw,
} from "lucide-react";

type ReferralUserRow = {
  id: string;
  username: string;
  email: string;
  name?: string | null;
  joinedAt: string;
  totalDepositsCents: number;
  depositsCount: number;
  lastDepositAt: string | null;
};

type ReferralOverviewDTO = {
  me: {
    referralCode: string | null;
  };
  stats: {
    referredCount: number;
    referralCommissionCents: number;
    totalReferredDepositsCents: number;
  };
  referredUsers: ReferralUserRow[];
};

function formatCurrencyFromCents(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format((cents || 0) / 100);
}

export default function ReferralsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [data, setData] = useState<ReferralOverviewDTO | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const referralCode = data?.me?.referralCode || "";
  const referralLink = useMemo(() => {
    if (typeof window === "undefined") return "";
    const origin = window.location.origin;
    // Adjust this path if your register route differs:
    return referralCode ? `${origin}/register?ref=${encodeURIComponent(referralCode)}` : "";
  }, [referralCode]);

  async function load(isRefresh = false) {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setErr("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setErr(null);
      if (isRefresh) setRefreshing(true);
      const res = (await apiFetch("/api/referrals/overview", {}, token)) as ReferralOverviewDTO;
      setData(res);
    } catch (e: any) {
      setErr(e.message || "Failed to load referrals.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copy(text: string, label = "Copied") {
    setMsg(null);
    setErr(null);

    if (!text) {
      setErr("Nothing to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setMsg(`${label} to clipboard.`);
      setTimeout(() => setMsg(null), 1500);
    } catch {
      setErr("Unable to copy. Please copy manually.");
    }
  }

  if (loading) {
    return (
      <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
        <div className="h-5 w-44 rounded bg-gray-800/80 animate-pulse mb-2" />
        <div className="h-4 w-72 rounded bg-gray-800/80 animate-pulse" />
      </div>
    );
  }

  if (err && !data) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-200 flex gap-2">
        <AlertTriangle className="h-4 w-4 mt-[2px] text-red-300" />
        <span>{err}</span>
      </div>
    );
  }

  const referred = data?.referredUsers || [];
  const stats = data?.stats;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-50">Referrals</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
              Share your referral link to invite new investors. You earn commission when your referrals
              complete deposits (credited automatically based on your platform referral settings).
            </p>
          </div>

          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-800 bg-black/70 px-3 py-2 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition disabled:opacity-60"
          >
            <RefreshCw className="h-4 w-4" />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {msg && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm text-emerald-100 flex gap-2">
          <CheckCircle2 className="h-4 w-4 mt-[2px] text-emerald-300" />
          <span>{msg}</span>
        </div>
      )}
      {err && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-100 flex gap-2">
          <AlertTriangle className="h-4 w-4 mt-[2px] text-red-300" />
          <span>{err}</span>
        </div>
      )}

      {/* Top cards */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)]">
        {/* Link + code */}
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Link2 className="h-4 w-4 text-accentGold" />
              <h2 className="text-sm font-semibold text-gray-50">Your referral link</h2>
            </div>
            <button
              type="button"
              onClick={() => copy(referralLink, "Referral link copied")}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
              disabled={!referralLink}
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
          </div>

          <div className="mt-4 rounded-xl border border-gray-800 bg-black/70 p-4">
            <p className="text-[11px] text-gray-400">Referral URL</p>
            <p className="mt-2 text-xs sm:text-sm text-gray-100 break-all">
              {referralLink || "Referral code not available yet."}
            </p>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-800 bg-black/70 p-4">
              <p className="text-[11px] text-gray-400">Referral code</p>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-sm font-semibold text-gray-100">{referralCode || "—"}</p>
                <button
                  type="button"
                  onClick={() => copy(referralCode, "Referral code copied")}
                  className="inline-flex items-center justify-center rounded-lg border border-gray-800 bg-black/70 px-2.5 py-2 text-xs text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
                  disabled={!referralCode}
                  title={referralCode ? "Copy code" : "No code"}
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-[10px] text-gray-500">
                Use this code if someone cannot open your referral link.
              </p>
            </div>

            <div className="rounded-xl border border-gray-800 bg-black/70 p-4">
              <p className="text-[11px] text-gray-400">How it works</p>
              <ul className="mt-2 space-y-1 text-[11px] text-gray-400">
                <li>• Share your link/code</li>
                <li>• Referred user registers</li>
                <li>• When their deposit is approved, you earn commission</li>
                <li>• You receive an email when commission is credited</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4 text-accentGold" />
            <h2 className="text-sm font-semibold text-gray-50">Referral performance</h2>
          </div>

          <div className="mt-4 grid gap-3">
            <StatRow
              icon={<Users className="h-4 w-4" />}
              label="Total referred users"
              value={stats ? String(stats.referredCount) : "0"}
            />
            <StatRow
              icon={<Gift className="h-4 w-4" />}
              label="Total referral commission"
              value={stats ? formatCurrencyFromCents(stats.referralCommissionCents) : "$0.00"}
              accent="text-emerald-200"
            />
            <StatRow
              icon={<Gift className="h-4 w-4" />}
              label="Referred deposits (volume)"
              value={stats ? formatCurrencyFromCents(stats.totalReferredDepositsCents) : "$0.00"}
            />
          </div>

          <div className="mt-4 rounded-xl border border-gray-800 bg-black/70 p-4">
            <p className="text-[11px] text-gray-400">
              Commission is credited based on your platform referral settings. If your totals do not update immediately,
              refresh after deposits are approved by admin.
            </p>
          </div>
        </div>
      </div>

      {/* Referred users list */}
      <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-50">Your referred users</h2>
            <p className="text-xs text-gray-400 mt-1">
              Users who registered using your referral link/code, including their approved deposit activity.
            </p>
          </div>
        </div>

        {referred.length === 0 ? (
          <div className="mt-5 rounded-xl border border-gray-800 bg-black/70 p-6 text-center">
            <p className="text-sm text-gray-200 font-medium">No referrals yet</p>
            <p className="mt-1 text-xs text-gray-400">
              Share your referral link above to start earning commission.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-800">
            <table className="min-w-[980px] w-full text-left text-xs">
              <thead className="bg-black/50">
                <tr className="text-gray-300">
                  <th className="px-3 py-3 font-semibold">Joined</th>
                  <th className="px-3 py-3 font-semibold">User</th>
                  <th className="px-3 py-3 font-semibold">Email</th>
                  <th className="px-3 py-3 font-semibold">Approved deposits</th>
                  <th className="px-3 py-3 font-semibold">Deposit count</th>
                  <th className="px-3 py-3 font-semibold">Last deposit</th>
                </tr>
              </thead>
              <tbody>
                {referred.map((u) => (
                  <tr key={u.id} className="border-t border-gray-800">
                    <td className="px-3 py-3 text-gray-300">
                      {new Date(u.joinedAt).toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-gray-200">
                      <div className="font-semibold">{u.username}</div>
                      <div className="text-[11px] text-gray-500">{u.name || "—"}</div>
                    </td>
                    <td className="px-3 py-3 text-gray-300">{u.email}</td>
                    <td className="px-3 py-3 text-gray-200 font-semibold">
                      {formatCurrencyFromCents(u.totalDepositsCents)}
                    </td>
                    <td className="px-3 py-3 text-gray-300">{u.depositsCount}</td>
                    <td className="px-3 py-3 text-gray-300">
                      {u.lastDepositAt ? new Date(u.lastDepositAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-black/70 px-4 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg border border-gray-800 bg-black/70 flex items-center justify-center text-gray-300">
          {icon}
        </div>
        <div>
          <p className="text-[11px] text-gray-400">{label}</p>
        </div>
      </div>
      <p className={`text-sm font-semibold text-gray-100 ${accent || ""}`}>{value}</p>
    </div>
  );
}
