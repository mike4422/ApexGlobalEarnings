"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import {
  ArrowDownToLine,
  Wallet,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

type WalletsDTO = {
  BTC: string | null;
  ETH: string | null;
  USDT_TRC20: string | null;
  USDT_BEP20: string | null;
  USDT_ERC20: string | null;
};

type WithdrawSummaryDTO = {
  balance: number;
  pending: number;
  available: number;
};

type MyWithdrawalRow = {
  id: string;
  asset: "BTC" | "ETH" | "USDT";
  network: "TRC20" | "BEP20" | "ERC20" | null;
  targetAddress: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt?: string | null;
};

function maskAddress(a: string) {
  if (!a) return "";
  if (a.length <= 12) return a;
  return `${a.slice(0, 6)}…${a.slice(-6)}`;
}

function statusBadge(s: MyWithdrawalRow["status"]) {
  if (s === "APPROVED") return "border-emerald-500/40 bg-emerald-500/10 text-emerald-100";
  if (s === "REJECTED") return "border-red-500/40 bg-red-500/10 text-red-100";
  return "border-yellow-500/40 bg-yellow-500/10 text-yellow-100";
}

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}

export default function WithdrawPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [wallets, setWallets] = useState<WalletsDTO | null>(null);
  const [summary, setSummary] = useState<WithdrawSummaryDTO | null>(null);
  const [rows, setRows] = useState<MyWithdrawalRow[]>([]);

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    asset: "BTC" as "BTC" | "ETH" | "USDT",
    network: "TRC20" as "TRC20" | "BEP20" | "ERC20",
    amount: "",
  });

  const token = useMemo(() => {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
  }, []);

  const destination = useMemo(() => {
    if (!wallets) return null;

    if (form.asset === "BTC") return { label: "Bitcoin (BTC)", address: wallets.BTC, network: null as any };
    if (form.asset === "ETH") return { label: "Ethereum (ETH)", address: wallets.ETH, network: null as any };

    // USDT
    const map = {
      TRC20: wallets.USDT_TRC20,
      BEP20: wallets.USDT_BEP20,
      ERC20: wallets.USDT_ERC20,
    } as const;

    return {
      label: `USDT (${form.network})`,
      address: map[form.network],
      network: form.network,
    };
  }, [wallets, form.asset, form.network]);

  async function loadAll() {
    if (!token) {
      setErr("You are not logged in.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setErr(null);
    setMsg(null);

    try {
      const [walletRes, sumRes, listRes] = await Promise.all([
        apiFetch("/api/wallet/addresses", {}, token),
        apiFetch("/api/withdrawals/summary", {}, token),
        apiFetch("/api/withdrawals/my", {}, token),
      ]);

      const w = (walletRes.wallets || null) as WalletsDTO | null;
      setWallets(w);

      setSummary(sumRes as WithdrawSummaryDTO);

      setRows((listRes.withdrawals || []) as MyWithdrawalRow[]);
    } catch (e: any) {
      setErr(e.message || "Failed to load withdrawal data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit() {
  if (!token) {
    setErr("You are not logged in.");
    return;
  }

  setErr(null);
  setMsg(null);

  const amount = Number(form.amount);
  if (!amount || Number.isNaN(amount) || amount <= 0) {
    setErr("Enter a valid withdrawal amount.");
    return;
  }

  // ✅ NEW: block if no available balance
  const available = Number(summary?.available ?? 0);
  if (available <= 0) {
    setErr("You have no available balance to withdraw.");
    return;
  }

  // ✅ NEW: block if amount exceeds available
  if (amount > available) {
    setErr(`Insufficient available balance. Available: $${available.toLocaleString()}`);
    return;
  }

  // Must have destination wallet address saved
  if (!destination?.address) {
    setErr("No destination address saved for the selected asset/network. Update Wallet settings first.");
    return;
  }

  setSubmitting(true);
  try {
    const payload: any = { asset: form.asset, amount };
    if (form.asset === "USDT") payload.network = form.network;

    const res = await apiFetch("/api/withdrawals", { method: "POST", body: JSON.stringify(payload) }, token);

    setMsg(res.message || "Withdrawal request submitted.");
    setForm((p) => ({ ...p, amount: "" }));
    await loadAll();
  } catch (e: any) {
    // ✅ Make sure we show readable message
    setErr(e?.message || "Unable to submit withdrawal request.");
  } finally {
    setSubmitting(false);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-50">Withdraw</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
              Submit a withdrawal request. Your destination address is pulled from your saved Wallet addresses.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-gray-800 bg-black/70 px-3 py-2 text-[11px] text-gray-300">
            <ShieldCheck className="h-4 w-4 text-accentGold" />
            <span>Security tip: Always verify your saved address before withdrawing.</span>
          </div>
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

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5">
          <p className="text-[11px] text-gray-400">Balance</p>
          <p className="mt-1 text-lg font-semibold text-gray-50">
            ${summary?.balance?.toLocaleString() ?? "0"}
          </p>
          <p className="mt-1 text-[10px] text-gray-500">Total dashboard balance</p>
        </div>

        <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5">
          <p className="text-[11px] text-gray-400">Pending withdrawals</p>
          <p className="mt-1 text-lg font-semibold text-gray-50">
            ${summary?.pending?.toLocaleString() ?? "0"}
          </p>
          <p className="mt-1 text-[10px] text-gray-500">Requests awaiting admin review</p>
        </div>

        <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5">
          <p className="text-[11px] text-gray-400">Available to withdraw</p>
          <p className="mt-1 text-lg font-semibold text-gray-50">
            ${summary?.available?.toLocaleString() ?? "0"}
          </p>
          <p className="mt-1 text-[10px] text-gray-500">Balance minus pending requests</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        {/* Left: History */}
        <div className="space-y-4">
          <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-accentGold" />
                <h2 className="text-sm font-semibold text-gray-50">Withdrawal history</h2>
              </div>

              <button
                type="button"
                onClick={loadAll}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-xs text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>

            {rows.length === 0 ? (
              <div className="mt-4 rounded-xl border border-gray-800 bg-black/60 p-4 text-xs text-gray-400">
                No withdrawal requests yet.
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {rows.map((r) => (
                  <div key={r.id} className="rounded-xl border border-gray-800 bg-black/60 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <p className="text-xs text-gray-300">
                          <span className="text-gray-50 font-semibold">
                            ${r.amount.toLocaleString()}
                          </span>{" "}
                          • {r.asset}
                          {r.asset === "USDT" && r.network ? ` / ${r.network}` : ""}
                        </p>
                        <p className="mt-1 text-[11px] text-gray-500">
                          Destination: <span className="text-gray-300 break-all">{maskAddress(r.targetAddress)}</span>
                        </p>
                        <p className="mt-1 text-[10px] text-gray-500">
                          Created: {fmtDate(r.createdAt)}
                          {r.reviewedAt ? ` • Reviewed: ${fmtDate(r.reviewedAt)}` : ""}
                        </p>
                      </div>

                      <div
                        className={`inline-flex items-center justify-center rounded-lg border px-3 py-2 text-[11px] ${statusBadge(
                          r.status
                        )}`}
                      >
                        {r.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <ul className="mt-4 space-y-1 text-[11px] text-gray-400">
              <li>• Your request is reviewed manually for security and compliance.</li>
              <li>• You will receive an email once the admin approves or rejects your withdrawal.</li>
            </ul>
          </div>
        </div>

        {/* Right: Request form */}
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <ArrowDownToLine className="h-4 w-4 text-accentGold" />
            <h2 className="text-sm font-semibold text-gray-50">Request a withdrawal</h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Your withdrawal will be sent to the address saved in{" "}
            <Link href="/dashboard/wallet" className="text-accentGold hover:text-yellow-300 font-medium">
              Wallet
            </Link>
            .
          </p>

          <div className="mt-4 space-y-4">
            {/* Asset */}
            <div>
              <label className="text-[11px] text-gray-300/90">Asset</label>
              <select
                value={form.asset}
                onChange={(e) => setForm((p) => ({ ...p, asset: e.target.value as any }))}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">USDT</option>
              </select>
            </div>

            {/* USDT Network */}
            {form.asset === "USDT" && (
              <div>
                <label className="text-[11px] text-gray-300/90">USDT Network</label>
                <select
                  value={form.network}
                  onChange={(e) => setForm((p) => ({ ...p, network: e.target.value as any }))}
                  className="mt-1 w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
                >
                  <option value="TRC20">TRC20</option>
                  <option value="BEP20">BEP20 (BSC)</option>
                  <option value="ERC20">ERC20</option>
                </select>
                <p className="mt-1 text-[10px] text-gray-500">
                  USDT networks are separate — ensure the correct network address is saved.
                </p>
              </div>
            )}

            {/* Destination preview */}
            <div className="rounded-xl border border-gray-800 bg-black/60 p-4">
              <p className="text-[11px] text-gray-400">Destination (from saved Wallet)</p>
              <p className="mt-1 text-xs text-gray-100 break-all">
                {destination?.address ? destination.address : "—"}
              </p>
              <p className="mt-1 text-[10px] text-gray-500">
                Display: {destination?.address ? maskAddress(destination.address) : "—"}
              </p>

              {!destination?.address && (
                <div className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-100">
                  No saved address for this asset/network. Please update it in{" "}
                  <Link href="/dashboard/wallet" className="text-accentGold hover:text-yellow-300 font-medium">
                    Wallet
                  </Link>
                  .
                </div>
              )}
            </div>

            {/* Amount */}
            <div>
              <label className="text-[11px] text-gray-300/90">Amount (USD)</label>
              <input
                value={form.amount}
                onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
                inputMode="decimal"
                placeholder="Enter withdrawal amount"
                className="mt-1 w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
              />
              <p className="mt-1 text-[10px] text-gray-500">
                Available: <span className="text-gray-300">${summary?.available?.toLocaleString() ?? "0"}</span>
              </p>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={submit}
              disabled={submitting || !destination?.address}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accentGold px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400 transition disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit withdrawal request"}
            </button>

            <p className="text-[10px] text-gray-500">
              Admin will review your request. You will receive an email once it is approved or rejected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
