"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  Wallet,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Save,
  ShieldCheck,
} from "lucide-react";

type WalletsDTO = {
  BTC: string | null;
  ETH: string | null;
  USDT_TRC20: string | null;
  USDT_BEP20: string | null;
  USDT_ERC20: string | null;
};

function maskAddress(a: string) {
  if (!a) return "";
  if (a.length <= 12) return a;
  return `${a.slice(0, 6)}…${a.slice(-6)}`;
}

export default function WalletPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [wallets, setWallets] = useState<WalletsDTO | null>(null);
  const [form, setForm] = useState({
    btc: "",
    eth: "",
    usdt_trc20: "",
    usdt_bep20: "",
    usdt_erc20: "",
  });

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const completeness = useMemo(() => {
    const values = Object.values(form);
    const filled = values.filter((v) => v.trim().length > 0).length;
    return { filled, total: values.length };
  }, [form]);

  async function load() {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setErr("You are not logged in.");
      setLoading(false);
      return;
    }

    try {
      setErr(null);
      const data = await apiFetch("/api/wallet/addresses", {}, token);

      // ✅ FIX: support both shapes:
      // 1) { wallets: { BTC, ETH, USDT_TRC20, ... } }
      // 2) { addresses: [ { asset, network, address }, ... ] }
      let w: WalletsDTO | null = (data.wallets || null) as WalletsDTO | null;

      if (!w && Array.isArray(data.addresses)) {
        const list = data.addresses as Array<{
          asset: string;
          network?: string | null;
          address: string;
        }>;

        const pick = (asset: string, network: string | null) =>
          list.find(
            (r) =>
              r.asset === asset && (r.network ?? null) === (network ?? null)
          )?.address ?? null;

        w = {
          BTC: pick("BTC", null),
          ETH: pick("ETH", null),
          USDT_TRC20: pick("USDT", "TRC20"),
          USDT_BEP20: pick("USDT", "BEP20"),
          USDT_ERC20: pick("USDT", "ERC20"),
        };
      }

      setWallets(w);

      setForm({
        btc: w?.BTC || "",
        eth: w?.ETH || "",
        usdt_trc20: w?.USDT_TRC20 || "",
        usdt_bep20: w?.USDT_BEP20 || "",
        usdt_erc20: w?.USDT_ERC20 || "",
      });
    } catch (e: any) {
      setErr(e.message || "Failed to load wallet addresses.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function copy(text: string) {
    setMsg(null);
    setErr(null);

    if (!text) {
      setErr("Wallet address is empty.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setMsg("Copied to clipboard.");
      setTimeout(() => setMsg(null), 1500);
    } catch {
      setErr("Unable to copy. Please copy manually.");
    }
  }

  async function save() {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      setErr("You are not logged in.");
      return;
    }

    setSaving(true);
    setMsg(null);
    setErr(null);

    try {
      const payload = {
        btc: form.btc,
        eth: form.eth,
        usdt_trc20: form.usdt_trc20,
        usdt_bep20: form.usdt_bep20,
        usdt_erc20: form.usdt_erc20,
      };

      const data = await apiFetch(
        "/api/wallet/addresses",
        { method: "PUT", body: JSON.stringify(payload) },
        token
      );

      // ✅ FIX: support both response shapes on save too
      if (data.wallets) {
        setWallets(data.wallets as WalletsDTO);
      } else if (Array.isArray(data.addresses)) {
        const list = data.addresses as Array<{
          asset: string;
          network?: string | null;
          address: string;
        }>;

        const pick = (asset: string, network: string | null) =>
          list.find(
            (r) =>
              r.asset === asset && (r.network ?? null) === (network ?? null)
          )?.address ?? null;

        setWallets({
          BTC: pick("BTC", null),
          ETH: pick("ETH", null),
          USDT_TRC20: pick("USDT", "TRC20"),
          USDT_BEP20: pick("USDT", "BEP20"),
          USDT_ERC20: pick("USDT", "ERC20"),
        });
      }

      setMsg(data.message || "Wallet addresses updated.");
    } catch (e: any) {
      setErr(e.message || "Failed to update wallet addresses.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
        <div className="h-5 w-40 rounded bg-gray-800/80 animate-pulse mb-2" />
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
            <h1 className="text-base sm:text-lg font-semibold text-gray-50">
              Wallet
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-1 max-w-2xl">
              Manage your withdrawal wallet addresses. These will be used when
              you request withdrawals from your dashboard.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-gray-800 bg-black/70 px-3 py-2 text-[11px] text-gray-300">
            <ShieldCheck className="h-4 w-4 text-accentGold" />
            <span>
              Security tip: Double-check addresses before saving.
            </span>
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        {/* Left: Live cards */}
        <div className="space-y-4">
          <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-accentGold" />
                <h2 className="text-sm font-semibold text-gray-50">
                  Current addresses
                </h2>
              </div>

              <div className="text-[11px] text-gray-400">
                Saved:{" "}
                <span className="text-gray-200 font-medium">
                  {wallets ? "Yes" : "No"}
                </span>{" "}
                • Filled{" "}
                <span className="text-gray-200 font-medium">
                  {completeness.filled}/{completeness.total}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { k: "BTC", label: "Bitcoin (BTC)", v: wallets?.BTC || "" },
                { k: "ETH", label: "Ethereum (ETH)", v: wallets?.ETH || "" },
                {
                  k: "USDT_TRC20",
                  label: "USDT (TRC20)",
                  v: wallets?.USDT_TRC20 || "",
                },
                {
                  k: "USDT_BEP20",
                  label: "USDT (BSC / BEP20)",
                  v: wallets?.USDT_BEP20 || "",
                },
                {
                  k: "USDT_ERC20",
                  label: "USDT (ERC20)",
                  v: wallets?.USDT_ERC20 || "",
                },
              ].map((x) => (
                <div
                  key={x.k}
                  className="rounded-xl border border-gray-800 bg-black/60 p-4"
                >
                  <p className="text-[11px] text-gray-400">{x.label}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <p className="flex-1 text-[12px] text-gray-100 break-all">
                      {x.v ? x.v : "—"}
                    </p>
                    <button
                      type="button"
                      onClick={() => copy(x.v)}
                      className="inline-flex items-center justify-center rounded-lg border border-gray-800 bg-black/70 px-2.5 py-2 text-xs text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
                      title={x.v ? "Copy address" : "No address to copy"}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  {x.v && (
                    <p className="mt-2 text-[10px] text-gray-500">
                      Display: {maskAddress(x.v)}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <ul className="mt-4 space-y-1 text-[11px] text-gray-400">
              <li>• Use a personal wallet you control (not an exchange memo-only address unless required).</li>
              <li>• USDT networks are separate — saving TRC20 does not apply to ERC20/BEP20.</li>
              <li>• If you save the wrong address, withdrawals may fail or be irreversible.</li>
            </ul>
          </div>
        </div>

        {/* Right: Edit form */}
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-50">
            Update withdrawal addresses
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Paste the correct addresses and save. Leave empty to clear an address.
          </p>

          <div className="mt-4 space-y-4">
            {[
              { key: "btc", label: "BTC address", ph: "Paste BTC address" },
              { key: "eth", label: "ETH address", ph: "Paste ETH address" },
              {
                key: "usdt_trc20",
                label: "USDT (TRC20)",
                ph: "Paste USDT TRC20 address",
              },
              {
                key: "usdt_bep20",
                label: "USDT (BSC / BEP20)",
                ph: "Paste USDT BEP20 address",
              },
              {
                key: "usdt_erc20",
                label: "USDT (ERC20)",
                ph: "Paste USDT ERC20 address",
              },
            ].map((f) => (
              <div key={f.key}>
                <label className="text-[11px] text-gray-300/90">{f.label}</label>
                <input
                  value={(form as any)[f.key]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  placeholder={f.ph}
                  className="mt-1 w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
                />
              </div>
            ))}

            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accentGold px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400 transition disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save wallet addresses"}
            </button>

            <button
              type="button"
              onClick={() => load()}
              className="w-full rounded-lg border border-gray-800 bg-black/70 px-4 py-2.5 text-sm text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
            >
              Refresh
            </button>

            <p className="text-[10px] text-gray-500">
              These addresses are used for withdrawals. Deposit addresses are managed by admin settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
