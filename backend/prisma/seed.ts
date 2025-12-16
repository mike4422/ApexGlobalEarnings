import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "mikeclinton508@gmail.com";
  const passwordHash = await bcrypt.hash("AdminStrongP@ss1", 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      username: "admin", // ✅ REQUIRED by your schema
      passwordHash,
      role: UserRole.ADMIN,
      referralCode: "APEXADMIN",
      name: "Platform Admin",
    },
  });

  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, level1Bps: 500, level2Bps: 200 },
  });

  await prisma.plan.createMany({
    data: [
      {
        name: "Standard Plan",
        slug: "standard",
        minAmountCents: 200 * 100,
        maxAmountCents: 1999 * 100,
        dailyRoiBps: 5 * 100, // 5.00%
        durationDays: 5,
        isActive: true,
      },
      {
        name: "Professional Plan",
        slug: "professional",
        minAmountCents: 2000 * 100,
        maxAmountCents: 29900 * 100,
        dailyRoiBps: 15 * 100, // 15.00%
        durationDays: 5,
        isActive: true,
      },
      {
        name: "Premium Members",
        slug: "premium",
        minAmountCents: 30000 * 100,
        maxAmountCents: 300000 * 100,
        dailyRoiBps: 30 * 100, // 30.00%
        durationDays: 5,
        isActive: true,
      },
      {
        name: "VIP Members",
        slug: "vip",
        minAmountCents: 301000 * 100,
        maxAmountCents: 1000000 * 100,
        dailyRoiBps: 45 * 100, // 45.00%
        durationDays: 5,
        isActive: true,
      },
      {
        name: "Joint Portfolio",
        slug: "joint-portfolio",
        minAmountCents: 3000 * 100,
        maxAmountCents: 100000 * 100,
        dailyRoiBps: 15 * 100, // 15.00%
        durationDays: 10,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seed completed. Admin:", admin.email);
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
