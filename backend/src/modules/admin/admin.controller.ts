import { Request, Response } from "express";
import { prisma } from "../../config/prisma";
import { sendMail } from "../../utils/email";
import { AuthRequest } from "../../middleware/auth";
import { WalletNetwork, AssetSymbol } from "@prisma/client";

export async function listDepositRequests(req: Request, res: Response) {
  const status = (req.query.status as string) || "PENDING";

  const deposits = await prisma.transaction.findMany({
    where: {
      type: "DEPOSIT",
      status: status as any,
    },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { id: true, email: true, name: true, username: true, referralCode: true } },
    },
  });

  return res.json({
    deposits: deposits.map((d) => ({
      id: d.id,
      user: d.user,
      asset: d.asset,
      amount: d.amountCents / 100,
      status: d.status,
      reference: d.reference,
      meta: d.meta,
      createdAt: d.createdAt,
    })),
  });
}

export async function approveDepositRequest(req: Request, res: Response) {
  const id = req.params.id;

  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!tx || tx.type !== "DEPOSIT") {
    return res.status(404).json({ error: "Deposit request not found" });
  }
  if (tx.status !== "PENDING") {
    return res.status(400).json({ error: "Deposit is not pending" });
  }

  // Pull referral config (row id=1)
  const settings = await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1 },
    select: { level1Bps: true, level2Bps: true },
  });

  // Referrer (level 1) + optional level 2
  const depositor = tx.user;
  const level1ReferrerId = depositor.referredById || null;

  const level1Referrer = level1ReferrerId
    ? await prisma.user.findUnique({
        where: { id: level1ReferrerId },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          referralCode: true,
          referredById: true, // for level 2
        },
      })
    : null;

  const level2ReferrerId = level1Referrer?.referredById || null;

  const level2Referrer =
    level2ReferrerId
      ? await prisma.user.findUnique({
          where: { id: level2ReferrerId },
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            referralCode: true,
          },
        })
      : null;

  const l1AmountCents =
    level1Referrer && settings.level1Bps > 0
      ? Math.floor((tx.amountCents * settings.level1Bps) / 10000)
      : 0;

  const l2AmountCents =
    level2Referrer && settings.level2Bps > 0
      ? Math.floor((tx.amountCents * settings.level2Bps) / 10000)
      : 0;

  const ops: any[] = [
    prisma.transaction.update({
      where: { id },
      data: { status: "COMPLETED" },
    }),
    prisma.user.update({
      where: { id: tx.userId },
      data: { balanceCents: { increment: tx.amountCents } },
    }),
  ];

  // Level 1 referral earning
  if (level1Referrer && l1AmountCents > 0) {
    ops.push(
      prisma.transaction.create({
        data: {
          userId: level1Referrer.id,
          type: "REFERRAL_EARNING",
          asset: tx.asset,
          amountCents: l1AmountCents,
          status: "COMPLETED",
          reference: tx.id,
          meta: {
            level: 1,
            fromUserId: depositor.id,
            fromUsername: depositor.username,
            depositTxId: tx.id,
            depositAmountCents: tx.amountCents,
            depositAsset: tx.asset,
          },
        },
      })
    );

    ops.push(
      prisma.user.update({
        where: { id: level1Referrer.id },
        data: { balanceCents: { increment: l1AmountCents } },
      })
    );

    // Optional: store in ReferralEarning table too (keeps your schema useful)
    ops.push(
      prisma.referralEarning.create({
        data: {
          earnerId: level1Referrer.id,
          fromUserId: depositor.id,
          level: 1,
          amountCents: l1AmountCents,
          sourceInvestmentId: null,
        },
      })
    );
  }

  // Level 2 referral earning
  if (level2Referrer && l2AmountCents > 0) {
    ops.push(
      prisma.transaction.create({
        data: {
          userId: level2Referrer.id,
          type: "REFERRAL_EARNING",
          asset: tx.asset,
          amountCents: l2AmountCents,
          status: "COMPLETED",
          reference: tx.id,
          meta: {
            level: 2,
            fromUserId: depositor.id,
            fromUsername: depositor.username,
            depositTxId: tx.id,
            depositAmountCents: tx.amountCents,
            depositAsset: tx.asset,
          },
        },
      })
    );

    ops.push(
      prisma.user.update({
        where: { id: level2Referrer.id },
        data: { balanceCents: { increment: l2AmountCents } },
      })
    );

    ops.push(
      prisma.referralEarning.create({
        data: {
          earnerId: level2Referrer.id,
          fromUserId: depositor.id,
          level: 2,
          amountCents: l2AmountCents,
          sourceInvestmentId: null,
        },
      })
    );
  }

  await prisma.$transaction(ops);

  // Email depositor (do not break if SMTP fails)
  try {
    await sendMail({
      to: depositor.email,
      subject: "Deposit approved — ApexGlobalEarnings",
      html: `
        <p>Hi ${depositor.name || depositor.username || "Investor"},</p>
        <p>Your deposit request has been <strong>approved</strong>.</p>
        <p><strong>Amount:</strong> $${(tx.amountCents / 100).toLocaleString()} (${tx.asset})</p>
        <p>The funds are now available in your dashboard balance.</p>
        <p>— ApexGlobalEarnings Finance Team</p>
      `,
    });
  } catch (err) {
    console.error("User deposit approval email failed:", err);
  }

  // Email referrers (non-blocking)
  if (level1Referrer && l1AmountCents > 0) {
    try {
      await sendMail({
        to: level1Referrer.email,
        subject: "Referral commission earned — ApexGlobalEarnings",
        html: `
          <p>Hi ${level1Referrer.name || level1Referrer.username || "Partner"},</p>
          <p>A user you referred has completed a deposit and you’ve earned a referral commission.</p>
          <p><strong>Referred user:</strong> ${depositor.username} (${depositor.email})</p>
          <p><strong>Deposit:</strong> $${(tx.amountCents / 100).toLocaleString()} (${tx.asset})</p>
          <p><strong>Your Level 1 commission:</strong> $${(l1AmountCents / 100).toLocaleString()}</p>
          <p>The commission has been added to your dashboard balance.</p>
          <p>— ApexGlobalEarnings Finance Team</p>
        `,
      });
    } catch (err) {
      console.error("Level 1 referral email failed:", err);
    }
  }

  if (level2Referrer && l2AmountCents > 0) {
    try {
      await sendMail({
        to: level2Referrer.email,
        subject: "Level 2 referral commission earned — ApexGlobalEarnings",
        html: `
          <p>Hi ${level2Referrer.name || level2Referrer.username || "Partner"},</p>
          <p>A Level 2 referral in your network has completed a deposit and you’ve earned a commission.</p>
          <p><strong>Referred user:</strong> ${depositor.username} (${depositor.email})</p>
          <p><strong>Deposit:</strong> $${(tx.amountCents / 100).toLocaleString()} (${tx.asset})</p>
          <p><strong>Your Level 2 commission:</strong> $${(l2AmountCents / 100).toLocaleString()}</p>
          <p>The commission has been added to your dashboard balance.</p>
          <p>— ApexGlobalEarnings Finance Team</p>
        `,
      });
    } catch (err) {
      console.error("Level 2 referral email failed:", err);
    }
  }

  return res.json({ message: "Deposit approved" });
}


