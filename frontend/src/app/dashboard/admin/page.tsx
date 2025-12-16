"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  Save,
  AlertTriangle,
  CheckCircle2,
  Shield,
  Users,
  Search,
  RefreshCcw,
  Edit3,
  Trash2,
  DollarSign,
  X,
} from "lucide-react";

type Settings = {
  id: number;
  btcDepositAddress: string | null;
  ethDepositAddress: string | null;
  usdtTrc20DepositAddress: string | null;
  usdtBep20DepositAddress: string | null;
  usdtErc20DepositAddress: string | null;
  level1Bps: number;
  level2Bps: number;
};

type AdminDepositRow = {
  id: string;
  asset: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED" | "CANCELLED";
  reference?: string | null;
  meta?: any;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string | null;
    username: string;
    referralCode: string;
  };
};

type AdminWithdrawalRow = {
  id: string;
  asset: string;
  network: "TRC20" | "BEP20" | "ERC20" | null;
  targetAddress: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  reviewedAt?: string | null;
  user: {
    id: string;
    email: string;
    name?: string | null;
    username: string;
    referralCode: string;
    referredBy?: {
      id: string;
      username: string;
      referralCode: string;
      email?: string | null;
      name?: string | null;
    } | null;
  };
  reviewedBy?: {
    id: string;
    email: string;
    username: string;
    name?: string | null;
  } | null;
};

type AdminNotificationForm = {
  userId: string;
  username: string;
  email: string;
  title: string;
  message: string;
};

type AdminSendNotificationPayload = {
  userId?: string;
  username?: string;
  email?: string;
  title: string;
  message: string;
  data?: any;
};

type AdminUserRow = {
  id: string;
  email: string;
  name?: string | null;
  username: string;
  role: "USER" | "ADMIN";
  referralCode: string;
  balance: number;
  createdAt: string;

  btcWallet: string | null;
  ethWallet: string | null;

  usdtTrc20Wallet: string | null;
  usdtBep20Wallet: string | null;
  usdtErc20Wallet: string | null;
};

