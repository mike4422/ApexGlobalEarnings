"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  KeyRound,
  Loader2,
  Mail,
  Save,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";

type MeUser = {
  id: string;
  email: string;
  name?: string | null;
  username: string;
  referralCode: string;
  emailVerifiedAt?: string | null;
  createdAt?: string;
  balanceCents?: number;
};

type MeResponse = { user: MeUser };

type WalletsDTO = {
  BTC: string | null;
  ETH: string | null;
  USDT_TRC20: string | null;
  USDT_BEP20: string | null;
  USDT_ERC20: string | null;
};

export default function SettingsPage() {
  const [token, setToken] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [pageErr, setPageErr] = useState<string | null>(null);

  const [okMsg, setOkMsg] = useState<string | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const [me, setMe] = useState<MeUser | null>(null);

  // Profile form
  const [profileSaving, setProfileSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    username: "",
  });

  // Password form
  const [pwSaving, setPwSaving] = useState(false);
  const [pw, setPw] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });

  // Wallet addresses
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletSaving, setWalletSaving] = useState(false);
  const [wallets, setWallets] = useState<WalletsDTO>({
    BTC: null,
    ETH: null,
    USDT_TRC20: null,
    USDT_BEP20: null,
    USDT_ERC20: null,
  });

  const referralLink = useMemo(() => {
    if (!me?.referralCode) return "";
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/register?ref=${encodeURIComponent(me.referralCode)}`;
  }, [me?.referralCode]);

  useEffect(() => {
    const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    setToken(t);
  }, []);

  useEffect(() => {
    async function load() {
      const t = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!t) {
        setPageErr("You are not logged in.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setPageErr(null);
      setErrMsg(null);
      setOkMsg(null);

      try {
        const [meRes, wRes] = await Promise.all([
          apiFetch("/api/auth/me", {}, t) as Promise<MeResponse>,
          apiFetch("/api/wallet/addresses", {}, t) as Promise<{ wallets: WalletsDTO }>,
        ]);

        setMe(meRes.user);
        setProfile({
          name: meRes.user?.name || "",
          username: meRes.user?.username || "",
        });

        setWallets(wRes.wallets || wallets);
      } catch (e: any) {
        setPageErr(e?.message || "Failed to load settings.");
      } finally {
        setLoading(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function toastOk(msg: string) {
    setOkMsg(msg);
    setErrMsg(null);
  }
  function toastErr(msg: string) {
    setErrMsg(msg);
    setOkMsg(null);
  }

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      toastOk("Copied to clipboard.");
    } catch {
      toastErr("Unable to copy. Please copy manually.");
    }
  }

  async function resendVerification() {
    if (!token) return;
    try {
      setErrMsg(null);
      setOkMsg(null);
      await apiFetch("/api/auth/resend-verification", { method: "POST" }, token);
      toastOk("Verification email sent. Please check your inbox (and spam/junk).");
    } catch (e: any) {
      toastErr(e?.message || "Unable to send verification email.");
    }
  }

  async function saveProfile() {
    if (!token) return;

    setProfileSaving(true);
    setOkMsg(null);
    setErrMsg(null);

    try {
      const payload = {
        name: profile.name,
        username: profile.username,
      };

      const data = await apiFetch(
        "/api/auth/profile",
        { method: "PUT", body: JSON.stringify(payload) },
        token
      );

      setMe(data.user as MeUser);
      toastOk("Profile updated successfully.");
      // ✅ keep dashboard in sync
if (typeof window !== "undefined") {
  window.localStorage.setItem("apex_me_cache", JSON.stringify(data.user));
}

    } catch (e: any) {
      toastErr(e?.message || "Unable to update profile.");
    } finally {
      setProfileSaving(false);
    }
  }

  async function changePassword() {
    if (!token) return;

    if (!pw.currentPassword || !pw.newPassword) {
      toastErr("Please fill in your current password and a new password.");
      return;
    }
    if (pw.newPassword.length < 8) {
      toastErr("New password must be at least 8 characters.");
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      toastErr("New passwords do not match.");
      return;
    }

    setPwSaving(true);
    setOkMsg(null);
    setErrMsg(null);

    try {
      await apiFetch(
        "/api/auth/change-password",
        {
          method: "POST",
          body: JSON.stringify({
            currentPassword: pw.currentPassword,
            newPassword: pw.newPassword,
          }),
        },
        token
      );

      setPw({ currentPassword: "", newPassword: "", confirm: "" });
      toastOk("Password updated successfully.");
    } catch (e: any) {
      toastErr(e?.message || "Unable to change password.");
    } finally {
      setPwSaving(false);
    }
  }

  async function refreshWallets() {
    if (!token) return;

    setWalletLoading(true);
    setOkMsg(null);
    setErrMsg(null);

    try {
      const data = await apiFetch("/api/wallet/addresses", {}, token);
      setWallets((data.wallets || {}) as WalletsDTO);
      toastOk("Wallet addresses refreshed.");
    } catch (e: any) {
      toastErr(e?.message || "Unable to load wallet addresses.");
    } finally {
      setWalletLoading(false);
    }
  }

  async function saveWallets() {
    if (!token) return;

    setWalletSaving(true);
    setOkMsg(null);
    setErrMsg(null);

    try {
      const payload = {
        btcAddress: wallets.BTC ?? "",
        ethAddress: wallets.ETH ?? "",
        usdtTrc20Address: wallets.USDT_TRC20 ?? "",
        usdtBep20Address: wallets.USDT_BEP20 ?? "",
        usdtErc20Address: wallets.USDT_ERC20 ?? "",
      };

      const data = await apiFetch(
        "/api/wallet/addresses",
        { method: "PUT", body: JSON.stringify(payload) },
        token
      );

      setWallets((data.wallets || wallets) as WalletsDTO);
      toastOk("Wallet addresses updated.");
    } catch (e: any) {
      toastErr(e?.message || "Unable to update wallet addresses.");
    } finally {
      setWalletSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="card-glow rounded-2xl border border-gray-800 bg-black/70 p-5 sm:p-6">
        <div className="h-5 w-40 rounded bg-gray-800/80 animate-pulse mb-2" />
        <div className="h-4 w-72 rounded bg-gray-800/80 animate-pulse" />
      </div>
    );
  }

  if (pageErr) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-200 flex gap-2">
        <AlertTriangle className="h-4 w-4 mt-[2px] text-red-300" />
        <div>
          <p className="font-medium">{pageErr}</p>
          <p className="text-xs text-red-200/80 mt-1">
            Please sign in again via{" "}
            <a className="text-accentGold hover:text-yellow-300" href="/login">
              /login
            </a>
            .
          </p>
        </div>
      </div>
    );
  }

  const verified = !!me?.emailVerifiedAt;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card-glow rounded-2xl border border-gray-800 bg-black/70 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-accentGold/90">
              ApexGlobalEarnings
            </p>
            <h1 className="text-base sm:text-lg font-semibold text-gray-50">
              Settings
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-2xl">
              Manage your profile, security and withdrawal wallet addresses.
            </p>
          </div>

          <div
            className={[
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-[11px]",
              verified
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                : "border-amber-500/50 bg-amber-500/10 text-amber-200",
            ].join(" ")}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{verified ? "Email verified" : "Email not verified"}</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {okMsg && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm text-emerald-100 flex gap-2">
          <CheckCircle2 className="h-4 w-4 mt-[2px] text-emerald-300" />
          <span>{okMsg}</span>
        </div>
      )}
      {errMsg && (
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-100 flex gap-2">
          <AlertTriangle className="h-4 w-4 mt-[2px] text-red-300" />
          <span>{errMsg}</span>
        </div>
      )}

      {/* Top grid */}
      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        {/* Profile */}
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/70 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-50">Profile</h2>
              <p className="text-xs text-gray-400 mt-1">
                Update your display name and username.
              </p>
            </div>
            <div className="h-9 w-9 rounded-xl border border-gray-800 bg-black/70 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-300" />
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <label className="text-[11px] text-gray-300/90">Full name</label>
              <input
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Daniel Okafor"
                className="mt-1 w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
              />
            </div>

            <div className="sm:col-span-1">
              <label className="text-[11px] text-gray-300/90">Username</label>
              <input
                value={profile.username}
                onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                placeholder="Your username"
                className="mt-1 w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-[11px] text-gray-300/90">Email address</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-800 bg-black/70 px-3 py-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-200">{me?.email || "—"}</span>
              </div>

              {!verified && (
                <div className="mt-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100 flex items-start justify-between gap-3">
                  <div className="flex gap-2">
                    <AlertTriangle className="h-4 w-4 mt-[2px] text-amber-300" />
                    <div>
                      <p className="font-medium">Verify your email</p>
                      <p className="mt-1 text-[11px] text-amber-100/85">
                        Verification unlocks full account security. Check your inbox and spam/junk folder.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={resendVerification}
                    className="shrink-0 rounded-lg border border-amber-400/60 bg-amber-500/10 px-3 py-1.5 text-[11px] font-medium hover:bg-amber-500/20 transition"
                  >
                    Resend link
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={saveProfile}
            disabled={profileSaving}
            className="mt-5 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-accentGold px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400 transition disabled:opacity-60"
          >
            {profileSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {profileSaving ? "Saving..." : "Save profile"}
          </button>
        </div>

        {/* Referral */}
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/70 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-50">Referral</h2>
              <p className="text-xs text-gray-400 mt-1">
                Your referral code and link (share to invite partners).
              </p>
            </div>
            <div className="h-9 w-9 rounded-xl border border-gray-800 bg-black/70 flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 text-accentGold" />
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-[11px] text-gray-300/90">Referral code</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-800 bg-black/70 px-3 py-2">
                <span className="text-sm text-gray-100 font-semibold">
                  {me?.referralCode || "—"}
                </span>
                <button
                  type="button"
                  onClick={() => me?.referralCode && copy(me.referralCode)}
                  className="ml-auto inline-flex items-center gap-1 rounded-lg border border-gray-800 bg-black/60 px-2 py-1 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
              </div>
            </div>

            <div>
              <label className="text-[11px] text-gray-300/90">Referral link</label>
              <div className="mt-1 flex items-center gap-2 rounded-lg border border-gray-800 bg-black/70 px-3 py-2">
                <span className="text-[11px] text-gray-300 break-all">
                  {referralLink || "—"}
                </span>
                <button
                  type="button"
                  onClick={() => referralLink && copy(referralLink)}
                  className="ml-auto inline-flex items-center gap-1 rounded-lg border border-gray-800 bg-black/60 px-2 py-1 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
              </div>
              <p className="mt-2 text-[10px] text-gray-500">
                Partners can register with your code to be linked to your referral network.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Wallet addresses */}
      <section className="card-glow rounded-2xl border border-gray-800 bg-black/70 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-50">Withdrawal wallet addresses</h2>
            <p className="text-xs text-gray-400 mt-1">
              These are used as your default destinations on the Withdraw page. Leave empty to clear.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshWallets}
            disabled={walletLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-800 bg-black/60 px-3 py-2 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition disabled:opacity-60"
          >
            {walletLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
            {walletLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <WalletField
            label="BTC address"
            value={wallets.BTC || ""}
            onChange={(v) => setWallets((p) => ({ ...p, BTC: v || null }))}
            placeholder="Paste BTC address"
          />
          <WalletField
            label="ETH address"
            value={wallets.ETH || ""}
            onChange={(v) => setWallets((p) => ({ ...p, ETH: v || null }))}
            placeholder="Paste ETH address"
          />
          <WalletField
            label="USDT (TRC20)"
            value={wallets.USDT_TRC20 || ""}
            onChange={(v) => setWallets((p) => ({ ...p, USDT_TRC20: v || null }))}
            placeholder="Paste TRC20 address"
          />
          <WalletField
            label="USDT (BEP20 / BSC)"
            value={wallets.USDT_BEP20 || ""}
            onChange={(v) => setWallets((p) => ({ ...p, USDT_BEP20: v || null }))}
            placeholder="Paste BEP20 address"
          />
          <WalletField
            label="USDT (ERC20)"
            value={wallets.USDT_ERC20 || ""}
            onChange={(v) => setWallets((p) => ({ ...p, USDT_ERC20: v || null }))}
            placeholder="Paste ERC20 address"
          />
        </div>

        <button
          type="button"
          onClick={saveWallets}
          disabled={walletSaving}
          className="mt-5 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-accentGold px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400 transition disabled:opacity-60"
        >
          {walletSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {walletSaving ? "Saving..." : "Save wallet addresses"}
        </button>
      </section>

      {/* Security */}
      <section className="card-glow rounded-2xl border border-gray-800 bg-black/70 p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-50">Security</h2>
            <p className="text-xs text-gray-400 mt-1">
              Change your password to keep your account secure.
            </p>
          </div>
          <div className="h-9 w-9 rounded-xl border border-gray-800 bg-black/70 flex items-center justify-center">
            <KeyRound className="h-4 w-4 text-gray-300" />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <PasswordField
            label="Current password"
            value={pw.currentPassword}
            onChange={(v) => setPw((p) => ({ ...p, currentPassword: v }))}
          />
          <PasswordField
            label="New password"
            value={pw.newPassword}
            onChange={(v) => setPw((p) => ({ ...p, newPassword: v }))}
          />
          <PasswordField
            label="Confirm new password"
            value={pw.confirm}
            onChange={(v) => setPw((p) => ({ ...p, confirm: v }))}
          />
        </div>

        <button
          type="button"
          onClick={changePassword}
          disabled={pwSaving}
          className="mt-5 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-gray-800 bg-black/60 px-4 py-2.5 text-sm font-semibold text-gray-100 hover:border-accentGold/60 hover:text-accentGold transition disabled:opacity-60"
        >
          {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
          {pwSaving ? "Updating..." : "Update password"}
        </button>
      </section>
    </div>
  );
}

function WalletField(props: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[11px] text-gray-300/90">{props.label}</label>
      <input
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        placeholder={props.placeholder}
        className="mt-1 w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
      />
    </div>
  );
}

function PasswordField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-[11px] text-gray-300/90">{props.label}</label>
      <input
        type="password"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
        autoComplete="off"
      />
    </div>
  );
}