export async function rejectDepositRequest(req: Request, res: Response) {
  const id = req.params.id;
  const { reason } = req.body as { reason?: string };

  const tx = await prisma.transaction.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!tx || tx.type !== "DEPOSIT") {
    return res.status(404).json({ error: "Deposit request not found" });
  }
  if (tx.status !== "PENDING") {
    return res.status(400).json({ error: "Deposit is not pending" });
  }

  await prisma.transaction.update({
    where: { id },
    data: {
      status: "FAILED",
      meta: {
        ...(typeof tx.meta === "object" && tx.meta ? (tx.meta as any) : {}),
        rejectReason: reason || "Deposit rejected by admin",
      },
    },
  });

  // Email user (do not break if SMTP fails)
  try {
    await sendMail({
      to: tx.user.email,
      subject: "Deposit rejected — ApexGlobalEarnings",
      html: `
        <p>Hi ${tx.user.name || tx.user.username || "Investor"},</p>
        <p>Your deposit request has been <strong>rejected</strong>.</p>
        <p><strong>Amount:</strong> $${(tx.amountCents / 100).toLocaleString()} (${tx.asset})</p>
        <p><strong>Reason:</strong> ${reason || "Deposit rejected by admin"}</p>
        <p>If you believe this is incorrect, please contact support.</p>
        <p>— ApexGlobalEarnings Finance Team</p>
      `,
    });
  } catch (err) {
    console.error("User deposit rejection email failed:", err);
  }

  return res.json({ message: "Deposit rejected" });
}


