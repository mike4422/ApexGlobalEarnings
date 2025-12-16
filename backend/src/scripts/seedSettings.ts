import { prisma } from "../config/prisma";

async function main() {
  await prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      level1Bps: 0,
      level2Bps: 0,
    },
  });
  console.log("Settings seeded (id=1).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
