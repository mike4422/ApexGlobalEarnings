"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Bell, Check, RefreshCcw, Mail, Shield } from "lucide-react";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  createdAt: string;
  readAt: string | null;
  createdBy?: { id: string; username: string; name?: string | null; role: string } | null;
};

type ListResponse = {
  items: NotificationItem[];
  unreadCount: number;
  nextCursor: string | null;
};

function fmtDate(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export default function NotificationsPage() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  async function loadInitial() {
    if (!token) {
      setLoading(false);
      setError("You are not logged in.");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = (await apiFetch("/api/notifications?take=20", {}, token)) as ListResponse;

      setItems(data.items || []);
      setUnreadCount(Number(data.unreadCount ?? 0));
      setNextCursor(data.nextCursor ?? null);

      window.dispatchEvent(new CustomEvent("apex:notifications:changed"));
    } catch (e: any) {
      setError(e?.message || "Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  }

  async function loadMore() {
    if (!token || !nextCursor) return;
    try {
      setLoadingMore(true);
      const data = (await apiFetch(
        `/api/notifications?take=20&cursor=${encodeURIComponent(nextCursor)}`,
        {},
        token
      )) as ListResponse;

      setItems((prev) => [...prev, ...(data.items || [])]);
      setUnreadCount(Number(data.unreadCount ?? 0));
      setNextCursor(data.nextCursor ?? null);

      window.dispatchEvent(new CustomEvent("apex:notifications:changed"));
    } catch (e) {
      // ignore
    } finally {
      setLoadingMore(false);
    }
  }

  async function markRead(id: string) {
    if (!token) return;

    // optimistic
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    window.dispatchEvent(new CustomEvent("apex:notifications:changed"));

    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: "POST" }, token);
      window.dispatchEvent(new CustomEvent("apex:notifications:changed"));
    } catch {
      // rollback on failure
      await loadInitial();
    }
  }

  async function markAllRead() {
    if (!token) return;

    const hadUnread = unreadCount > 0;

    // optimistic
    setItems((prev) => prev.map((n) => (n.isRead ? n : { ...n, isRead: true, readAt: new Date().toISOString() })));
    setUnreadCount(0);
    window.dispatchEvent(new CustomEvent("apex:notifications:changed"));

    try {
      await apiFetch(`/api/notifications/read-all`, { method: "POST" }, token);
      window.dispatchEvent(new CustomEvent("apex:notifications:changed"));
    } catch {
      if (hadUnread) await loadInitial();
    }
  }

  useEffect(() => {
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const unread = unreadCount;
    return { total, unread };
  }, [items.length, unreadCount]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-gray-800 bg-black/75 px-5 py-5 text-gray-50">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-accentGold/90">
              Notifications
            </p>
            <h1 className="text-lg sm:text-xl font-semibold">Alerts & updates</h1>
            <p className="text-xs sm:text-sm text-gray-400 max-w-2xl">
              System messages, account updates and admin announcements will appear here. Unread messages will also show on the bell icon.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={loadInitial}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-black/60 px-3 py-2 text-[11px] text-gray-200 hover:border-accentGold hover:text-accentGold transition"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </button>

            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-200 hover:bg-emerald-500/15 disabled:opacity-60 transition"
            >
              <Check className="h-4 w-4" />
              Mark all read
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-800 bg-black/60 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-gray-400">Unread</p>
              <Bell className="h-4 w-4 text-accentGold" />
            </div>
            <p className="mt-1 text-lg font-semibold text-gray-50">{stats.unread}</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-black/60 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-gray-400">Loaded</p>
              <Mail className="h-4 w-4 text-gray-300" />
            </div>
            <p className="mt-1 text-lg font-semibold text-gray-50">{stats.total}</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-black/60 px-4 py-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-gray-400">Security</p>
              <Shield className="h-4 w-4 text-gray-300" />
            </div>
            <p className="mt-1 text-[12px] text-gray-300">
              Keep email verified and avoid sharing login credentials.
            </p>
          </div>
        </div>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-gray-800 bg-black/80 px-4 sm:px-5 py-4 text-gray-50">
        {loading ? (
          <div className="py-12 text-center text-sm text-gray-400">Loading notifications...</div>
        ) : error ? (
          <div className="py-10 text-center">
            <p className="text-sm text-red-400">{error}</p>
            <button
              type="button"
              onClick={loadInitial}
              className="mt-3 inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-black/60 px-3 py-2 text-xs text-gray-200 hover:border-accentGold hover:text-accentGold transition"
            >
              <RefreshCcw className="h-4 w-4" />
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            No notifications yet.
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((n) => {
              const unread = !n.isRead;
              const from = n.createdBy?.role === "ADMIN"
                ? "ApexGlobalEarnings Admin"
                : n.createdBy?.username || "System";

              return (
                <div
                  key={n.id}
                  className={`rounded-xl border px-4 py-3 bg-black/60 transition ${
                    unread
                      ? "border-accentGold/50"
                      : "border-gray-800"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[12px] font-semibold text-gray-100 truncate">
                          {n.title}
                        </p>
                        {unread && (
                          <span className="inline-flex items-center rounded-full border border-accentGold/50 bg-accentGold/10 px-2 py-[2px] text-[10px] text-accentGold">
                            Unread
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-[11px] text-gray-400">
                        From: <span className="text-gray-300">{from}</span> • {fmtDate(n.createdAt)}
                      </p>

                      <p className="mt-2 text-[12px] text-gray-200 leading-relaxed">
                        {n.message}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {!n.isRead && (
                        <button
                          type="button"
                          onClick={() => markRead(n.id)}
                          className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-200 hover:bg-emerald-500/15 transition"
                        >
                          <Check className="h-4 w-4" />
                          Mark read
                        </button>
                      )}
                      {n.isRead && (
                        <span className="text-[10px] text-gray-500">
                          Read {n.readAt ? `• ${fmtDate(n.readAt)}` : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Load more */}
            {nextCursor && (
              <div className="pt-2 flex justify-center">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-black/60 px-4 py-2 text-xs text-gray-200 hover:border-accentGold hover:text-accentGold disabled:opacity-60 transition"
                >
                  {loadingMore ? "Loading..." : "Load more"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