export async function getPlatformSettings(req: AuthRequest, res: Response) {
  try {
    // Always work with row id=1
    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {},
      create: { id: 1 },
    });

    return res.json({ settings });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export async function updatePlatformSettings(req: AuthRequest, res: Response) {
  try {
    const {
      btcDepositAddress,
      ethDepositAddress,
      usdtTrc20DepositAddress,
      usdtBep20DepositAddress,
      usdtErc20DepositAddress,
      level1Bps,
      level2Bps,
    } = req.body || {};

    const clean = (v: any) => {
      if (v === null) return null;
      if (typeof v !== "string") return undefined;
      const t = v.trim();
      return t.length ? t : null; // empty string clears
    };

    const n = (v: any) => {
      if (v === undefined) return undefined;
      const num = Number(v);
      if (Number.isNaN(num)) return undefined;
      return Math.max(0, Math.floor(num));
    };

    const settings = await prisma.settings.upsert({
      where: { id: 1 },
      update: {
        btcDepositAddress: clean(btcDepositAddress),
        ethDepositAddress: clean(ethDepositAddress),
        usdtTrc20DepositAddress: clean(usdtTrc20DepositAddress),
        usdtBep20DepositAddress: clean(usdtBep20DepositAddress),
        usdtErc20DepositAddress: clean(usdtErc20DepositAddress),
        ...(level1Bps !== undefined ? { level1Bps: n(level1Bps) } : {}),
        ...(level2Bps !== undefined ? { level2Bps: n(level2Bps) } : {}),
      },
      create: {
        id: 1,
        btcDepositAddress: clean(btcDepositAddress) ?? null,
        ethDepositAddress: clean(ethDepositAddress) ?? null,
        usdtTrc20DepositAddress: clean(usdtTrc20DepositAddress) ?? null,
        usdtBep20DepositAddress: clean(usdtBep20DepositAddress) ?? null,
        usdtErc20DepositAddress: clean(usdtErc20DepositAddress) ?? null,
        level1Bps: n(level1Bps) ?? 0,
        level2Bps: n(level2Bps) ?? 0,
      },
    });

    return res.json({ message: "Settings updated", settings });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
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

export async function listWithdrawalRequests(req: Request, res: Response) {
  const status = (req.query.status as string) || "PENDING";

  const withdrawals = await prisma.withdrawal.findMany({
    where: { status: status as any },
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          referralCode: true,
          referredBy: { select: { id: true, username: true, referralCode: true, email: true, name: true } },
        },
      },
      reviewedBy: { select: { id: true, email: true, username: true, name: true } },
    },
  });

  return res.json({
    withdrawals: withdrawals.map((w) => {
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
        user: w.user,
        reviewedBy: w.reviewedBy,
      };
    }),
  });
}

export async function approveWithdrawalRequest(req: AuthRequest, res: Response) {
  const id = req.params.id;

  const w = await prisma.withdrawal.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!w) return res.status(404).json({ error: "Withdrawal request not found" });
  if (w.status !== "PENDING") return res.status(400).json({ error: "Withdrawal is not pending" });

  // Decrement balance + mark approved
  await prisma.$transaction(async (tx) => {
    await tx.withdrawal.update({
      where: { id },
      data: {
        status: "APPROVED" as any,
        reviewedAt: new Date(),
        reviewedById: req.user!.id,
      },
    });

    await tx.user.update({
      where: { id: w.userId },
      data: { balanceCents: { decrement: w.amountCents } },
    });
  });

  // Email user (non-blocking)
  try {
    const { network, address } = splitTargetAddress(w.asset as any, w.targetAddress);
    await sendMail({
      to: w.user.email,
      subject: "Withdrawal approved — ApexGlobalEarnings",
      html: `
        <p>Hi ${w.user.name || w.user.username || "Investor"},</p>
        <p>Your withdrawal request has been <strong>approved</strong>.</p>
        <p><strong>Amount:</strong> $${(w.amountCents / 100).toLocaleString()} (${w.asset}${network ? ` / ${network}` : ""})</p>
        <p><strong>Destination:</strong> ${address}</p>
        <p>If you have any questions, please contact support.</p>
        <p>— ApexGlobalEarnings Finance Team</p>
      `,
    });
  } catch (err) {
    console.error("User withdrawal approval email failed:", err);
  }

  return res.json({ message: "Withdrawal approved" });
}

