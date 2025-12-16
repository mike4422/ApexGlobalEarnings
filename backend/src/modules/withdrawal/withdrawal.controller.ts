import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth";
import { env } from "../../config/env";
import { sendMail } from "../../utils/email";
import { AssetSymbol, WalletNetwork } from "@prisma/client";

function cents(n: number) {
  return Math.round(Number(n) * 100);
}

function parseNetwork(v: any): WalletNetwork | null | undefined {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v !== "string") return undefined;
  const t = v.trim().toUpperCase();
  if (t === "TRC20") return "TRC20";
  if (t === "BEP20") return "BEP20";
  if (t === "ERC20") return "ERC20";
  return undefined;
}

function splitTargetAddress(asset: AssetSymbol, targetAddress: string) {
  if (asset === "USDT" && typeof targetAddress === "string") {
    const idx = targetAddress.indexOf(":");
    if (idx > 0) {
      const maybeNet = targetAddress.slice(0, idx).toUpperCase();
      const addr = targetAddress.slice(idx + 1);
      if (maybeNet === "TRC20" || maybeNet === "BEP20" || maybeNet === "ERC20") {
        return { network: maybeNet as WalletNetwork, address: addr };
      }
    }
  }
  return { network: null as WalletNetwork | null, address: targetAddress };
}

async function getAdminRecipients(): Promise<string[]> {
  const dbAdmins = await prisma.user.findMany({
    where: { role: "ADMIN" as any },
    select: { email: true },
    take: 50,
  });

  const fallback = (env as any).ADMIN_EMAIL;
  const recipients = Array.from(
    new Set(
      [
        ...dbAdmins.map((a) => a.email).filter(Boolean),
        typeof fallback === "string" && fallback.trim() ? fallback.trim() : null,
      ].filter(Boolean) as string[]
    )
  );

  return recipients;
}

// GET /api/withdrawals/summary
export async function getWithdrawSummary(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balanceCents: true },
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    const pendingAgg = await prisma.withdrawal.aggregate({
      where: { userId, status: "PENDING" as any },
      _sum: { amountCents: true },
    });

    const pendingCents = pendingAgg._sum.amountCents || 0;
    const availableCents = Math.max(0, user.balanceCents - pendingCents);

    return res.json({
      balance: user.balanceCents / 100,
      pending: pendingCents / 100,
      available: availableCents / 100,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Unable to load withdrawal summary" });
  }
}

// GET /api/withdrawals/my
export async function listMyWithdrawals(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const rows = await prisma.withdrawal.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: {
        id: true,
        asset: true,
        amountCents: true,
        status: true,
        targetAddress: true,
        createdAt: true,
        reviewedAt: true,
      },
    });

    return res.json({
      withdrawals: rows.map((w) => {
        const { network, address } = splitTargetAddress(w.asset, w.targetAddress);
        return {
          id: w.id,
          asset: w.asset,
          network,
          targetAddress: address,
          amount: w.amountCents / 100,
          status: w.status,
          createdAt: w.createdAt,
          reviewedAt: w.reviewedAt,
        };
      }),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Unable to load withdrawals" });
  }
}

