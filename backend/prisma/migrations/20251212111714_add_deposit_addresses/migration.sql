-- CreateTable
CREATE TABLE "Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "btcDepositAddress" VARCHAR(255),
    "ethDepositAddress" VARCHAR(255),
    "usdtTrc20DepositAddress" VARCHAR(255),
    "usdtBep20DepositAddress" VARCHAR(255),
    "usdtErc20DepositAddress" VARCHAR(255),

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);
