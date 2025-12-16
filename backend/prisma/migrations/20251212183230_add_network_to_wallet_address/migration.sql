/*
  Warnings:

  - A unique constraint covering the columns `[userId,asset,network]` on the table `WalletAddress` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "WalletAddress_userId_asset_key";

-- AlterTable
ALTER TABLE "WalletAddress" ADD COLUMN     "network" "WalletNetwork";

-- CreateIndex
CREATE INDEX "WalletAddress_userId_idx" ON "WalletAddress"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WalletAddress_userId_asset_network_key" ON "WalletAddress"("userId", "asset", "network");
