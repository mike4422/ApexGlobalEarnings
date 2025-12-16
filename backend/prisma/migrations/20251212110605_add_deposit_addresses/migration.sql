-- CreateEnum
CREATE TYPE "WalletNetwork" AS ENUM ('TRC20', 'BEP20', 'ERC20');

-- CreateTable
CREATE TABLE "DepositAddress" (
    "id" SERIAL NOT NULL,
    "asset" "AssetSymbol" NOT NULL,
    "network" "WalletNetwork",
    "address" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DepositAddress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DepositAddress_asset_network_key" ON "DepositAddress"("asset", "network");
