/*
  Warnings:

  - Added the required column `updatedAt` to the `Settings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "level1Bps" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "level2Bps" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "btcDepositAddress" SET DATA TYPE TEXT,
ALTER COLUMN "ethDepositAddress" SET DATA TYPE TEXT,
ALTER COLUMN "usdtTrc20DepositAddress" SET DATA TYPE TEXT,
ALTER COLUMN "usdtBep20DepositAddress" SET DATA TYPE TEXT,
ALTER COLUMN "usdtErc20DepositAddress" SET DATA TYPE TEXT;
