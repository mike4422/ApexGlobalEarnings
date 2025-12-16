import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth";
import { env } from "../../config/env";
import { sendMail } from "../../utils/email";
import { WalletNetwork, AssetSymbol } from "@prisma/client";
import { Request } from "express";

function cents(n: number) {
  return Math.round(n * 100);
}

export async function listMyDeposits(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const deposits = await prisma.transaction.findMany({
      where: { userId, type: "DEPOSIT" },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        asset: true,
        amountCents: true,
        status: true,
        reference: true,
        meta: true,
        createdAt: true,
      },
    });

    return res.json({
      deposits: deposits.map((d) => ({
        ...d,
        amount: d.amountCents / 100,
      })),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function createDepositRequest(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;
    const { asset, amount, reference, note } = req.body as {
      asset: "BTC" | "ETH" | "USDT";
      amount: number; // USD
      reference?: string;
      note?: string;
    };

    if (!asset || !amount || Number(amount) <= 0) {
      return res.status(400).json({ error: "Asset and amount are required" });
    }

    if (!["BTC", "ETH", "USDT"].includes(asset)) {
      return res.status(400).json({ error: "Unsupported asset" });
    }

    const amountCents = cents(Number(amount));

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        referralCode: true,
        referredById: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const referrer = user.referredById
      ? await prisma.user.findUnique({
          where: { id: user.referredById },
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            referralCode: true,
          },
        })
      : null;

    const tx = await prisma.transaction.create({
      data: {
        userId,
        type: "DEPOSIT",
        asset,
        amountCents,
        status: "PENDING",
        reference: reference || null,
        meta: {
          note: note || null,
          referrer: referrer
            ? {
                id: referrer.id,
                email: referrer.email,
                name: referrer.name,
                username: referrer.username,
                referralCode: referrer.referralCode,
              }
            : null,
        },
      },
      select: {
        id: true,
        asset: true,
        amountCents: true,
        status: true,
        reference: true,
        createdAt: true,
      },
    });

    // Email admin(s) (do not break if SMTP fails)
    // Prefer DB admins; fallback to env.ADMIN_EMAIL
    const dbAdmins = await prisma.user.findMany({
      where: { role: "ADMIN" as any },
      select: { email: true },
      take: 20,
    });

    const fallback = (env as any).ADMIN_EMAIL;
    const adminRecipients = Array.from(
      new Set(
        [
          ...dbAdmins.map((a) => a.email).filter(Boolean),
          typeof fallback === "string" && fallback.trim() ? fallback.trim() : null,
        ].filter(Boolean) as string[]
      )
    );

    if (adminRecipients.length === 0) {
      console.warn(
        "[Deposit email] No admin recipients found. Set ADMIN_EMAIL or create an ADMIN user."
      );
    } else {
      try {
        await sendMail({
          to: adminRecipients.join(","),
          subject: "New deposit request — ApexGlobalEarnings",
          html: `
            <p><strong>New Deposit Request</strong></p>
            <p><strong>User:</strong> ${user.name || user.username} (${user.email})</p>
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Amount:</strong> $${(amountCents / 100).toLocaleString()} <strong>(${asset})</strong></p>
            <p><strong>Reference/Tx:</strong> ${reference || "N/A"}</p>
            <p><strong>User referralCode:</strong> ${user.referralCode}</p>
            <p><strong>Referred by (username):</strong> ${
              referrer ? `${referrer.username} (code: ${referrer.referralCode})` : "None"
            }</p>
            <p><strong>Request ID:</strong> ${tx.id}</p>
            <p style="color:#6b7280;font-size:12px;">Approve or reject in the Admin Dashboard.</p>
          `,
        });

        console.log("[Deposit email] Sent to:", adminRecipients);
      } catch (err) {
        console.error("Admin deposit email failed:", err);
      }
    }

    return res.status(201).json({
      deposit: {
        ...tx,
        amount: tx.amountCents / 100,
      },
      message: "Deposit request submitted and pending review.",
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function getDepositAddresses(req: AuthRequest, res: Response) {
  try {
    // always use row id=1
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });

    return res.json({
      addresses: {
        BTC: settings.btcDepositAddress,
        ETH: settings.ethDepositAddress,
        USDT_TRC20: settings.usdtTrc20DepositAddress,
        USDT_BEP20: settings.usdtBep20DepositAddress,
        USDT_ERC20: settings.usdtErc20DepositAddress,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Unable to load deposit addresses" });
  }
}

function cleanAddress(v: any) {
  if (v === null) return null;
  if (typeof v !== "string") return undefined;
  const t = v.trim();
  return t.length ? t : null; // empty string clears
}

// ✅ change: accept tx client so it can run inside prisma.$transaction(async tx => ...)
async function upsertWalletRow(
  db: typeof prisma,
  args: {
    userId: string;
    asset: AssetSymbol;
    network: WalletNetwork | null;
    address: string | null | undefined;
  }
) {
  const { userId, asset, network, address } = args;

  // ignore undefined (not provided)
  if (address === undefined) return;

  const where = {
    userId,
    asset,
    ...(network === null ? { network: null } : { network }),
  };

  // delete if null (clear)
  if (address === null) {
    await db.walletAddress.deleteMany({ where });
    return;
  }

  // cannot rely on compound upsert with nullable network
  const existing = await db.walletAddress.findFirst({
    where,
    select: { id: true },
  });

  if (existing) {
    await db.walletAddress.update({
      where: { id: existing.id },
      data: { address },
    });
  } else {
    await db.walletAddress.create({
      data: {
        userId,
        asset,
        ...(network === null ? {} : { network }),
        address,
      },
    });
  }
}

function rowsToWalletsDTO(rows: { asset: AssetSymbol; network: WalletNetwork | null; address: string }[]) {
  const wallets = {
    BTC: null as string | null,
    ETH: null as string | null,
    USDT_TRC20: null as string | null,
    USDT_BEP20: null as string | null,
    USDT_ERC20: null as string | null,
  };

  for (const r of rows) {
    if (r.asset === "BTC") wallets.BTC = r.address;
    if (r.asset === "ETH") wallets.ETH = r.address;
    if (r.asset === "USDT") {
      if (r.network === "TRC20") wallets.USDT_TRC20 = r.address;
      if (r.network === "BEP20") wallets.USDT_BEP20 = r.address;
      if (r.network === "ERC20") wallets.USDT_ERC20 = r.address;
    }
  }

  return wallets;
}

// GET /api/wallet/addresses
export async function getMyWalletAddresses(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const rows = await prisma.walletAddress.findMany({
      where: { userId },
      select: { asset: true, network: true, address: true, createdAt: true },
      orderBy: { asset: "asc" },
    });

    rows.sort(
      (a, b) =>
        String(a.asset).localeCompare(String(b.asset)) ||
        String(a.network ?? "").localeCompare(String(b.network ?? ""))
    );

    return res.json({
      wallets: rowsToWalletsDTO(
        rows.map((r) => ({
          asset: r.asset,
          network: (r.network ?? null) as any,
          address: r.address,
        }))
      ),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Unable to load wallet addresses" });
  }
}

// PUT /api/wallet/addresses
export async function upsertMyWalletAddresses(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    // accept BOTH naming styles (old/new) so frontend won’t break
    const btcAddress = req.body?.btcAddress ?? req.body?.btc;
    const ethAddress = req.body?.ethAddress ?? req.body?.eth;
    const usdtTrc20Address = req.body?.usdtTrc20Address ?? req.body?.usdt_trc20;
    const usdtBep20Address = req.body?.usdtBep20Address ?? req.body?.usdt_bep20;
    const usdtErc20Address = req.body?.usdtErc20Address ?? req.body?.usdt_erc20;

    const btc = cleanAddress(btcAddress);
    const eth = cleanAddress(ethAddress);
    const uTrc = cleanAddress(usdtTrc20Address);
    const uBep = cleanAddress(usdtBep20Address);
    const uErc = cleanAddress(usdtErc20Address);

    // ✅ FIX: interactive transaction (prevents "updated but 500")
    await prisma.$transaction(async (tx) => {
      await upsertWalletRow(tx as any, { userId, asset: "BTC", network: null, address: btc });
      await upsertWalletRow(tx as any, { userId, asset: "ETH", network: null, address: eth });
      await upsertWalletRow(tx as any, { userId, asset: "USDT", network: "TRC20", address: uTrc });
      await upsertWalletRow(tx as any, { userId, asset: "USDT", network: "BEP20", address: uBep });
      await upsertWalletRow(tx as any, { userId, asset: "USDT", network: "ERC20", address: uErc });
    });

    const rows = await prisma.walletAddress.findMany({
      where: { userId },
      select: { asset: true, network: true, address: true },
      orderBy: { asset: "asc" },
    });

    rows.sort(
      (a, b) =>
        String(a.asset).localeCompare(String(b.asset)) ||
        String(a.network ?? "").localeCompare(String(b.network ?? ""))
    );

    return res.json({
      message: "Wallet addresses updated",
      wallets: rowsToWalletsDTO(
        rows.map((r) => ({
          asset: r.asset,
          network: (r.network ?? null) as any,
          address: r.address,
        }))
      ),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Unable to update wallet addresses" });
  }
}


// Transactions backend code

function splitTargetAddressForUser(asset: any, targetAddress: string) {
  if (asset === "USDT" && typeof targetAddress === "string") {
    const idx = targetAddress.indexOf(":");
    if (idx > 0) {
      const maybeNet = targetAddress.slice(0, idx).toUpperCase();
      const addr = targetAddress.slice(idx + 1);
      if (maybeNet === "TRC20" || maybeNet === "BEP20" || maybeNet === "ERC20") {
        return { network: maybeNet, address: addr };
      }
    }
  }
  return { network: null as string | null, address: targetAddress };
}

export async function listMyTransactions(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    // Optional query filters (safe defaults)
    const qType = typeof (req as Request).query.type === "string" ? String((req as Request).query.type) : "";
    const qStatus = typeof (req as Request).query.status === "string" ? String((req as Request).query.status) : "";
    const qAsset = typeof (req as Request).query.asset === "string" ? String((req as Request).query.asset) : "";
    const take = Math.min(
      500,
      Math.max(20, Number((req as Request).query.take || 200))
    );

    // 1) Transaction table
    const txRows = await prisma.transaction.findMany({
      where: {
        userId,
        ...(qType ? { type: qType as any } : {}),
        ...(qStatus ? { status: qStatus as any } : {}),
        ...(qAsset ? { asset: qAsset as any } : {}),
      },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        type: true,
        asset: true,
        amountCents: true,
        status: true,
        reference: true,
        meta: true,
        createdAt: true,
      },
    });

    // 2) Withdrawal table (always include; user wants “all transactions”)
    const wRows = await prisma.withdrawal.findMany({
      where: {
        userId,
        ...(qAsset ? { asset: qAsset as any } : {}),
        ...(qStatus ? { status: qStatus as any } : {}),
      },
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        asset: true,
        amountCents: true,
        status: true,
        targetAddress: true,
        createdAt: true,
      },
    });

    const unified = [
      ...txRows.map((t) => ({
        id: t.id,
        kind: "TRANSACTION" as const,
        type: t.type,
        asset: t.asset,
        network: null as string | null,
        amount: t.amountCents / 100,
        status: t.status,
        reference: t.reference,
        meta: t.meta,
        createdAt: t.createdAt,
      })),
      ...wRows.map((w) => {
        const { network, address } = splitTargetAddressForUser(w.asset as any, w.targetAddress);
        return {
          id: w.id,
          kind: "WITHDRAWAL" as const,
          type: "WITHDRAWAL",
          asset: w.asset,
          network,
          amount: w.amountCents / 100,
          status: w.status,
          reference: null as string | null,
          meta: { targetAddress: address },
          createdAt: w.createdAt,
        };
      }),
    ];

    unified.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));

    return res.json({
      transactions: unified.slice(0, take),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Unable to load transactions" });
  }
}