type ToastState = {
  open: boolean;
  type: "success" | "error";
  title: string;
  message?: string;
};

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState<Settings | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [form, setForm] = useState({
    btcDepositAddress: "",
    ethDepositAddress: "",
    usdtTrc20DepositAddress: "",
    usdtBep20DepositAddress: "",
    usdtErc20DepositAddress: "",
    level1Bps: "0",
    level2Bps: "0",
  });

  // ✅ NEW: Users section
  const [usersLoading, setUsersLoading] = useState(false);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [userSearch, setUserSearch] = useState("");

  const [toast, setToast] = useState<ToastState>({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  function showToast(type: "success" | "error", title: string, message?: string) {
    setToast({ open: true, type, title, message });
    window.setTimeout(() => setToast((p) => ({ ...p, open: false })), 4200);
  }

  // Users modals
  const [editOpen, setEditOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editUser, setEditUser] = useState<AdminUserRow | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    btcWallet: "",
    ethWallet: "",
    usdtTrc20Wallet: "",
    usdtBep20Wallet: "",
    usdtErc20Wallet: "",
  });

  const [balOpen, setBalOpen] = useState(false);
  const [balSaving, setBalSaving] = useState(false);
  const [balUser, setBalUser] = useState<AdminUserRow | null>(null);
  const [balAction, setBalAction] = useState<"DEPOSIT" | "WITHDRAW">("DEPOSIT");
  const [balAmount, setBalAmount] = useState("");

  const [delOpen, setDelOpen] = useState(false);
  const [delSaving, setDelSaving] = useState(false);
  const [delUser, setDelUser] = useState<AdminUserRow | null>(null);

  // ✅ NEW: deposit requests section
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositStatus, setDepositStatus] = useState<"PENDING" | "COMPLETED" | "FAILED">("PENDING");
  const [deposits, setDeposits] = useState<AdminDepositRow[]>([]);

  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // ✅ NEW: withdrawals section
  const [withdrawalLoading, setWithdrawalLoading] = useState(false);
  const [withdrawalStatus, setWithdrawalStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [withdrawals, setWithdrawals] = useState<AdminWithdrawalRow[]>([]);

  const [wRejectOpen, setWRejectOpen] = useState(false);
  const [wRejectId, setWRejectId] = useState<string | null>(null);
  const [wRejectReason, setWRejectReason] = useState("");

  // ✅ NEW: admin send notification
  const [notifForm, setNotifForm] = useState<AdminNotificationForm>({
    userId: "",
    username: "",
    email: "",
    title: "",
    message: "",
  });

  const [notifSending, setNotifSending] = useState(false);
  const [notifMsg, setNotifMsg] = useState<string | null>(null);
  const [notifErr, setNotifErr] = useState<string | null>(null);

  function getToken() {
    return typeof window !== "undefined" ? localStorage.getItem("token") : null;
  }

  async function loadUsers(search?: string) {
    const token = getToken();
    if (!token) return;

    setUsersLoading(true);
    try {
      const s = (search ?? userSearch).trim();
      const path = s ? `/api/admin/users?search=${encodeURIComponent(s)}` : "/api/admin/users";
      const data = await apiFetch(path, {}, token);
      setUsers((data.users || []) as AdminUserRow[]);
    } catch (e: any) {
      showToast("error", "Failed to load users", e.message || "Unable to load users list.");
    } finally {
      setUsersLoading(false);
    }
  }

  function openEdit(u: AdminUserRow) {
    setEditUser(u);
    setEditForm({
      name: u.name || "",
      username: u.username || "",
      email: u.email || "",
      password: "",
      btcWallet: u.btcWallet || "",
      ethWallet: u.ethWallet || "",
      usdtTrc20Wallet: u.usdtTrc20Wallet || "",
      usdtBep20Wallet: u.usdtBep20Wallet || "",
      usdtErc20Wallet: u.usdtErc20Wallet || "",
    });
    setEditOpen(true);
  }

  async function submitEdit() {
    const token = getToken();
    if (!token || !editUser) return;

    setEditSaving(true);
    try {
      const payload: any = {
        name: editForm.name,
        username: editForm.username,
        email: editForm.email,

        btcWallet: editForm.btcWallet,
        ethWallet: editForm.ethWallet,

        usdtTrc20Wallet: editForm.usdtTrc20Wallet,
        usdtBep20Wallet: editForm.usdtBep20Wallet,
        usdtErc20Wallet: editForm.usdtErc20Wallet,
      };

      if (editForm.password && editForm.password.trim().length > 0) {
        payload.password = editForm.password.trim();
      }

      await apiFetch(`/api/admin/users/${editUser.id}`, { method: "PUT", body: JSON.stringify(payload) }, token);
      showToast("success", "User updated", "User profile and wallets updated successfully.");
      setEditOpen(false);
      setEditUser(null);
      await loadUsers();
    } catch (e: any) {
      showToast("error", "Update failed", e.message || "Failed to update user.");
    } finally {
      setEditSaving(false);
    }
  }

  function openBalance(u: AdminUserRow) {
    setBalUser(u);
    setBalAction("DEPOSIT");
    setBalAmount("");
    setBalOpen(true);
  }

  async function submitBalance() {
    const token = getToken();
    if (!token || !balUser) return;

    const amt = Number(balAmount);
    if (!Number.isFinite(amt) || amt <= 0) {
      showToast("error", "Invalid amount", "Enter a valid amount greater than 0.");
      return;
    }

    setBalSaving(true);
    try {
      await apiFetch(
        `/api/admin/users/${balUser.id}/balance`,
        { method: "POST", body: JSON.stringify({ action: balAction, amount: amt }) },
        token
      );

      showToast(
        "success",
        balAction === "DEPOSIT" ? "Balance funded" : "Balance withdrawn",
        "Email + dashboard notification were sent to the user."
      );

      setBalOpen(false);
      setBalUser(null);
      await loadUsers();
      // Optional: if your Topbar listens, this refreshes it; harmless otherwise
      window.dispatchEvent(new Event("apex:notifications:changed"));
    } catch (e: any) {
      showToast("error", "Balance update failed", e.message || "Failed to update balance.");
    } finally {
      setBalSaving(false);
    }
  }

  function openDelete(u: AdminUserRow) {
    setDelUser(u);
    setDelOpen(true);
  }

  async function confirmDelete() {
    const token = getToken();
    if (!token || !delUser) return;

    setDelSaving(true);
    try {
      await apiFetch(`/api/admin/users/${delUser.id}`, { method: "DELETE" }, token);
      showToast("success", "User deleted", "User removed successfully.");
      setDelOpen(false);
      setDelUser(null);
      await loadUsers();
    } catch (e: any) {
      showToast("error", "Delete failed", e.message || "Failed to delete user.");
    } finally {
      setDelSaving(false);
    }
  }

  useEffect(() => {
    async function load() {
      const token = getToken();
      if (!token) {
        setErr("You are not logged in.");
        setLoading(false);
        return;
      }

      try {
        setErr(null);

        // ✅ Load users FIRST (new first section)
        await loadUsers("");

        const data = await apiFetch("/api/admin/settings", {}, token);
        const s = data.settings as Settings;

        setSettings(s);
        setForm({
          btcDepositAddress: s.btcDepositAddress || "",
          ethDepositAddress: s.ethDepositAddress || "",
          usdtTrc20DepositAddress: s.usdtTrc20DepositAddress || "",
          usdtBep20DepositAddress: s.usdtBep20DepositAddress || "",
          usdtErc20DepositAddress: s.usdtErc20DepositAddress || "",
          level1Bps: String(s.level1Bps ?? 0),
          level2Bps: String(s.level2Bps ?? 0),
        });

        await loadDeposits("PENDING");
        await loadWithdrawals("PENDING");
      } catch (e: any) {
        setErr(e.message || "Failed to load settings.");
      } finally {
        setLoading(false);
      }
    }

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save() {
    const token = getToken();
    if (!token) {
      setErr("You are not logged in.");
      return;
    }

    setSaving(true);
    setMsg(null);
    setErr(null);

    try {
      const payload = {
        btcDepositAddress: form.btcDepositAddress,
        ethDepositAddress: form.ethDepositAddress,
        usdtTrc20DepositAddress: form.usdtTrc20DepositAddress,
        usdtBep20DepositAddress: form.usdtBep20DepositAddress,
        usdtErc20DepositAddress: form.usdtErc20DepositAddress,
        level1Bps: Number(form.level1Bps || 0),
        level2Bps: Number(form.level2Bps || 0),
      };

      const data = await apiFetch("/api/admin/settings", { method: "PUT", body: JSON.stringify(payload) }, token);
      setSettings(data.settings as Settings);
      setMsg("Wallet addresses updated successfully.");
    } catch (e: any) {
      setErr(e.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  async function loadDeposits(status: "PENDING" | "COMPLETED" | "FAILED" = depositStatus) {
    const token = getToken();
    if (!token) return;

    setDepositLoading(true);
    try {
      const data = await apiFetch(`/api/admin/deposits?status=${status}`, {}, token);
      setDeposits((data.deposits || []) as AdminDepositRow[]);
    } catch (e: any) {
      setErr(e.message || "Failed to load deposit requests.");
    } finally {
      setDepositLoading(false);
    }
  }

  async function approveDeposit(id: string) {
    const token = getToken();
    if (!token) return;

    setSaving(true);
    setMsg(null);
    setErr(null);

    try {
      await apiFetch(`/api/admin/deposits/${id}/approve`, { method: "POST" }, token);
      setMsg("Deposit approved.");
      await loadDeposits();
    } catch (e: any) {
      setErr(e.message || "Failed to approve deposit.");
    } finally {
      setSaving(false);
    }
  }

  async function submitReject() {
    const token = getToken();
    if (!token || !rejectId) return;

    setSaving(true);
    setMsg(null);
    setErr(null);

    try {
      await apiFetch(
        `/api/admin/deposits/${rejectId}/reject`,
        { method: "POST", body: JSON.stringify({ reason: rejectReason || "Deposit rejected by admin" }) },
        token
      );

      setMsg("Deposit rejected.");
      setRejectOpen(false);
      setRejectId(null);
      setRejectReason("");
      await loadDeposits();
    } catch (e: any) {
      setErr(e.message || "Failed to reject deposit.");
    } finally {
      setSaving(false);
    }
  }

  async function loadWithdrawals(status: "PENDING" | "APPROVED" | "REJECTED" = withdrawalStatus) {
    const token = getToken();
    if (!token) return;

    setWithdrawalLoading(true);
    try {
      const data = await apiFetch(`/api/admin/withdrawals?status=${status}`, {}, token);
      setWithdrawals((data.withdrawals || []) as AdminWithdrawalRow[]);
    } catch (e: any) {
      setErr(e.message || "Failed to load withdrawal requests.");
    } finally {
      setWithdrawalLoading(false);
    }
  }

  async function approveWithdrawal(id: string) {
    const token = getToken();
    if (!token) return;

    setSaving(true);
    setMsg(null);
    setErr(null);

    try {
      await apiFetch(`/api/admin/withdrawals/${id}/approve`, { method: "POST" }, token);
      setMsg("Withdrawal approved.");
      await loadWithdrawals();
    } catch (e: any) {
      setErr(e.message || "Failed to approve withdrawal.");
    } finally {
      setSaving(false);
    }
  }

  function openRejectWithdrawal(id: string) {
    setWRejectId(id);
    setWRejectReason("");
    setWRejectOpen(true);
  }

  async function submitRejectWithdrawal() {
    const token = getToken();
    if (!token || !wRejectId) return;

    setSaving(true);
    setMsg(null);
    setErr(null);

    try {
      await apiFetch(
        `/api/admin/withdrawals/${wRejectId}/reject`,
        { method: "POST", body: JSON.stringify({ reason: wRejectReason || "Withdrawal rejected by admin" }) },
        token
      );

      setMsg("Withdrawal rejected.");
      setWRejectOpen(false);
      setWRejectId(null);
      setWRejectReason("");
      await loadWithdrawals();
    } catch (e: any) {
      setErr(e.message || "Failed to reject withdrawal.");
    } finally {
      setSaving(false);
    }
  }

  async function sendNotification() {
    const token = getToken();
    if (!token) {
      setNotifErr("You are not logged in.");
      return;
    }

    setNotifSending(true);
    setNotifMsg(null);
    setNotifErr(null);

    try {
      const payload: AdminSendNotificationPayload = {
        title: notifForm.title.trim(),
        message: notifForm.message.trim(),
        data: { source: "admin_panel" },
      };

      if (notifForm.userId.trim()) payload.userId = notifForm.userId.trim();
      else if (notifForm.username.trim()) payload.username = notifForm.username.trim();
      else if (notifForm.email.trim()) payload.email = notifForm.email.trim();
      else {
        setNotifErr("Provide userId OR username OR email.");
        setNotifSending(false);
        return;
      }

      if (!payload.title || !payload.message) {
        setNotifErr("Title and message are required.");
        setNotifSending(false);
        return;
      }

      await apiFetch("/api/admin/notifications/send", { method: "POST", body: JSON.stringify(payload) }, token);

      setNotifMsg("Notification sent successfully.");
      setNotifForm((p) => ({ ...p, title: "", message: "" }));
    } catch (e: any) {
      setNotifErr(e.message || "Failed to send notification.");
    } finally {
      setNotifSending(false);
    }
  }

  if (loading) {
    return (
      <div className="card-glow rounded-2xl border border-gray-800 dark:bg-black/60 bg-white p-5 sm:p-6">
        <div className="h-5 w-44 rounded bg-gray-200 dark:bg-gray-800/80 animate-pulse mb-2" />
        <div className="h-4 w-72 rounded bg-gray-200 dark:bg-gray-800/80 animate-pulse" />
      </div>
    );
  }

  if (err && !settings) {
    return (
      <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-5 text-sm text-red-200 flex gap-2">
        <AlertTriangle className="h-4 w-4 mt-[2px] text-red-300" />
        <span>{err}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ✅ Toast */}
      {toast.open && (
        <div className="fixed right-4 top-4 z-[9999] w-[92vw] max-w-sm">
          <div
            className={[
              "card-glow rounded-2xl border p-4 shadow-2xl backdrop-blur",
              toast.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10"
                : "border-red-500/40 bg-red-500/10",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-50">{toast.title}</p>
                {toast.message ? (
                  <p className="mt-1 text-[12px] text-gray-300/90">{toast.message}</p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => setToast((p) => ({ ...p, open: false }))}
                className="rounded-lg border border-gray-800 bg-black/50 px-2 py-1 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ FIRST SECTION: Users */}
      <div className="card-glow rounded-2xl border border-gray-800 dark:bg-black/60 bg-white p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-accentGold" />
              <h2 className="text-sm font-semibold dark:text-gray-50 text-slate-900">
                Users
              </h2>
              <span className="text-[11px] dark:text-gray-400 text-slate-600">
                • {users.length} total
              </span>
            </div>
            <p className="text-xs dark:text-gray-400 text-slate-600 mt-1 max-w-2xl">
              Edit user profile, update wallets (BTC/ETH/USDT networks), fund or withdraw balance, and delete users.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
            <div className="relative w-full sm:w-[320px]">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                <Search className="h-4 w-4 text-gray-500" />
              </span>
              <input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search name, username, email, referral code..."
                className="w-full rounded-lg border border-gray-800 dark:bg-black/70 bg-slate-50 pl-9 pr-3 py-2 text-sm dark:text-gray-100 text-slate-900 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
              />
            </div>

            <button
              type="button"
              onClick={() => loadUsers()}
              disabled={usersLoading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-800 dark:bg-black/70 bg-slate-50 px-3 py-2 text-xs dark:text-gray-200 text-slate-700 hover:border-accentGold/60 hover:text-accentGold transition disabled:opacity-60"
            >
              <RefreshCcw className="h-4 w-4" />
              {usersLoading ? "Loading..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={() => loadUsers(userSearch)}
              disabled={usersLoading}
              className="inline-flex items-center justify-center rounded-lg bg-accentGold px-3 py-2 text-xs font-semibold text-black hover:bg-yellow-400 transition disabled:opacity-60"
            >
              Search
            </button>
          </div>
        </div>

        {usersLoading ? (
          <div className="mt-4 space-y-2">
            <div className="h-4 w-56 rounded bg-gray-200 dark:bg-gray-800/80 animate-pulse" />
            <div className="h-4 w-72 rounded bg-gray-200 dark:bg-gray-800/80 animate-pulse" />
          </div>
        ) : users.length === 0 ? (
          <p className="mt-4 text-xs dark:text-gray-400 text-slate-600">No users found.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl border border-gray-800">
            <table className="min-w-[1100px] w-full text-xs">
              <thead className="dark:bg-black/50 bg-slate-50">
                <tr className="dark:text-gray-300 text-slate-600">
                  <th className="text-left px-3 py-3 font-semibold">User</th>
                  <th className="text-left px-3 py-3 font-semibold">Role</th>
                  <th className="text-left px-3 py-3 font-semibold">Balance</th>
                  <th className="text-left px-3 py-3 font-semibold">Wallets</th>
                  <th className="text-right px-3 py-3 font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-t border-gray-800">
                    <td className="px-3 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-100">{u.username}</span>
                        <span className="text-[11px] text-gray-400">
                          {u.email}
                          {u.name ? ` • ${u.name}` : ""}
                        </span>
                        <span className="text-[10px] text-gray-500">code: {u.referralCode}</span>
                      </div>
                    </td>

                    <td className="px-3 py-3 text-gray-200">
                      <span className="rounded-lg border border-gray-800 bg-black/40 px-2 py-1 text-[11px]">
                        {u.role}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-gray-200 font-semibold">
                      ${Number(u.balance || 0).toLocaleString()}
                    </td>

                    <td className="px-3 py-3 text-gray-200">
                      <div className="text-[11px] text-gray-400 space-y-1">
                        <div className="truncate max-w-[420px]">BTC: {u.btcWallet || "—"}</div>
                        <div className="truncate max-w-[420px]">ETH: {u.ethWallet || "—"}</div>
                        <div className="truncate max-w-[420px]">USDT TRC20: {u.usdtTrc20Wallet || "—"}</div>
                        <div className="truncate max-w-[420px]">USDT BEP20: {u.usdtBep20Wallet || "—"}</div>
                        <div className="truncate max-w-[420px]">USDT ERC20: {u.usdtErc20Wallet || "—"}</div>
                      </div>
                    </td>

                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openBalance(u)}
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-800 bg-black/60 px-3 py-2 text-[11px] text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
                        >
                          <DollarSign className="h-4 w-4" />
                          Balance
                        </button>

                        <button
                          type="button"
                          onClick={() => openEdit(u)}
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-2 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-500/20 transition"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => openDelete(u)}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-[11px] font-semibold text-red-200 hover:bg-red-500/15 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="card-glow rounded-2xl border border-gray-800 dark:bg-black/60 bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-base sm:text-lg font-semibold dark:text-gray-50 text-slate-900">
              Admin Settings
            </h1>
            <p className="text-xs sm:text-sm dark:text-gray-400 text-slate-600 mt-1 max-w-2xl">
              Manage platform deposit wallet addresses (shown on user deposit page) and referral basis points.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-gray-800 dark:bg-black/70 bg-slate-50 px-3 py-2 text-[11px] dark:text-gray-300 text-slate-700">
            <Shield className="h-4 w-4 text-accentGold" />
            <span>Admin only</span>
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

      {/* Form */}
      <div className="card-glow rounded-2xl border border-gray-800 dark:bg-black/60 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold dark:text-gray-50 text-slate-900">
          Deposit wallet addresses
        </h2>
        <p className="text-xs dark:text-gray-400 text-slate-600 mt-1">
          Leave empty to clear. These values are fetched by users on the Deposit page.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { key: "btcDepositAddress", label: "BTC address" },
            { key: "ethDepositAddress", label: "ETH address" },
            { key: "usdtTrc20DepositAddress", label: "USDT (TRC20)" },
            { key: "usdtBep20DepositAddress", label: "USDT (BSC / BEP20)" },
            { key: "usdtErc20DepositAddress", label: "USDT (ERC20)" },
          ].map((f) => (
            <div key={f.key} className="sm:col-span-1">
              <label className="text-[11px] dark:text-gray-300/90 text-slate-700">
                {f.label}
              </label>
              <input
                value={(form as any)[f.key]}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                placeholder="Paste wallet address"
                className="mt-1 w-full rounded-lg border border-gray-800 dark:bg-black/70 bg-slate-50 px-3 py-2 text-sm dark:text-gray-100 text-slate-900 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
              />
            </div>
          ))}
        </div>

        <div className="mt-6 border-t border-gray-800/80 pt-5">
          <h3 className="text-sm font-semibold dark:text-gray-50 text-slate-900">
            Referral commission (basis points)
          </h3>
          <p className="text-xs dark:text-gray-400 text-slate-600 mt-1">
            Example: 500 = 5%. These are used by your ROI cron.
          </p>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-[11px] dark:text-gray-300/90 text-slate-700">
                Level 1 (BPS)
              </label>
              <input
                value={form.level1Bps}
                onChange={(e) => setForm((p) => ({ ...p, level1Bps: e.target.value }))}
                inputMode="numeric"
                className="mt-1 w-full rounded-lg border border-gray-800 dark:bg-black/70 bg-slate-50 px-3 py-2 text-sm dark:text-gray-100 text-slate-900 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
              />
            </div>
            <div>
              <label className="text-[11px] dark:text-gray-300/90 text-slate-700">
                Level 2 (BPS)
              </label>
              <input
                value={form.level2Bps}
                onChange={(e) => setForm((p) => ({ ...p, level2Bps: e.target.value }))}
                inputMode="numeric"
                className="mt-1 w-full rounded-lg border border-gray-800 dark:bg-black/70 bg-slate-50 px-3 py-2 text-sm dark:text-gray-100 text-slate-900 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="mt-5 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-accentGold px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400 transition disabled:opacity-60"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save settings"}
          </button>
        </div>
      </div>

      {/* ✅ Deposit Requests (UNCHANGED from your file) */}
      <div className="card-glow rounded-2xl border border-gray-800 dark:bg-black/60 bg-white p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold dark:text-gray-50 text-slate-900">
              Deposit Requests
            </h2>
            <p className="text-xs dark:text-gray-400 text-slate-600 mt-1">
              Review and approve/reject user deposit requests. Approved deposits credit user balance automatically.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={depositStatus}
              onChange={(e) => {
                const v = e.target.value as any;
                setDepositStatus(v);
                loadDeposits(v);
              }}
              className="rounded-lg border border-gray-800 dark:bg-black/70 bg-slate-50 px-3 py-2 text-xs dark:text-gray-100 text-slate-900 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
            >
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Approved</option>
              <option value="FAILED">Rejected</option>
            </select>

            <button
              type="button"
              onClick={() => loadDeposits()}
              className="rounded-lg border border-gray-800 dark:bg-black/70 bg-slate-50 px-3 py-2 text-xs dark:text-gray-200 text-slate-900 hover:border-accentGold/60 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {depositLoading ? (
          <div className="mt-4 space-y-2">
            <div className="h-4 w-56 rounded bg-gray-200 dark:bg-gray-800/80 animate-pulse" />
            <div className="h-4 w-72 rounded bg-gray-200 dark:bg-gray-800/80 animate-pulse" />
          </div>
        ) : deposits.length === 0 ? (
          <p className="mt-4 text-xs dark:text-gray-400 text-slate-600">
            No deposits found for this filter.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="dark:text-gray-400 text-slate-600">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">User</th>
                  <th className="py-2 pr-4 font-medium">Referrer</th>
                  <th className="py-2 pr-4 font-medium">Asset</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">Reference</th>
                  <th className="py-2 pr-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="dark:text-gray-200 text-slate-900">
                {deposits.map((d) => {
                  const ref = d.meta?.referrer?.username || d.meta?.referrer?.name || "—";
                  return (
                    <tr key={d.id} className="border-t border-gray-800/80">
                      <td className="py-2 pr-4 dark:text-gray-300 text-slate-700">
                        {new Date(d.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 pr-4">
                        <div className="font-medium">{d.user.username}</div>
                        <div className="text-[10px] dark:text-gray-400 text-slate-600">
                          {d.user.email}
                        </div>
                      </td>
                      <td className="py-2 pr-4 dark:text-gray-300 text-slate-700">{ref}</td>
                      <td className="py-2 pr-4">{d.asset}</td>
                      <td className="py-2 pr-4">${Number(d.amount).toLocaleString()}</td>
                      <td className="py-2 pr-4 dark:text-gray-400 text-slate-600">
                        {d.reference ? <span className="break-all">{d.reference}</span> : "—"}
                      </td>
                      <td className="py-2 pr-4">
                        {d.status === "PENDING" ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => approveDeposit(d.id)}
                              className="rounded-lg bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 text-[11px] font-semibold text-emerald-200 hover:bg-emerald-500/20 transition"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectOpen(true);
                                setRejectId(d.id);
                                setRejectReason("");
                              }}
                              className="rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-1.5 text-[11px] font-semibold text-red-200 hover:bg-red-500/15 transition"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] dark:text-gray-400 text-slate-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ✅ Withdrawal Requests (UNCHANGED from your file) */}
      <div className="card-glow rounded-2xl border border-gray-800 dark:bg-black/60 bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold dark:text-gray-50 text-slate-900">
              Withdrawal requests
            </h2>
            <p className="text-xs dark:text-gray-400 text-slate-600 mt-1">
              Review withdrawals submitted by users. Approve to mark paid; reject to decline (user gets email).
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadWithdrawals()}
            disabled={withdrawalLoading}
            className="rounded-lg border border-gray-800 dark:bg-black/70 bg-slate-50 px-3 py-2 text-[11px] dark:text-gray-200 text-slate-700 hover:border-accentGold/60 hover:text-accentGold transition disabled:opacity-60"
          >
            {withdrawalLoading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {(["PENDING", "APPROVED", "REJECTED"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => {
                setWithdrawalStatus(s);
                loadWithdrawals(s);
              }}
              className={[
                "rounded-lg border px-3 py-2 text-[11px] transition",
                s === withdrawalStatus
                  ? "border-accentGold/60 bg-accentGold/10 text-accentGold"
                  : "border-gray-800 dark:bg-black/70 bg-slate-50 dark:text-gray-200 text-slate-700 hover:border-accentGold/60 hover:text-accentGold",
              ].join(" ")}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-4 overflow-x-auto rounded-xl border border-gray-800">
          <table className="min-w-[980px] w-full text-xs">
            <thead className="dark:bg-black/50 bg-slate-50">
              <tr className="dark:text-gray-300 text-slate-600">
                <th className="text-left px-3 py-3 font-semibold">Date</th>
                <th className="text-left px-3 py-3 font-semibold">User</th>
                <th className="text-left px-3 py-3 font-semibold">Referral</th>
                <th className="text-left px-3 py-3 font-semibold">Asset</th>
                <th className="text-left px-3 py-3 font-semibold">Amount (USD)</th>
                <th className="text-left px-3 py-3 font-semibold">Destination</th>
                <th className="text-right px-3 py-3 font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {withdrawalLoading ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-gray-400">
                    Loading withdrawals...
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-6 text-center text-gray-400">
                    No {withdrawalStatus.toLowerCase()} withdrawal requests.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => {
                  const ref = w.user?.referredBy ? w.user.referredBy : null;
                  return (
                    <tr key={w.id} className="border-t border-gray-800">
                      <td className="px-3 py-3 text-gray-300">
                        {new Date(w.createdAt).toLocaleString()}
                      </td>

                      <td className="px-3 py-3 text-gray-200">
                        <div className="flex flex-col">
                          <span className="font-semibold">{w.user?.username}</span>
                          <span className="text-[11px] text-gray-400">{w.user?.email}</span>
                        </div>
                      </td>

                      <td className="px-3 py-3 text-gray-300">
                        {ref ? (
                          <div className="flex flex-col">
                            <span className="font-semibold">{ref.username}</span>
                            <span className="text-[11px] text-gray-400">code: {ref.referralCode}</span>
                          </div>
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </td>

                      <td className="px-3 py-3 text-gray-200">
                        {w.asset}
                        {w.network ? <span className="text-gray-400"> / {w.network}</span> : null}
                      </td>

                      <td className="px-3 py-3 text-gray-200 font-semibold">
                        ${Number(w.amount || 0).toLocaleString()}
                      </td>

                      <td className="px-3 py-3 text-gray-200">
                        <span className="break-all">{w.targetAddress}</span>
                      </td>

                      <td className="px-3 py-3">
                        {w.status === "PENDING" ? (
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => approveWithdrawal(w.id)}
                              disabled={saving}
                              className="rounded-lg bg-emerald-500/15 border border-emerald-500/40 px-3 py-2 text-[11px] text-emerald-200 hover:bg-emerald-500/25 transition disabled:opacity-60"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => openRejectWithdrawal(w.id)}
                              disabled={saving}
                              className="rounded-lg bg-red-500/10 border border-red-500/40 px-3 py-2 text-[11px] text-red-200 hover:bg-red-500/20 transition disabled:opacity-60"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end">
                            <span
                              className={[
                                "rounded-lg border px-3 py-2 text-[11px]",
                                w.status === "APPROVED"
                                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                                  : "border-red-500/40 bg-red-500/10 text-red-200",
                              ].join(" ")}
                            >
                              {w.status}
                            </span>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {wRejectOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
            <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-black/90 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-50">Reject withdrawal</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Provide an optional reason. The user will receive this by email.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setWRejectOpen(false);
                    setWRejectId(null);
                    setWRejectReason("");
                  }}
                  className="rounded-lg border border-gray-800 bg-black/70 p-2 text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <textarea
                value={wRejectReason}
                onChange={(e) => setWRejectReason(e.target.value)}
                placeholder="Reason (optional)"
                className="mt-4 w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
                rows={4}
              />

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={submitRejectWithdrawal}
                  disabled={saving}
                  className="flex-1 rounded-lg bg-red-500/20 border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-500/30 transition disabled:opacity-60"
                >
                  {saving ? "Rejecting..." : "Reject"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWRejectOpen(false);
                    setWRejectId(null);
                    setWRejectReason("");
                  }}
                  className="flex-1 rounded-lg border border-gray-800 bg-black/70 px-4 py-2.5 text-sm text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ✅ Send User Notification (UNCHANGED from your file) */}
      <div className="card-glow rounded-2xl border border-gray-800 dark:bg-black/60 bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold dark:text-gray-50 text-slate-900">
              Send notification
            </h2>
            <p className="text-xs dark:text-gray-400 text-slate-600 mt-1 max-w-2xl">
              Send an in-app notification to a user. The notification will appear on their Notifications page and increase the bell badge count.
            </p>
          </div>
        </div>

        {notifMsg && (
          <div className="mt-4 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-xs sm:text-sm text-emerald-100 flex gap-2">
            <CheckCircle2 className="h-4 w-4 mt-[2px] text-emerald-300" />
            <span>{notifMsg}</span>
          </div>
        )}
        {notifErr && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-100 flex gap-2">
            <AlertTriangle className="h-4 w-4 mt-[2px] text-red-300" />
            <span>{notifErr}</span>
          </div>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <label className="text-[11px] dark:text-gray-300/90 text-slate-700">
              User ID (optional)
            </label>
            <input
              value={notifForm.userId}
              onChange={(e) => setNotifForm((p) => ({ ...p, userId: e.target.value }))}
              placeholder="cuid() user id"
              className="mt-1 w-full rounded-lg border border-gray-800 dark:bg-black/70 bg-slate-50 px-3 py-2 text-sm dark:text-gray-100 text-slate-900 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
            />
            <p className="mt-1 text-[10px] dark:text-gray-500 text-slate-500">
              Provide one: userId OR username OR email
            </p>
          </div>

          <div>
            <label className="text-[11px] dark:text-gray-300/90 text-slate-700">
              Username (optional)
            </label>
            <input
              value={notifForm.username}
              onChange={(e) => setNotifForm((p) => ({ ...p, username: e.target.value }))}
              placeholder="e.g. john_doe"
              className="mt-1 w-full rounded-lg border border-gray-800 dark:bg-black/70 bg-slate-50 px-3 py-2 text-sm dark:text-gray-100 text-slate-900 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
            />
          </div>

          <div>
            <label className="text-[11px] dark:text-gray-300/90 text-slate-700">
              Email (optional)
            </label>
            <input
              value={notifForm.email}
              onChange={(e) => setNotifForm((p) => ({ ...p, email: e.target.value }))}
              placeholder="user@example.com"
              className="mt-1 w-full rounded-lg border border-gray-800 dark:bg-black/70 bg-slate-50 px-3 py-2 text-sm dark:text-gray-100 text-slate-900 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
            />
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-[11px] dark:text-gray-300/90 text-slate-700">
              Title
            </label>
            <input
              value={notifForm.title}
              onChange={(e) => setNotifForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g. Account update"
              className="mt-1 w-full rounded-lg border border-gray-800 dark:bg-black/70 bg-slate-50 px-3 py-2 text-sm dark:text-gray-100 text-slate-900 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
            />
          </div>

          <div>
            <label className="text-[11px] dark:text-gray-300/90 text-slate-700">
              Message
            </label>
            <textarea
              value={notifForm.message}
              onChange={(e) => setNotifForm((p) => ({ ...p, message: e.target.value }))}
              rows={3}
              placeholder="Write the notification message to the user..."
              className="mt-1 w-full rounded-lg border border-gray-800 dark:bg-black/70 bg-slate-50 px-3 py-2 text-sm dark:text-gray-100 text-slate-900 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={sendNotification}
            disabled={notifSending}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-accentGold px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400 transition disabled:opacity-60"
          >
            {notifSending ? "Sending..." : "Send notification"}
          </button>

          <button
            type="button"
            onClick={() => {
              setNotifForm({ userId: "", username: "", email: "", title: "", message: "" });
              setNotifMsg(null);
              setNotifErr(null);
            }}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-gray-800 dark:bg-black/70 bg-slate-50 px-4 py-2.5 text-sm font-semibold dark:text-gray-200 text-slate-900 hover:border-accentGold/60 hover:text-accentGold transition"
          >
            Clear
          </button>
        </div>
      </div>

      {/* ✅ Reject modal (Deposit) */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 dark:bg-black/80 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold dark:text-gray-50 text-slate-900">
                  Reject deposit
                </h3>
                <p className="mt-1 text-xs dark:text-gray-400 text-slate-600">
                  Provide a reason. The user will receive this in the rejection email.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setRejectOpen(false);
                  setRejectId(null);
                  setRejectReason("");
                }}
                className="rounded-lg border border-gray-800 dark:bg-black/70 bg-slate-50 p-2 dark:text-gray-200 text-slate-700 hover:border-accentGold/60 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              placeholder="e.g. Transaction hash invalid / amount mismatch / not received..."
              className="mt-4 w-full rounded-lg border border-gray-800 dark:bg-black/70 bg-slate-50 px-3 py-2 text-sm dark:text-gray-100 text-slate-900 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
            />

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={submitReject}
                disabled={saving}
                className="flex-1 rounded-lg bg-red-500/15 border border-red-500/30 px-4 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-500/20 transition disabled:opacity-60"
              >
                {saving ? "Rejecting..." : "Reject deposit"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setRejectOpen(false);
                  setRejectId(null);
                  setRejectReason("");
                }}
                className="flex-1 rounded-lg border border-gray-800 dark:bg-black/70 bg-slate-50 px-4 py-2.5 text-sm font-semibold dark:text-gray-200 text-slate-900 hover:border-accentGold/60 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Edit user modal */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-800 bg-black/90 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-50">Edit user</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Update profile, password (optional), and wallets. Leaving a wallet empty clears it.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditOpen(false);
                  setEditUser(null);
                }}
                className="rounded-lg border border-gray-800 bg-black/70 p-2 text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {[
                { key: "name", label: "Full name", placeholder: "e.g. Daniel Okafor" },
                { key: "username", label: "Username", placeholder: "e.g. danielx" },
                { key: "email", label: "Email", placeholder: "e.g. you@example.com" },
                { key: "password", label: "New password (optional)", placeholder: "Minimum 8 characters", type: "password" },
                { key: "btcWallet", label: "BTC wallet", placeholder: "BTC address" },
                { key: "ethWallet", label: "ETH wallet", placeholder: "ETH address" },
                { key: "usdtTrc20Wallet", label: "USDT wallet (TRC20)", placeholder: "TRC20 address" },
                { key: "usdtBep20Wallet", label: "USDT wallet (BEP20)", placeholder: "BEP20 address" },
                { key: "usdtErc20Wallet", label: "USDT wallet (ERC20)", placeholder: "ERC20 address" },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-[11px] text-gray-300/90">{f.label}</label>
                  <input
                    type={(f as any).type || "text"}
                    value={(editForm as any)[f.key]}
                    onChange={(e) => setEditForm((p) => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="mt-1 w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
                  />
                </div>
              ))}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={submitEdit}
                disabled={editSaving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-accentGold px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400 transition disabled:opacity-60"
              >
                {editSaving ? "Saving..." : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditOpen(false);
                  setEditUser(null);
                }}
                className="flex-1 rounded-lg border border-gray-800 bg-black/70 px-4 py-2.5 text-sm text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Balance modal */}
      {balOpen && balUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-black/90 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-50">Adjust balance</h3>
                <p className="text-xs text-gray-400 mt-1">
                  Funds change balance instantly and sends email + notification.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setBalOpen(false);
                  setBalUser(null);
                }}
                className="rounded-lg border border-gray-800 bg-black/70 p-2 text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-gray-800 bg-black/60 p-3">
              <div className="text-[11px] text-gray-400">User</div>
              <div className="text-sm font-semibold text-gray-100">{balUser.username}</div>
              <div className="text-[11px] text-gray-400">{balUser.email}</div>
              <div className="mt-2 text-[11px] text-gray-400">
                Current balance:{" "}
                <span className="text-gray-100 font-semibold">
                  ${Number(balUser.balance || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[11px] text-gray-300/90">Action</label>
                <select
                  value={balAction}
                  onChange={(e) => setBalAction(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
                >
                  <option value="DEPOSIT">Fund (deposit)</option>
                  <option value="WITHDRAW">Withdraw</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-gray-300/90">Amount (USD)</label>
                <input
                  value={balAmount}
                  onChange={(e) => setBalAmount(e.target.value)}
                  inputMode="decimal"
                  placeholder="e.g. 250"
                  className="mt-1 w-full rounded-lg border border-gray-800 bg-black/70 px-3 py-2 text-sm text-gray-100 outline-none focus:border-accentGold/70 focus:ring-1 focus:ring-accentGold/40"
                />
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={submitBalance}
                disabled={balSaving}
                className="flex-1 rounded-lg bg-accentGold px-4 py-2.5 text-sm font-semibold text-black hover:bg-yellow-400 transition disabled:opacity-60"
              >
                {balSaving ? "Processing..." : "Confirm"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setBalOpen(false);
                  setBalUser(null);
                }}
                className="flex-1 rounded-lg border border-gray-800 bg-black/70 px-4 py-2.5 text-sm text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Delete modal */}
      {delOpen && delUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-800 bg-black/90 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-50">Delete user</h3>
                <p className="text-xs text-gray-400 mt-1">
                  This will remove the user and related records.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setDelOpen(false);
                  setDelUser(null);
                }}
                className="rounded-lg border border-gray-800 bg-black/70 p-2 text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 rounded-xl border border-gray-800 bg-black/60 p-3">
              <div className="text-sm font-semibold text-gray-100">{delUser.username}</div>
              <div className="text-[11px] text-gray-400">{delUser.email}</div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={confirmDelete}
                disabled={delSaving}
                className="flex-1 rounded-lg bg-red-500/20 border border-red-500/40 px-4 py-2.5 text-sm font-semibold text-red-200 hover:bg-red-500/30 transition disabled:opacity-60"
              >
                {delSaving ? "Deleting..." : "Delete"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDelOpen(false);
                  setDelUser(null);
                }}
                className="flex-1 rounded-lg border border-gray-800 bg-black/70 px-4 py-2.5 text-sm text-gray-200 hover:border-accentGold/60 hover:text-accentGold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
