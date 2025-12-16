"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  AlertTriangle,
  Copy,
  Mail,
  Shield,
  User2,
  Wallet,
  KeyRound,
  LogOut,
  Link2,
  RefreshCw,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type MeResponse = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    username: string;
    role?: "USER" | "ADMIN";
    referralCode?: string;
    createdAt?: string;
    balanceCents?: number;
    emailVerifiedAt?: string | null;
  };
};

type WalletsDTO = {
  BTC: string | null;
  ETH: string | null;
  USDT_TRC20: string | null;
  USDT_BEP20: string | null;
  USDT_ERC20: string | null;
};

function formatCurrencyFromCents(cents: number): string {
  const n = cents / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(n);
}

function maskAddress(v: string, keep = 6) {
  const s = (v || "").trim();
  if (s.length <= keep * 2 + 3) return s;
  return `${s.slice(0, keep)}…${s.slice(-keep)}`;
}

export default function AccountPage() {
  const [loading, setLoading] = useState(true);
  const [loadingWallets, setLoadingWallets] = useState(true);

  const [me, setMe] = useState<MeResponse["user"] | null>(null);
  const [wallets, setWallets] = useState<WalletsDTO | null>(null);

  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const [resendLoading, setResendLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? window.localStorage.getItem("token") : null;

  const origin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  const referralLink = useMemo(() => {
    if (!me?.referralCode) return "";
    // This can be used later to auto-prefill referral code on the register page.
    return `${origin}/register?ref=${encodeURIComponent(me.referralCode)}`;
  }, [origin, me?.referralCode]);

  useEffect(() => {
    async function load() {
      if (!token) {
        setErr("You are not logged in.");
        setLoading(false);
        setLoadingWallets(false);
        return;
      }

      setErr(null);
      setMsg(null);

      try {
        const data = (await apiFetch("/api/auth/me", {}, token)) as MeResponse;
        setMe(data.user);
      } catch (e: any) {
        setErr(e?.message || "Unable to load account profile.");
      } finally {
        setLoading(false);
      }

      try {
        setLoadingWallets(true);
        // Your backend supports aliases. This one is the common path in your wallet.routes.ts.
        const w = await apiFetch("/api/wallet/addresses", {}, token);
        // expected: { wallets: {...} }
        setWallets((w?.wallets || null) as WalletsDTO | null);
      } catch {
        // keep wallets optional (page still works)
        setWallets(null);
      } finally {
        setLoadingWallets(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copy(text: string, label = "Copied") {
    try {
      setMsg(null);
      setErr(null);
      await navigator.clipboard.writeText(text);
      setMsg(label);
      setTimeout(() => setMsg(null), 2500);
    } catch {
      setErr("Unable to copy. Please copy manually.");
      setTimeout(() => setErr(null), 2500);
    }
  }

  async function resendVerification() {
    if (!token) return;
    setResendLoading(true);
    setMsg(null);
    setErr(null);
    try {
      await apiFetch("/api/auth/resend-verification", { method: "POST" }, token);
      setMsg("Verification email sent. Please check inbox/spam.");
    } catch (e: any) {
      setErr(e?.message || "Unable to send verification email.");
    } finally {
      setResendLoading(false);
    }
  }

  function signOut() {
    try {
      window.localStorage.removeItem("token");
      document.cookie = "apex_token=; Path=/; Max-Age=0; SameSite=Lax";
    } catch {}
    window.location.href = "/login";
  }

  const verified = !!me?.emailVerifiedAt;

  if (loading) {
    return (
      <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
        <div className="h-5 w-44 rounded bg-gray-800/80 animate-pulse mb-2" />
        <div className="h-4 w-72 rounded bg-gray-800/80 animate-pulse" />
      </div>
    );
  }

  if (err && !me) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-200 flex gap-2">
        <AlertTriangle className="h-4 w-4 mt-[2px] text-red-300" />
        <span>{err}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.18em] text-accentGold/90">
              ApexGlobalEarnings
            </p>
            <h1 className="mt-1 text-base sm:text-lg font-semibold text-gray-50">
              Account
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-2xl">
              View your profile details, referral info and wallet destinations.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={[
                "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px]",
                verified
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-200",
              ].join(" ")}
            >
              {verified ? (
                <BadgeCheck className="h-4 w-4 text-emerald-300" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-300" />
              )}
              {verified ? "Email verified" : "Email unverified"}
            </span>

            <span className="inline-flex items-center gap-2 rounded-xl border border-gray-800 bg-black/70 px-3 py-2 text-[11px] text-gray-300">
              <Shield className="h-4 w-4 text-accentGold" />
              <span>{me?.role || "USER"}</span>
            </span>

            <button
              type="button"
              onClick={signOut}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-800 bg-black/70 px-3 py-2 text-[11px] text-gray-200 hover:border-red-500/40 hover:text-red-200 transition"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>

        {(msg || err) && (
          <div className="mt-4 space-y-2">
            {msg && (
              <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm text-emerald-100">
                {msg}
              </div>
            )}
            {err && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-100 flex gap-2">
                <AlertTriangle className="h-4 w-4 mt-[2px] text-red-300" />
                <span>{err}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content grid */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Profile */}
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/70 p-5 sm:p-6 lg:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-50">Profile</h2>
              <p className="mt-1 text-xs text-gray-400">
                Your account identity and membership details.
              </p>
            </div>
            <a
              href="/dashboard/settings"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-black/60 px-3 py-2 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
              title="Edit profile in Settings"
            >
              <User2 className="h-4 w-4" />
              Edit
            </a>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <InfoRow icon={<User2 className="h-4 w-4" />} label="Username" value={me?.username || "—"} />
            <InfoRow icon={<Mail className="h-4 w-4" />} label="Email" value={me?.email || "—"} />
            <InfoRow
              icon={<Shield className="h-4 w-4" />}
              label="Account name"
              value={me?.name || "—"}
            />
            <InfoRow
              icon={<Wallet className="h-4 w-4" />}
              label="Balance"
              value={typeof me?.balanceCents === "number" ? formatCurrencyFromCents(me.balanceCents) : "—"}
            />
          </div>

          {!verified && (
            <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-2">
                  <AlertTriangle className="h-4 w-4 mt-[2px] text-amber-300 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm text-amber-100 font-medium">
                      Verify your email
                    </p>
                    <p className="text-[11px] text-amber-100/80 mt-1">
                      Verification improves account security and reduces withdrawal friction.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={resendVerification}
                  disabled={resendLoading}
                  className="inline-flex items-center gap-2 rounded-lg border border-amber-400/70 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100 hover:bg-amber-500/20 transition disabled:opacity-60"
                >
                  <RefreshCw className="h-4 w-4" />
                  {resendLoading ? "Sending..." : "Resend link"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Referral */}
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/70 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-50">Referral</h2>
              <p className="mt-1 text-xs text-gray-400">
                Share your code to earn commissions.
              </p>
            </div>
            <a
              href="/dashboard/referrals"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-black/60 px-3 py-2 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
            >
              <Link2 className="h-4 w-4" />
              Open
            </a>
          </div>

          <div className="mt-4 rounded-xl border border-gray-800 bg-black/60 p-4">
            <p className="text-[11px] text-gray-400">Referral code</p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-gray-50">
                {me?.referralCode || "—"}
              </p>
              {me?.referralCode ? (
                <button
                  type="button"
                  onClick={() => copy(me.referralCode!, "Referral code copied")}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-gray-800 bg-black/60 p-4">
            <p className="text-[11px] text-gray-400">Referral link</p>
            <div className="mt-1 flex items-start justify-between gap-2">
              <p className="text-[11px] text-gray-200 break-all leading-snug">
                {referralLink || "—"}
              </p>
              {referralLink ? (
                <button
                  type="button"
                  onClick={() => copy(referralLink, "Referral link copied")}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </button>
              ) : null}
            </div>
          </div>

          <p className="mt-3 text-[10px] text-gray-500">
            Tip: Share the link or code. Your referral dashboard tracks signups and commissions.
          </p>
        </div>
      </section>

      {/* Wallet destinations */}
      <section className="card-glow rounded-2xl border border-gray-800 bg-black/70 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-50">Wallet destinations</h2>
            <p className="mt-1 text-xs text-gray-400">
              These addresses are used for withdrawals. Manage them in Settings.
            </p>
          </div>
          <a
            href="/dashboard/settings"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-black/60 px-3 py-2 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
          >
            <Wallet className="h-4 w-4" />
            Manage
          </a>
        </div>

        {loadingWallets ? (
          <div className="mt-4 space-y-2">
            <div className="h-4 w-56 rounded bg-gray-800/80 animate-pulse" />
            <div className="h-4 w-72 rounded bg-gray-800/80 animate-pulse" />
          </div>
        ) : (
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <WalletCard
              label="BTC"
              value={wallets?.BTC || null}
              onCopy={(v) => copy(v, "BTC address copied")}
            />
            <WalletCard
              label="ETH"
              value={wallets?.ETH || null}
              onCopy={(v) => copy(v, "ETH address copied")}
            />
            <WalletCard
              label="USDT (TRC20)"
              value={wallets?.USDT_TRC20 || null}
              onCopy={(v) => copy(v, "USDT TRC20 address copied")}
            />
            <WalletCard
              label="USDT (BEP20)"
              value={wallets?.USDT_BEP20 || null}
              onCopy={(v) => copy(v, "USDT BEP20 address copied")}
            />
            <WalletCard
              label="USDT (ERC20)"
              value={wallets?.USDT_ERC20 || null}
              onCopy={(v) => copy(v, "USDT ERC20 address copied")}
            />
          </div>
        )}
      </section>

      {/* Security actions */}
      <section className="card-glow rounded-2xl border border-gray-800 bg-black/70 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-50">Security</h2>
            <p className="mt-1 text-xs text-gray-400">
              Recommended actions to keep your account protected.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <a
            href="/dashboard/settings"
            className="rounded-xl border border-gray-800 bg-black/60 p-4 hover:border-accentGold/60 transition"
          >
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-black/70 border border-gray-800 flex items-center justify-center text-gray-300">
                <KeyRound className="h-4 w-4 text-accentGold" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-50">Change password</p>
                <p className="mt-1 text-[11px] text-gray-400">
                  Update your password regularly for better protection.
                </p>
              </div>
            </div>
          </a>

          <button
            type="button"
            onClick={signOut}
            className="text-left rounded-xl border border-gray-800 bg-black/60 p-4 hover:border-red-500/40 transition"
          >
            <div className="flex items-start gap-3">
              <div className="h-9 w-9 rounded-lg bg-black/70 border border-gray-800 flex items-center justify-center text-gray-300">
                <LogOut className="h-4 w-4 text-red-300" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-50">Sign out</p>
                <p className="mt-1 text-[11px] text-gray-400">
                  Ends your session on this device.
                </p>
              </div>
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-black/60 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] text-gray-400">{label}</p>
        <div className="h-7 w-7 rounded-lg bg-black/70 border border-gray-800 flex items-center justify-center text-gray-300">
          {icon}
        </div>
      </div>
      <p className="mt-1 text-sm font-semibold text-gray-50 break-all">{value}</p>
    </div>
  );
}

function WalletCard({
  label,
  value,
  onCopy,
}: {
  label: string;
  value: string | null;
  onCopy: (v: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-black/60 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] text-gray-400">{label}</p>
          <p className="mt-1 text-[12px] text-gray-100 break-all">
            {value ? maskAddress(value, 7) : <span className="text-gray-500">Not set</span>}
          </p>
        </div>

        {value ? (
          <button
            type="button"
            onClick={() => onCopy(value)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
          >
            <Copy className="h-4 w-4" />
            Copy
          </button>
        ) : null}
      </div>
    </div>
  );
}