export async function rejectWithdrawalRequest(req: AuthRequest, res: Response) {
  const id = req.params.id;
  const { reason } = req.body as { reason?: string };

  const w = await prisma.withdrawal.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!w) return res.status(404).json({ error: "Withdrawal request not found" });
  if (w.status !== "PENDING") return res.status(400).json({ error: "Withdrawal is not pending" });

  await prisma.withdrawal.update({
    where: { id },
    data: {
      status: "REJECTED" as any,
      reviewedAt: new Date(),
      reviewedById: req.user!.id,
    },
  });

  // Email user (non-blocking)
  try {
    const { network, address } = splitTargetAddress(w.asset as any, w.targetAddress);
    await sendMail({
      to: w.user.email,
      subject: "Withdrawal rejected — ApexGlobalEarnings",
      html: `
        <p>Hi ${w.user.name || w.user.username || "Investor"},</p>
        <p>Your withdrawal request has been <strong>rejected</strong>.</p>
        <p><strong>Amount:</strong> $${(w.amountCents / 100).toLocaleString()} (${w.asset}${network ? ` / ${network}` : ""})</p>
        <p><strong>Destination:</strong> ${address}</p>
        <p><strong>Reason:</strong> ${reason || "Withdrawal rejected by admin"}</p>
        <p>If you believe this is incorrect, please contact support.</p>
        <p>— ApexGlobalEarnings Finance Team</p>
      `,
    });
  } catch (err) {
    console.error("User withdrawal rejection email failed:", err);
  }

  return res.json({ message: "Withdrawal rejected" });
}



export async function sendUserNotification(req: AuthRequest, res: Response) {
  try {
    const { userId, username, email, title, message, data } = req.body || {};

    if (!title || !message) {
      return res.status(400).json({ error: "title and message are required" });
    }

    let targetUser = null as any;

    if (userId) {
      targetUser = await prisma.user.findUnique({ where: { id: String(userId) } });
    } else if (username) {
      targetUser = await prisma.user.findUnique({ where: { username: String(username) } });
    } else if (email) {
      targetUser = await prisma.user.findUnique({ where: { email: String(email) } });
    } else {
      return res.status(400).json({ error: "Provide userId or username or email" });
    }

    if (!targetUser) {
      return res.status(404).json({ error: "Target user not found" });
    }

    const n = await prisma.notification.create({
      data: {
        userId: targetUser.id,
        createdById: req.user!.id,
        title: String(title),
        message: String(message),
        data: data ?? null,
      },
      select: {
        id: true,
        userId: true,
        title: true,
        message: true,
        isRead: true,
        createdAt: true,
      },
    });

    return res.json({ message: "Notification sent", notification: n });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "Internal server error" });
  }
}



// ✅ ADMIN: list users + wallets
export async function adminListUsers(req: AuthRequest, res: Response) {
  try {
    const search = String(req.query.search || "").trim();

    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { username: { contains: search, mode: "insensitive" } },
              { name: { contains: search, mode: "insensitive" } },
              { referralCode: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      take: 300,
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        referralCode: true,
        balanceCents: true,
        createdAt: true,
        walletAddresses: {
          select: { asset: true, network: true, address: true },
        },
      },
    });

    const mapped = users.map((u) => {
      const btc = u.walletAddresses.find((w) => w.asset === "BTC" && w.network === null)?.address ?? null;
      const eth = u.walletAddresses.find((w) => w.asset === "ETH" && w.network === null)?.address ?? null;

      const usdtTrc20 = u.walletAddresses.find((w) => w.asset === "USDT" && w.network === "TRC20")?.address ?? null;
      const usdtBep20 = u.walletAddresses.find((w) => w.asset === "USDT" && w.network === "BEP20")?.address ?? null;
      const usdtErc20 = u.walletAddresses.find((w) => w.asset === "USDT" && w.network === "ERC20")?.address ?? null;

      return {
        id: u.id,
        email: u.email,
        name: u.name,
        username: u.username,
        role: u.role,
        referralCode: u.referralCode,
        balance: u.balanceCents / 100,
        createdAt: u.createdAt,

        btcWallet: btc,
        ethWallet: eth,
        usdtTrc20Wallet: usdtTrc20,
        usdtBep20Wallet: usdtBep20,
        usdtErc20Wallet: usdtErc20,
      };
    });

    return res.json({ users: mapped });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message || "Failed to load users" });
  }
}

