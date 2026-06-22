-- AlterTable
ALTER TABLE "customers" ADD COLUMN "reset_password_token" VARCHAR(255),
ADD COLUMN "reset_password_expires" TIMESTAMPTZ(6);

-- CreateIndex
CREATE UNIQUE INDEX "customers_reset_password_token_key" ON "customers"("reset_password_token");

-- CreateIndex
CREATE INDEX "customers_reset_password_token_idx" ON "customers"("reset_password_token");