// POST /api/withdrawals
export async function createWithdrawalRequest(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.id;

    const { asset, amount, network } = req.body as {
      asset: AssetSymbol;
      amount: number; // USD
      network?: WalletNetwork | string | null;
    };

    if (!asset || amount === undefined || amount === null || Number(amount) <= 0) {
      return res.status(400).json({ error: "Asset and amount are required" });
    }

    if (!["BTC", "ETH", "USDT"].includes(String(asset))) {
      return res.status(400).json({ error: "Unsupported asset" });
    }

    const amountCents = cents(amount);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        referralCode: true,
        referredById: true,
        balanceCents: true,
        referredBy: { select: { id: true, username: true, referralCode: true, email: true, name: true } },
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    // available = balance - pending withdrawals
    const pendingAgg = await prisma.withdrawal.aggregate({
      where: { userId, status: "PENDING" as any },
      _sum: { amountCents: true },
    });
    const pendingCents = pendingAgg._sum.amountCents || 0;
    const availableCents = Math.max(0, user.balanceCents - pendingCents);

    if (amountCents > availableCents) {
      return res.status(400).json({
        error: `Insufficient available balance. Available: $${(availableCents / 100).toLocaleString()}`,
      });
    }

    // resolve withdrawal address from WalletAddress
    const assetSymbol = asset as AssetSymbol;

    let requiredNetwork: WalletNetwork | null = null;

    if (assetSymbol === "USDT") {
      const parsed = parseNetwork(network);
      if (!parsed) {
        return res.status(400).json({ error: "USDT network is required (TRC20/BEP20/ERC20)" });
      }
      requiredNetwork = parsed;
    }

    const walletRow = await prisma.walletAddress.findFirst({
      where: {
        userId,
        asset: assetSymbol,
        ...(requiredNetwork === null ? { network: null } : { network: requiredNetwork }),
      },
      select: { address: true },
    });

    if (!walletRow?.address) {
      return res.status(400).json({
        error:
          assetSymbol === "USDT"
            ? `No saved USDT (${requiredNetwork}) address. Please add it in Wallet settings.`
            : `No saved ${assetSymbol} address. Please add it in Wallet settings.`,
      });
    }

    const targetAddress =
      assetSymbol === "USDT" && requiredNetwork
        ? `${requiredNetwork}:${walletRow.address}`
        : walletRow.address;

    const w = await prisma.withdrawal.create({
      data: {
        userId,
        asset: assetSymbol,
        amountCents,
        status: "PENDING" as any,
        targetAddress,
      },
      select: {
        id: true,
        asset: true,
        amountCents: true,
        status: true,
        targetAddress: true,
        createdAt: true,
      },
    });

    // Email admins (non-blocking)
    const adminRecipients = await getAdminRecipients();
    if (adminRecipients.length === 0) {
      console.warn("[Withdrawal email] No admin recipients found. Set ADMIN_EMAIL or create an ADMIN user.");
    } else {
      const ref = user.referredBy
        ? `${user.referredBy.name || user.referredBy.username} (@${user.referredBy.username}, code: ${user.referredBy.referralCode})`
        : "None";

      const { network: n, address: addr } = splitTargetAddress(w.asset, w.targetAddress);

      try {
        await sendMail({
          to: adminRecipients.join(","),
          subject: "New withdrawal request — ApexGlobalEarnings",
          html: `
            <p><strong>New Withdrawal Request</strong></p>
            <p><strong>User:</strong> ${user.name || user.username} (${user.email})</p>
            <p><strong>Username:</strong> ${user.username}</p>
            <p><strong>Amount:</strong> $${(w.amountCents / 100).toLocaleString()} <strong>(${w.asset}${n ? ` / ${n}` : ""})</strong></p>
            <p><strong>Destination:</strong> ${addr}</p>
            <p><strong>User referralCode:</strong> ${user.referralCode}</p>
            <p><strong>Referred by:</strong> ${ref}</p>
            <p><strong>Request ID:</strong> ${w.id}</p>
            <p style="color:#6b7280;font-size:12px;">Approve or reject in the Admin Dashboard.</p>
          `,
        });
      } catch (err) {
        console.error("Admin withdrawal email failed:", err);
      }
    }

    const { network: outNet, address: outAddr } = splitTargetAddress(w.asset, w.targetAddress);

    return res.status(201).json({
      message: "Withdrawal request submitted and pending review.",
      withdrawal: {
        id: w.id,
        asset: w.asset,
        network: outNet,
        targetAddress: outAddr,
        amount: w.amountCents / 100,
        status: w.status,
        createdAt: w.createdAt,
      },
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Unable to submit withdrawal request" });
  }
}