// helpers to update walletAddresses safely
async function setWalletAddress(
  userId: string,
  asset: AssetSymbol,
  network: WalletNetwork | null,
  addressRaw: any
) {
  const address =
    typeof addressRaw === "string" ? addressRaw.trim() : "";

  // If empty -> remove existing rows for that key
  if (!address) {
    await prisma.walletAddress.deleteMany({
      where: { userId, asset, network },
    });
    return;
  }

  if (network === null) {
    // ⚠️ network is nullable, unique in Postgres allows multiple NULLs, so do "findFirst then update/create"
    const existing = await prisma.walletAddress.findFirst({
      where: { userId, asset, network: null },
      select: { id: true },
    });

    if (existing) {
      await prisma.walletAddress.update({
        where: { id: existing.id },
        data: { address },
      });
    } else {
      await prisma.walletAddress.create({
        data: { userId, asset, network: null, address },
      });
    }
    return;
  }

  // network != null -> unique combo is reliable
  const existing = await prisma.walletAddress.findUnique({
    where: {
      userId_asset_network: { userId, asset, network },
    },
    select: { id: true },
  });

  if (existing) {
    await prisma.walletAddress.update({
      where: { id: existing.id },
      data: { address },
    });
  } else {
    await prisma.walletAddress.create({
      data: { userId, asset, network, address },
    });
  }
}

// ✅ ADMIN: update user info + wallets + optional password
export async function adminUpdateUser(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);

    const {
      name,
      username,
      email,
      password,

      btcWallet,
      ethWallet,

      usdtTrc20Wallet,
      usdtBep20Wallet,
      usdtErc20Wallet,
    } = req.body || {};

    const data: any = {};
    if (typeof name === "string") data.name = name.trim();
    if (typeof username === "string") data.username = username.trim();
    if (typeof email === "string") data.email = email.trim().toLowerCase();

    if (typeof password === "string" && password.trim().length > 0) {
      if (password.trim().length < 8) {
        return res.status(400).json({ error: "Password must be at least 8 characters." });
      }
      data.passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const u = await tx.user.update({
        where: { id },
        data,
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          role: true,
          referralCode: true,
          balanceCents: true,
          createdAt: true,
        },
      });

      // wallets
      await setWalletAddress(id, "BTC", null, btcWallet);
      await setWalletAddress(id, "ETH", null, ethWallet);

      await setWalletAddress(id, "USDT", "TRC20", usdtTrc20Wallet);
      await setWalletAddress(id, "USDT", "BEP20", usdtBep20Wallet);
      await setWalletAddress(id, "USDT", "ERC20", usdtErc20Wallet);

      // notify user (quiet, normal)
      await tx.notification.create({
        data: {
          userId: id,
          createdById: req.user!.id,
          title: "Account updated",
          message: "Your profile information was updated by support.",
          data: { source: "admin_users" },
        },
      });

      return u;
    });

    return res.json({
      user: {
        ...updated,
        balance: updated.balanceCents / 100,
      },
    });
  } catch (e: any) {
    console.error(e);

    // Prisma unique constraint error
    if (e?.code === "P2002") {
      const target = Array.isArray(e?.meta?.target) ? e.meta.target.join(", ") : "field";
      return res.status(400).json({ error: `A user already exists with the same ${target}.` });
    }

    return res.status(500).json({ error: e.message || "Failed to update user" });
  }
}

