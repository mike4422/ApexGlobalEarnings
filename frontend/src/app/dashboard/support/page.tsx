"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LifeBuoy,
  MessageCircle,
  ShieldCheck,
  Copy,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type MeResponse = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    username: string;
    role: string;
    emailVerifiedAt?: string | null;
  };
};

export default function SupportPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [me, setMe] = useState<MeResponse["user"] | null>(null);

  const [copied, setCopied] = useState(false);

  // ✅ PLACEHOLDER: paste your Talk.to / Tawk.to widget script URL here when you get it.
  // Example formats often look like:
  //   https://embed.tawk.to/XXXXXXXX/1XXXXXXX
  // Keep it as a full URL string.
  const TALKTO_WIDGET_SRC = "https://embed.tawk.to/69427594e999ab1981c83799/1jclpmjqf";

  const supportIdentity = useMemo(() => {
    const name = me?.name || me?.username || "Investor";
    const email = me?.email || "";
    const userId = me?.id || "";
    return { name, email, userId };
  }, [me]);

  // Load user (optional but useful for showing identity / copyable ID)
  useEffect(() => {
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
        const data = (await apiFetch("/api/auth/me", {}, token)) as MeResponse;
        setMe(data.user);
      } catch (e: any) {
        setErr(e.message || "Failed to load account details.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Inject Talk.to / Tawk.to widget script
  useEffect(() => {
    if (!TALKTO_WIDGET_SRC) return;

    // Avoid double-inject
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-talkto="true"]'
    );
    if (existing) return;

    // ✅ Match Tawk.to snippet globals
    (window as any).Tawk_API = (window as any).Tawk_API || {};
    (window as any).Tawk_LoadStart = new Date();

    const s = document.createElement("script");
    s.async = true;
    s.src = TALKTO_WIDGET_SRC;
    s.charset = "UTF-8";
    s.setAttribute("crossorigin", "*");
    s.setAttribute("data-talkto", "true");
    document.body.appendChild(s);

    return () => {
      // Optional cleanup (usually you keep widget loaded)
      // document.body.removeChild(s);
    };
  }, [TALKTO_WIDGET_SRC]);

  async function copyUserId() {
    try {
      if (!supportIdentity.userId) return;
      await navigator.clipboard.writeText(supportIdentity.userId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
        <div className="h-5 w-40 rounded bg-gray-800/80 animate-pulse mb-3" />
        <div className="h-4 w-72 rounded bg-gray-800/80 animate-pulse mb-2" />
        <div className="h-4 w-60 rounded bg-gray-800/80 animate-pulse" />
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
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-accentGold">
              Support
            </p>
            <h1 className="mt-1 text-base sm:text-lg font-semibold text-gray-50">
              Help center & live assistance
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-400 max-w-2xl">
              Get fast help via live chat. For secure handling, always include
              your User ID when contacting support.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-gray-800 bg-black/70 px-3 py-2 text-[11px] text-gray-300">
            <ShieldCheck className="h-4 w-4 text-accentGold" />
            <span>Security-first support</span>
          </div>
        </div>
      </div>

      {/* Widget status */}
      {!TALKTO_WIDGET_SRC ? (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 sm:p-6 text-xs sm:text-sm text-amber-100 flex gap-2">
          <AlertTriangle className="h-4 w-4 mt-[2px] text-amber-200" />
          <div className="space-y-1">
            <div className="font-semibold">
              Talk.to widget placeholder is not configured yet.
            </div>
            <div className="text-amber-100/80">
              Paste your widget script URL into{" "}
              <span className="text-amber-100 font-semibold">
                TALKTO_WIDGET_SRC
              </span>{" "}
              inside this page file to enable live chat.
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 sm:p-6 text-xs sm:text-sm text-emerald-100 flex gap-2">
          <CheckCircle2 className="h-4 w-4 mt-[2px] text-emerald-300" />
          <div>
            <div className="font-semibold">Live chat is enabled.</div>
            <div className="text-emerald-100/80">
              {/* If the widget does not appear, confirm your script URL and domain
              allowlist settings in Talk.to/Tawk.to. */}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        {/* Left: Live chat instructions */}
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl border border-gray-800 bg-black/70 flex items-center justify-center">
              <LifeBuoy className="h-5 w-5 text-accentGold" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-gray-50">
                Live support via chat
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Use the chat widget to contact support regarding deposits,
                withdrawals, verification, or account access.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-800 bg-black/50 p-4">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-accentGold" />
                <p className="text-xs font-semibold text-gray-100">
                  Best practice
                </p>
              </div>
              <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                Include your <span className="text-gray-200">User ID</span> and a
                short description. Never share your password or OTP codes.
              </p>
            </div>

            <div className="rounded-xl border border-gray-800 bg-black/50 p-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accentGreen" />
                <p className="text-xs font-semibold text-gray-100">
                  Security note
                </p>
              </div>
              <p className="mt-2 text-xs text-gray-400 leading-relaxed">
                ApexGlobalEarnings staff will not ask for your password, full
                private keys, or sensitive recovery phrases.
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-gray-800 bg-black/50 p-4">
            <p className="text-[11px] text-gray-400">
              Need to manage your profile instead?
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Link
                href="/dashboard/account"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
              >
                Account
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/dashboard/security"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
              >
                Security
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Right: User identity card */}
        <div className="card-glow rounded-2xl border border-gray-800 bg-black/60 p-5 sm:p-6">
          <h3 className="text-sm font-semibold text-gray-50">
            Your support identity
          </h3>
          <p className="mt-1 text-xs text-gray-400">
            Copy this User ID when contacting support.
          </p>

          <div className="mt-4 rounded-xl border border-gray-800 bg-black/50 p-4 space-y-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                Name
              </p>
              <p className="text-xs text-gray-100 mt-1 truncate">
                {supportIdentity.name}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                Email
              </p>
              <p className="text-xs text-gray-100 mt-1 break-all">
                {supportIdentity.email || "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-gray-500">
                User ID
              </p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-xs text-gray-100 break-all flex-1">
                  {supportIdentity.userId || "—"}
                </p>
                <button
                  type="button"
                  onClick={copyUserId}
                  disabled={!supportIdentity.userId}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition disabled:opacity-60"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <p className="mt-4 text-[10px] text-gray-500 leading-relaxed">
            If you are reporting a transaction issue, include the transaction
            reference, date/time, and asset symbol.
          </p>
        </div>
      </div>
    </div>
  );
}
