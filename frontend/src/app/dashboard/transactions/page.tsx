"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCcw,
  Receipt,
  Search,
  XCircle,
} from "lucide-react";

type TxRow = {
  id: string;
  kind: "TRANSACTION" | "WITHDRAWAL";
  type: "DEPOSIT" | "INVESTMENT_RETURN" | "REFERRAL_EARNING" | "WITHDRAWAL";
  asset: "BTC" | "ETH" | "USDT" | "GOLD" | "NAS100" | string;
  network: "TRC20" | "BEP20" | "ERC20" | null;
  amount: number; // USD
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED" | "APPROVED" | "REJECTED" | string;
  reference: string | null;
  meta?: any;
  createdAt: string;
};

function formatMoney(n: number) {
  const v = Number.isFinite(n) ? n : 0;
  return v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function maskAddress(a: string) {
  if (!a) return "";
  if (a.length <= 14) return a;
  return `${a.slice(0, 7)}…${a.slice(-7)}`;
}

function statusPill(status: string) {
  const s = String(status || "").toUpperCase();
  if (s === "COMPLETED" || s === "APPROVED") {
    return "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
  }
  if (s === "PENDING") {
    return "border-amber-500/40 bg-amber-500/10 text-amber-200";
  }
  if (s === "FAILED" || s === "REJECTED" || s === "CANCELLED") {
    return "border-red-500/40 bg-red-500/10 text-red-200";
  }
  return "border-gray-700 bg-black/40 text-gray-200";
}

function typeBadge(t: TxRow["type"]) {
  const type = String(t || "");
  if (type === "DEPOSIT") return "Deposit";
  if (type === "WITHDRAWAL") return "Withdrawal";
  if (type === "INVESTMENT_RETURN") return "Investment Return";
  if (type === "REFERRAL_EARNING") return "Referral Earning";
  return type;
}

function typeIcon(t: TxRow["type"]) {
  if (t === "DEPOSIT") return <ArrowDownLeft className="h-4 w-4 text-emerald-300" />;
  if (t === "WITHDRAWAL") return <ArrowUpRight className="h-4 w-4 text-amber-300" />;
  return <Receipt className="h-4 w-4 text-accentGold" />;
}

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [rows, setRows] = useState<TxRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("ALL");
  const [status, setStatus] = useState<string>("ALL");
  const [asset, setAsset] = useState<string>("ALL");

  async function load() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setErr("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setErr(null);
      const data = await apiFetch("/api/wallet/transactions/my?take=200", {}, token);
      setRows((data.transactions || []) as TxRow[]);
    } catch (e: any) {
      setErr(e.message || "Failed to load transactions.");
    } finally {
      setLoading(false);
    }
  }

  async function refresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const assets = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) s.add(String(r.asset));
    return ["ALL", ...Array.from(s).sort((a, b) => a.localeCompare(b))];
  }, [rows]);

  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (type !== "ALL" && String(r.type) !== type) return false;
      if (status !== "ALL" && String(r.status) !== status) return false;
      if (asset !== "ALL" && String(r.asset) !== asset) return false;

      if (!qq) return true;

      const ref = String(r.reference || "").toLowerCase();
      const id = String(r.id || "").toLowerCase();
      const metaAddr = String(r?.meta?.targetAddress || "").toLowerCase();

      return id.includes(qq) || ref.includes(qq) || metaAddr.includes(qq);
    });
  }, [rows, q, type, status, asset]);

  const stats = useMemo(() => {
    const total = filtered.length;
    const completed = filtered
      .filter((r) => ["COMPLETED", "APPROVED"].includes(String(r.status).toUpperCase()))
      .reduce((sum, r) => sum + (Number(r.amount) || 0), 0);

    const pending = filtered.filter((r) => String(r.status).toUpperCase() === "PENDING").length;

    return { total, completed, pending };
  }, [filtered]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
          <div className="h-5 w-52 rounded bg-gray-800/80 animate-pulse mb-2" />
          <div className="h-4 w-80 rounded bg-gray-800/80 animate-pulse" />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5">
            <div className="h-4 w-28 rounded bg-gray-800/80 animate-pulse mb-3" />
            <div className="h-6 w-24 rounded bg-gray-800/80 animate-pulse" />
          </div>
          <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5">
            <div className="h-4 w-28 rounded bg-gray-800/80 animate-pulse mb-3" />
            <div className="h-6 w-28 rounded bg-gray-800/80 animate-pulse" />
          </div>
          <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5">
            <div className="h-4 w-28 rounded bg-gray-800/80 animate-pulse mb-3" />
            <div className="h-6 w-20 rounded bg-gray-800/80 animate-pulse" />
          </div>
        </div>

        <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
          <div className="h-4 w-40 rounded bg-gray-800/80 animate-pulse mb-3" />
          <div className="h-40 rounded bg-gray-800/50 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-50">Transactions</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
              View all deposits, withdrawals, referral earnings, and investment returns associated with your account.
            </p>
          </div>

          <button
            type="button"
            onClick={refresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-800 bg-black/70 px-3 py-2 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition disabled:opacity-60"
          >
            <RefreshCcw className="h-4 w-4" />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Alerts */}
      {err && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-100 flex gap-2">
          <XCircle className="h-4 w-4 mt-[2px] text-red-300" />
          <span>{err}</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5">
          <p className="text-[11px] text-gray-400">Transactions</p>
          <p className="mt-2 text-xl font-semibold text-gray-50">{stats.total}</p>
        </div>
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5">
          <p className="text-[11px] text-gray-400">Completed total (USD)</p>
          <p className="mt-2 text-xl font-semibold text-gray-50">${formatMoney(stats.completed)}</p>
        </div>
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5">
          <p className="text-[11px] text-gray-400">Pending</p>
          <p className="mt-2 text-xl font-semibold text-gray-50">{stats.pending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          <div className="flex items-center gap-2 text-gray-200">
            <Filter className="h-4 w-4 text-accentGold" />
            <p className="text-sm font-semibold">Filters</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[260px_160px_160px_180px] w-full lg:w-auto">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by ID / reference / address"
                className="w-full rounded-lg border border-gray-800 bg-black/70 pl-9 pr-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
              />
            </div>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
            >
              <option value="ALL">All types</option>
              <option value="DEPOSIT">Deposit</option>
              <option value="WITHDRAWAL">Withdrawal</option>
              <option value="REFERRAL_EARNING">Referral earning</option>
              <option value="INVESTMENT_RETURN">Investment return</option>
            </select>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
            >
              <option value="ALL">All status</option>
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="FAILED">Failed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <select
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              className="w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
            >
              {assets.map((a) => (
                <option key={a} value={a}>
                  {a === "ALL" ? "All assets" : a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-0 overflow-hidden">
        {/* Desktop table */}
        <div className="hidden lg:block">
          <div className="border-b border-gray-800 bg-black/40 px-5 py-4">
            <div className="flex items-center gap-2 text-gray-200">
              <Clock className="h-4 w-4 text-accentGold" />
              <p className="text-sm font-semibold">History</p>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="px-5 py-10 text-sm text-gray-400">No transactions found for your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-black/30 text-gray-400">
                  <tr>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium">Type</th>
                    <th className="px-5 py-3 font-medium">Asset</th>
                    <th className="px-5 py-3 font-medium">Amount (USD)</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 font-medium">Reference / Destination</th>
                  </tr>
                </thead>
                <tbody className="text-gray-200">
                  {filtered.map((r) => {
                    const dest = r?.meta?.targetAddress ? String(r.meta.targetAddress) : "";
                    const showRef = r.reference ? String(r.reference) : dest ? maskAddress(dest) : "—";

                    return (
                      <tr key={r.id} className="border-t border-gray-800/80">
                        <td className="px-5 py-3 text-gray-300">
                          {new Date(r.createdAt).toLocaleString()}
                        </td>

                        <td className="px-5 py-3">
                          <div className="inline-flex items-center gap-2">
                            {typeIcon(r.type)}
                            <span className="font-medium">{typeBadge(r.type)}</span>
                          </div>
                        </td>

                        <td className="px-5 py-3">
                          <span className="font-medium">{r.asset}</span>
                          {r.network ? <span className="text-gray-400"> / {r.network}</span> : null}
                        </td>

                        <td className="px-5 py-3 font-semibold">${formatMoney(r.amount)}</td>

                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] ${statusPill(r.status)}`}>
                            {String(r.status).toUpperCase() === "PENDING" ? (
                              <Clock className="h-3.5 w-3.5" />
                            ) : ["COMPLETED", "APPROVED"].includes(String(r.status).toUpperCase()) ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <XCircle className="h-3.5 w-3.5" />
                            )}
                            {r.status}
                          </span>
                        </td>

                        <td className="px-5 py-3 text-gray-300">
                          <span className="break-all">{showRef}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Mobile / Tablet cards */}
        <div className="lg:hidden p-5 sm:p-6">
          <div className="flex items-center gap-2 text-gray-200 mb-4">
            <Clock className="h-4 w-4 text-accentGold" />
            <p className="text-sm font-semibold">History</p>
          </div>

          {filtered.length === 0 ? (
            <div className="text-sm text-gray-400">No transactions found for your filters.</div>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => {
                const dest = r?.meta?.targetAddress ? String(r.meta.targetAddress) : "";
                const showRef = r.reference ? String(r.reference) : dest ? maskAddress(dest) : "—";

                return (
                  <div key={r.id} className="rounded-2xl border border-gray-800 bg-black/50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {typeIcon(r.type)}
                        <div>
                          <p className="text-sm font-semibold text-gray-50">{typeBadge(r.type)}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            {new Date(r.createdAt).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] ${statusPill(r.status)}`}>
                        {r.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[11px] text-gray-400">Asset</p>
                        <p className="text-sm text-gray-100 font-medium">
                          {r.asset}
                          {r.network ? <span className="text-gray-400"> / {r.network}</span> : null}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-gray-400">Amount (USD)</p>
                        <p className="text-sm text-gray-100 font-semibold">${formatMoney(r.amount)}</p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-[11px] text-gray-400">Reference / Destination</p>
                      <p className="text-[12px] text-gray-200 break-all">{showRef}</p>
                    </div>

                    <div className="mt-3 text-[10px] text-gray-500">
                      ID: <span className="break-all">{r.id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