// ✅ ADMIN: delete user (safe cleanup)
export async function adminDeleteUser(req: AuthRequest, res: Response) {
  try {
    const id = String(req.params.id);

    // prevent deleting self (common safety)
    if (req.user?.id === id) {
      return res.status(400).json({ error: "You cannot delete your own admin account." });
    }

    await prisma.$transaction(async (tx) => {
      // unlink referrals
      await tx.user.updateMany({
        where: { referredById: id },
        data: { referredById: null },
      });

      // clean relations
      await tx.session.deleteMany({ where: { userId: id } });
      await tx.walletAddress.deleteMany({ where: { userId: id } });

      await tx.investment.deleteMany({ where: { userId: id } });
      await tx.transaction.deleteMany({ where: { userId: id } });

      await tx.withdrawal.updateMany({
        where: { reviewedById: id },
        data: { reviewedById: null },
      });
      await tx.withdrawal.deleteMany({ where: { userId: id } });

      await tx.referralEarning.deleteMany({
        where: { OR: [{ earnerId: id }, { fromUserId: id }] },
      });

      await tx.notification.deleteMany({
        where: { OR: [{ userId: id }, { createdById: id }] },
      });

      await tx.user.delete({ where: { id } });
    });

    return res.json({ ok: true });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message || "Failed to delete user" });
  }
}

// ✅ ADMIN: fund / withdraw user balance + send email + create notification + create transaction record
export async function adminAdjustUserBalance(req: AuthRequest, res: Response) {
  try {
    const userId = String(req.params.id);
    const { action, amount } = req.body || {};

    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    if (action !== "DEPOSIT" && action !== "WITHDRAW") {
      return res.status(400).json({ error: "Invalid action" });
    }

    const amountCents = Math.round(amt * 100);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, username: true, balanceCents: true },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const next =
      action === "DEPOSIT"
        ? user.balanceCents + amountCents
        : user.balanceCents - amountCents;

    if (next < 0) return res.status(400).json({ error: "Insufficient balance" });

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { balanceCents: next },
      });

      // Record a normal transaction entry (asset USDT == USD-equivalent in your symbols)
      await tx.transaction.create({
        data: {
          userId,
          type: action === "DEPOSIT" ? "DEPOSIT" : "WITHDRAWAL",
          asset: "USDT",
          amountCents,
          status: "COMPLETED",
          reference: "ADMIN_ADJUSTMENT",
          meta: {
            source: "admin",
            adminId: req.user!.id,
          },
        },
      });

      // Notification for Topbar unread count
      const title = action === "DEPOSIT" ? "Deposit confirmed" : "Withdrawal processed";
      const message =
        action === "DEPOSIT"
          ? `Your account has been credited with $${(amountCents / 100).toLocaleString()}.`
          : `A withdrawal of $${(amountCents / 100).toLocaleString()} has been processed from your account.`;

      await tx.notification.create({
        data: {
          userId,
          createdById: req.user!.id,
          title,
          message,
          data: { source: "admin_balance" },
        },
      });
    });

    // Email (non-blocking)
    try {
      const title = action === "DEPOSIT" ? "Deposit confirmation" : "Withdrawal confirmation";
      const textLine =
        action === "DEPOSIT"
          ? `Your account has been credited with $${(amountCents / 100).toLocaleString()}.`
          : `A withdrawal of $${(amountCents / 100).toLocaleString()} has been processed from your account.`;

      await sendMail({
        to: user.email,
        subject: `${title} — ApexGlobalEarnings`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height:1.6; color:#111;">
            <h2 style="margin:0 0 12px;">${title}</h2>
            <p style="margin:0 0 10px;">Hi ${user.name || user.username || "Investor"},</p>
            <p style="margin:0 0 10px;">${textLine}</p>
            <p style="margin:14px 0 0; font-size:12px; color:#555;">
              If you have any questions, please contact support from your dashboard.
            </p>
            <p style="margin:10px 0 0;">— ApexGlobalEarnings Finance Team</p>
          </div>
        `,
      });
    } catch (err) {
      console.error("Balance email failed:", err);
    }

    return res.json({ message: "Balance updated" });
  } catch (e: any) {
    console.error(e);
    return res.status(500).json({ error: e.message || "Failed to update balance" });
  }
}
