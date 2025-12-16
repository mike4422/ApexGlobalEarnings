"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { ArrowDownToLine, Copy, CheckCircle2, AlertTriangle } from "lucide-react";

type DepositRow = {
  id: string;
  asset: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  reference?: string | null;
  meta?: any;
  createdAt: string;
};

type DepositAddresses = {
  BTC: string | null;
  ETH: string | null;
  USDT_TRC20: string | null;
  USDT_BEP20: string | null;
  USDT_ERC20: string | null;
};


function formatMoney(n: number) {
  return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function DepositPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [asset, setAsset] = useState<"USDT" | "BTC" | "ETH">("USDT");
  const [amount, setAmount] = useState<string>("");
  const [reference, setReference] = useState<string>("");
  const [note, setNote] = useState<string>("");

  const [rows, setRows] = useState<DepositRow[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ NEW: deposit addresses from DB
  const [depositAddresses, setDepositAddresses] = useState<DepositAddresses | null>(null);
  const [usdtNetwork, setUsdtNetwork] = useState<"TRC20" | "BEP20" | "ERC20">("TRC20");

  // ✅ NEW: Load platform deposit addresses from backend (DB)
  async function loadDepositAddresses() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) return;
    try {
      const data = await apiFetch("/api/wallet/deposit-addresses", {}, token);
     setDepositAddresses((data.addresses || null) as DepositAddresses | null);

    } catch (e: any) {
      // do not break the page if addresses fail
      console.error(e);
    }
  }

  // ✅ UPDATED: deposit address comes from DB, including USDT networks
  const depositAddress = useMemo(() => {
  if (!depositAddresses) return "";

  if (asset === "BTC") return depositAddresses.BTC || "";
  if (asset === "ETH") return depositAddresses.ETH || "";

  // USDT networks
  if (usdtNetwork === "TRC20") return depositAddresses.USDT_TRC20 || "";
  if (usdtNetwork === "BEP20") return depositAddresses.USDT_BEP20 || "";
  if (usdtNetwork === "ERC20") return depositAddresses.USDT_ERC20 || "";

  return "";
}, [asset, usdtNetwork, depositAddresses]);


  async function loadMyDeposits() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await apiFetch("/api/wallet/deposits/my", {}, token);
      setRows((data.deposits || []) as DepositRow[]);
    } catch (e: any) {
      setError(e.message || "Failed to load deposit history.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMyDeposits();
    loadDepositAddresses(); // ✅ NEW
  }, []);

  async function handleSubmit() {
    setMessage(null);
    setError(null);

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      setError("You are not logged in.");
      return;
    }

    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError("Please enter a valid deposit amount.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        asset,
        amount: amt,
        reference: reference.trim() || undefined,
        note: note.trim() || undefined,
      };

      const data = await apiFetch(
        "/api/wallet/deposits",
        { method: "POST", body: JSON.stringify(payload) },
        token
      );

      setMessage(data.message || "Deposit request submitted.");
      setAmount("");
      setReference("");
      setNote("");
      await loadMyDeposits();
    } catch (e: any) {
      setError(e.message || "Deposit request failed.");
    } finally {
      setSubmitting(false);
    }
  }

  async function copy(text: string) {
    if (!text) {
      setError("Deposit address is unavailable. Please contact support.");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      setMessage("Copied to clipboard.");
      setTimeout(() => setMessage(null), 1500);
    } catch {
      setError("Unable to copy. Please copy manually.");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-semibold text-gray-50">Deposit</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
              Submit a deposit request for review. Once approved by an administrator, your dashboard balance will update automatically.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-gray-800 bg-black/70 px-3 py-2 text-[11px] text-gray-300">
            <ArrowDownToLine className="h-4 w-4 text-accentGold" />
            <span>Deposits is automaatically added to your dashboard once received</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm text-emerald-100 flex gap-2">
          <CheckCircle2 className="h-4 w-4 mt-[2px] text-emerald-300" />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-100 flex gap-2">
          <AlertTriangle className="h-4 w-4 mt-[2px] text-red-300" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        {/* Left: Instructions / address */}
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-50">Funding instructions</h2>
          <p className="text-xs text-gray-400 mt-1">
            Select an asset, send funds to the address, then submit the request with the transaction reference (recommended).
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {(["USDT", "BTC", "ETH"] as const).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAsset(a)}
                className={
                  "rounded-xl border px-3 py-2 text-left transition " +
                  (asset === a
                    ? "border-accentGold/70 bg-accentGold/10"
                    : "border-gray-800 bg-black/50 hover:border-accentGold/40")
                }
              >
                <div className="text-[12px] font-semibold text-gray-100">{a}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">
                  {a === "USDT" ? "Stablecoin deposit" : a === "BTC" ? "Bitcoin deposit" : "Ethereum deposit"}
                </div>
              </button>
            ))}
          </div>

          <div className="mt-4 rounded-xl border border-gray-800 bg-black/60 p-4">
            <p className="text-[11px] text-gray-400">
              Deposit address ({asset}{asset === "USDT" ? ` • ${usdtNetwork}` : ""})
            </p>

            {/* ✅ NEW: USDT network selector */}
            {asset === "USDT" && (
              <div className="mt-2 flex flex-wrap gap-2">
                {(["TRC20", "BEP20", "ERC20"] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setUsdtNetwork(n)}
                    className={
                      "rounded-lg border px-3 py-1.5 text-[11px] font-medium transition " +
                      (usdtNetwork === n
                        ? "border-accentGold/70 bg-accentGold/10 text-accentGold"
                        : "border-gray-800 bg-black/70 text-gray-300 hover:border-accentGold/40 hover:text-accentGold")
                    }
                  >
                    {n === "BEP20" ? "BSC (BEP20)" : n}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-gray-800 bg-black/70 px-3 py-2">
                <p className="text-[12px] text-gray-100 break-all">
                  {depositAddress || "Address unavailable — contact support."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => copy(depositAddress)}
                className="inline-flex items-center justify-center rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-xs text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <ul className="mt-3 space-y-1 text-[11px] text-gray-400">
              <li>• Ensure you send using the correct network for the selected asset.</li>
              <li>• Enter the transaction hash/reference in the form to speed up review.</li>
              <li>• Admin approval updates your balance automatically.</li>
            </ul>
          </div>
        </div>

        {/* Right: Request form */}
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-50">Submit deposit request</h2>
          <p className="text-xs text-gray-400 mt-1">
            Provide the amount and transaction reference (if available). Your request will appear in “Deposit history”.
          </p>

          <div className="mt-4 space-y-4">
            <div>
              <label className="text-[11px] text-gray-300/90">Asset</label>
              <select
                value={asset}
                onChange={(e) => setAsset(e.target.value as any)}
                className="mt-1 w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
              >
                <option value="USDT">USDT</option>
                <option value="BTC">BTC</option>
                <option value="ETH">ETH</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-gray-300/90">Amount (USD)</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                inputMode="decimal"
                placeholder="e.g. 500"
                className="mt-1 w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-300/90">Transaction reference / hash (recommended)</label>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Paste tx hash or reference"
                className="mt-1 w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
              />
            </div>

            <div>
              <label className="text-[11px] text-gray-300/90">Note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Any extra context for the finance team..."
                className="mt-1 w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex w-full items-center justify-center rounded-lg bg-accentGold px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400 transition disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Submit deposit request"}
            </button>

            <p className="text-[10px] text-gray-500">
              You will receive an email once your request is approved or rejected. Rejection emails include the admin’s reason.
            </p>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-gray-50">Deposit history</h2>
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              loadMyDeposits();
            }}
            className="rounded-lg border border-gray-800 bg-black/70 px-3 py-1.5 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="mt-4 space-y-2">
            <div className="h-4 w-56 rounded bg-gray-800/80 animate-pulse" />
            <div className="h-4 w-72 rounded bg-gray-800/80 animate-pulse" />
          </div>
        ) : rows.length === 0 ? (
          <p className="mt-3 text-xs text-gray-400">No deposits yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="text-gray-400">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Asset</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Reference</th>
                </tr>
              </thead>
              <tbody className="text-gray-200">
                {rows.map((r) => (
                  <tr key={r.id} className="border-t border-gray-800/80">
                    <td className="py-2 pr-4 text-gray-300">
                      {new Date(r.createdAt).toLocaleString()}
                    </td>
                    <td className="py-2 pr-4">{r.asset}</td>
                    <td className="py-2 pr-4">${formatMoney(r.amount)}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={
                          "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium " +
                          (r.status === "COMPLETED"
                            ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-200"
                            : r.status === "PENDING"
                            ? "border-amber-500/50 bg-amber-500/10 text-amber-200"
                            : "border-red-500/50 bg-red-500/10 text-red-200")
                        }
                      >
                        {r.status}
                      </span>

                      {/* show rejection reason if present */}
                      {r.status === "FAILED" && r.meta?.rejectReason && (
                        <div className="mt-1 text-[10px] text-gray-400">
                          Reason: {String(r.meta.rejectReason)}
                        </div>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-gray-400">
                      {r.reference ? (
                        <span className="break-all">{r.reference}</span>
                      ) : (
                        "—"
                      )}
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
