import { prisma } from "../config/prisma";

function getArg(name: string) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=").trim() : undefined;
}

async function main() {
  const email = getArg("email") || process.argv[2];

  if (!email) {
    console.error("Usage: npx ts-node scripts/makeAdmin.ts --email=user@example.com");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error("User not found:", email);
    process.exit(1);
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" as any },
    select: { id: true, email: true, role: true, username: true, name: true },
  });

  console.log("✅ Updated user to ADMIN:", updated);
}

main()
  .catch((e) => {
    console.error("❌ Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
