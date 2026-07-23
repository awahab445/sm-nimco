-- AlterTable
ALTER TABLE "store_settings"
ADD COLUMN "minimum_order_amount" DECIMAL(12,2) NOT NULL DEFAULT 800,
ADD COLUMN "free_delivery_threshold" DECIMAL(12,2) NOT NULL DEFAULT 2000;
