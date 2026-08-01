-- AlterTable
ALTER TABLE "products" ADD COLUMN "shipping_weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0;
ALTER TABLE "products" ADD COLUMN "shipping_weight_unit" TEXT NOT NULL DEFAULT 'KG';

-- AlterTable
ALTER TABLE "product_variants" ADD COLUMN "shipping_weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0;
ALTER TABLE "product_variants" ADD COLUMN "shipping_weight_unit" TEXT NOT NULL DEFAULT 'KG';
