"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  KeyRound,
  RefreshCw,
  Shield,
  LogOut,
  Lock,
  Eye,
  EyeOff,
  Laptop,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type MeResponse = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    username: string;
    role?: "USER" | "ADMIN";
    emailVerifiedAt?: string | null;
  };
};

type SessionRow = {
  id: string;
  jwtId: string;
  createdAt: string;
  expiresAt: string;
};

function maskJwt(v: string) {
  if (!v) return "—";
  if (v.length <= 10) return v;
  return `${v.slice(0, 6)}…${v.slice(-4)}`;
}

export default function SecurityPage() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const [loading, setLoading] = useState(true);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [me, setMe] = useState<MeResponse["user"] | null>(null);
  const [sessions, setSessions] = useState<SessionRow[]>([]);

  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Change password
  const [saving, setSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [logoutAll, setLogoutAll] = useState(true);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const verified = useMemo(() => !!me?.emailVerifiedAt, [me?.emailVerifiedAt]);

  useEffect(() => {
    async function load() {
      if (!token) {
        setErr("You are not logged in.");
        setLoading(false);
        setLoadingSessions(false);
        return;
      }

      setErr(null);
      setMsg(null);

      try {
        const data = (await apiFetch("/api/auth/me", {}, token)) as MeResponse;
        setMe(data.user);
      } catch (e: any) {
        setErr(e?.message || "Unable to load security profile.");
      } finally {
        setLoading(false);
      }

      await refreshSessions();
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refreshSessions() {
    if (!token) return;
    setLoadingSessions(true);
    try {
      const data = await apiFetch("/api/security/sessions", {}, token);
      setSessions((data.sessions || []) as SessionRow[]);
    } catch (e: any) {
      // Non-blocking
      setSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  }

  async function resendVerification() {
    if (!token) return;
    setMsg(null);
    setErr(null);
    setSaving(true);
    try {
      await apiFetch("/api/auth/resend-verification", { method: "POST" }, token);
      setMsg("Verification email sent. Please check inbox/spam.");
    } catch (e: any) {
      setErr(e?.message || "Unable to send verification email.");
    } finally {
      setSaving(false);
    }
  }

  async function submitChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;

    setMsg(null);
    setErr(null);

    if (newPassword.length < 8) {
      setErr("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirm) {
      setErr("New password and confirm password do not match.");
      return;
    }

    setSaving(true);
    try {
      const res = await apiFetch(
        "/api/security/change-password",
        {
          method: "POST",
          body: JSON.stringify({
            currentPassword,
            newPassword,
            logoutAll,
          }),
        },
        token
      );

      setMsg(res?.message || "Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");

      // If you logged out all sessions, your current token will likely become invalid.
      // We redirect to login to avoid confusing “Unauthorized” screens.
      if (logoutAll) {
        try {
          localStorage.removeItem("token");
          document.cookie = "apex_token=; Path=/; Max-Age=0; SameSite=Lax";
        } catch {}
        window.location.href = "/login";
        return;
      }

      await refreshSessions();
    } catch (e: any) {
      setErr(e?.message || "Failed to change password.");
    } finally {
      setSaving(false);
    }
  }

  async function logoutAllSessions() {
    if (!token) return;
    setMsg(null);
    setErr(null);
    setSaving(true);
    try {
      await apiFetch("/api/security/logout-all", { method: "POST" }, token);
      // Clear locally too
      try {
        localStorage.removeItem("token");
        document.cookie = "apex_token=; Path=/; Max-Age=0; SameSite=Lax";
      } catch {}
      window.location.href = "/login";
    } catch (e: any) {
      setErr(e?.message || "Unable to logout all sessions.");
    } finally {
      setSaving(false);
    }
  }

  function signOutThisDevice() {
    try {
      localStorage.removeItem("token");
      document.cookie = "apex_token=; Path=/; Max-Age=0; SameSite=Lax";
    } catch {}
    window.location.href = "/login";
  }

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
              Security
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-2xl">
              Manage email verification, password security, and active sessions.
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

      {/* Grid */}
      <section className="grid gap-4 xl:grid-cols-3">
        {/* Email verification */}
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/70 p-5 sm:p-6">
          <h2 className="text-sm font-semibold text-gray-50">Email security</h2>
          <p className="mt-1 text-xs text-gray-400">
            Verified emails reduce account risk and improve payout flow.
          </p>

          <div
            className={[
              "mt-4 rounded-xl border p-4",
              verified
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-amber-500/40 bg-amber-500/10",
            ].join(" ")}
          >
            <div className="flex items-start gap-2">
              {verified ? (
                <BadgeCheck className="h-4 w-4 mt-[2px] text-emerald-300" />
              ) : (
                <AlertTriangle className="h-4 w-4 mt-[2px] text-amber-300" />
              )}
              <div>
                <p className="text-xs font-semibold text-gray-50">
                  {verified ? "Verified" : "Not verified"}
                </p>
                <p className="mt-1 text-[11px] text-gray-300/90 break-all">
                  {me?.email}
                </p>
              </div>
            </div>

            {!verified && (
              <button
                type="button"
                onClick={resendVerification}
                disabled={saving}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-amber-400/70 bg-amber-500/10 px-3 py-2 text-[11px] text-amber-100 hover:bg-amber-500/20 transition disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" />
                Resend verification email
              </button>
            )}
          </div>

          <p className="mt-3 text-[10px] text-gray-500">
            If you cannot find the email, check spam/junk and ensure you typed the correct address.
          </p>
        </div>

        {/* Change password */}
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/70 p-5 sm:p-6 xl:col-span-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-50">Change password</h2>
              <p className="mt-1 text-xs text-gray-400">
                Use a strong password (8+ characters). You may log out all sessions after update.
              </p>
            </div>
            <div className="hidden sm:flex h-9 w-9 items-center justify-center rounded-xl border border-gray-800 bg-black/60">
              <KeyRound className="h-4 w-4 text-accentGold" />
            </div>
          </div>

          <form onSubmit={submitChangePassword} className="mt-4 grid gap-3 sm:grid-cols-2">
            {/* Current password */}
            <div className="sm:col-span-2">
              <label className="text-[11px] text-gray-300/90">Current password</label>
              <div className="mt-1 relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <Lock className="h-4 w-4 text-gray-500" />
                </span>
                <input
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  className="w-full rounded-lg border border-gray-800 bg-black/60 pl-9 pr-10 py-2 text-sm text-gray-50 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent((v) => !v)}
                  className="absolute inset-y-0 right-2 px-2 text-gray-300 hover:text-accentGold transition"
                  aria-label="Toggle current password visibility"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="text-[11px] text-gray-300/90">New password</label>
              <div className="mt-1 relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <Lock className="h-4 w-4 text-gray-500" />
                </span>
                <input
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-800 bg-black/60 pl-9 pr-10 py-2 text-sm text-gray-50 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
                  placeholder="New password (min 8 chars)"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew((v) => !v)}
                  className="absolute inset-y-0 right-2 px-2 text-gray-300 hover:text-accentGold transition"
                  aria-label="Toggle new password visibility"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm */}
            <div>
              <label className="text-[11px] text-gray-300/90">Confirm password</label>
              <div className="mt-1 relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                  <Lock className="h-4 w-4 text-gray-500" />
                </span>
                <input
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  className="w-full rounded-lg border border-gray-800 bg-black/60 pl-9 pr-10 py-2 text-sm text-gray-50 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
                  placeholder="Repeat new password"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-2 px-2 text-gray-300 hover:text-accentGold transition"
                  aria-label="Toggle confirm password visibility"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Logout all toggle */}
            <div className="sm:col-span-2 flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                checked={logoutAll}
                onChange={(e) => setLogoutAll(e.target.checked)}
                className="mt-[2px] h-3.5 w-3.5 rounded border border-gray-600 bg-black/60 text-accentGold focus:ring-accentGold/60"
              />
              <div className="flex flex-col">
                <span className="text-[11px] text-gray-200">
                  Log out all sessions after password change
                </span>
                <span className="text-[10px] text-gray-500">
                  Recommended if you suspect your account was accessed on another device.
                </span>
              </div>
            </div>

            <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-accentGold px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400 transition disabled:opacity-60"
              >
                <KeyRound className="h-4 w-4" />
                {saving ? "Updating..." : "Update password"}
              </button>

              <button
                type="button"
                onClick={signOutThisDevice}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-gray-800 bg-black/60 px-4 py-2.5 text-sm font-semibold text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
              >
                <LogOut className="h-4 w-4" />
                Sign out (this device)
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Sessions */}
      <section className="card-glow rounded-2xl border border-gray-800 bg-black/70 p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-50">Active sessions</h2>
            <p className="mt-1 text-xs text-gray-400">
              Review logins currently valid for your account.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={refreshSessions}
              disabled={loadingSessions}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-black/60 px-3 py-2 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" />
              {loadingSessions ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={logoutAllSessions}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-[11px] text-red-200 hover:bg-red-500/15 transition disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              Logout all
            </button>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-800">
          <table className="min-w-[820px] w-full text-xs">
            <thead className="bg-black/50">
              <tr className="text-gray-300">
                <th className="text-left px-3 py-3 font-semibold">Session</th>
                <th className="text-left px-3 py-3 font-semibold">Created</th>
                <th className="text-left px-3 py-3 font-semibold">Expires</th>
                <th className="text-left px-3 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingSessions ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-gray-400">
                    Loading sessions...
                  </td>
                </tr>
              ) : sessions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-gray-400">
                    No active sessions found.
                  </td>
                </tr>
              ) : (
                sessions.map((s) => {
                  const expires = new Date(s.expiresAt).getTime();
                  const isActive = expires > Date.now();
                  return (
                    <tr key={s.id} className="border-t border-gray-800">
                      <td className="px-3 py-3 text-gray-200">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg border border-gray-800 bg-black/60">
                            <Laptop className="h-4 w-4 text-accentGold" />
                          </span>
                          <div className="flex flex-col">
                            <span className="font-semibold">{maskJwt(s.jwtId)}</span>
                            <span className="text-[11px] text-gray-400">{s.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-gray-300">
                        {new Date(s.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-3 text-gray-300">
                        {new Date(s.expiresAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-3">
                        <span
                          className={[
                            "inline-flex rounded-lg border px-3 py-1.5 text-[11px]",
                            isActive
                              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                              : "border-amber-500/40 bg-amber-500/10 text-amber-200",
                          ].join(" ")}
                        >
                          {isActive ? "Active" : "Expired"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-[10px] text-gray-500">
          Note: “Logout all” invalidates all active sessions and redirects you to login.
        </p>
      </section>
    </div>
  );
}
