-- AlterTable: replace per_kg_rate / min_charge_kg with weight-tier columns
ALTER TABLE "courier_zones" ADD COLUMN "rate_up_to_5kg" DECIMAL(12,2);
ALTER TABLE "courier_zones" ADD COLUMN "rate_up_to_10kg" DECIMAL(12,2);
ALTER TABLE "courier_zones" ADD COLUMN "per_kg_over_10kg" DECIMAL(12,2);

-- Backfill from legacy per_kg_rate (5kg = 5×rate, 10kg = 10×rate, overage = per_kg)
UPDATE "courier_zones"
SET
  "rate_up_to_5kg" = COALESCE("per_kg_rate", 0) * 5,
  "rate_up_to_10kg" = COALESCE("per_kg_rate", 0) * 10,
  "per_kg_over_10kg" = COALESCE("per_kg_rate", 0);

ALTER TABLE "courier_zones" ALTER COLUMN "rate_up_to_5kg" SET NOT NULL;
ALTER TABLE "courier_zones" ALTER COLUMN "rate_up_to_10kg" SET NOT NULL;
ALTER TABLE "courier_zones" ALTER COLUMN "per_kg_over_10kg" SET NOT NULL;

ALTER TABLE "courier_zones" DROP COLUMN "per_kg_rate";
ALTER TABLE "courier_zones" DROP COLUMN "min_charge_kg";
