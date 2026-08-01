-- Dual per-kg courier zone rates (replace 5kg/10kg flat tiers)
ALTER TABLE "courier_zones" ADD COLUMN IF NOT EXISTS "rate_less_than_10kg" DECIMAL(12,2);
ALTER TABLE "courier_zones" ADD COLUMN IF NOT EXISTS "rate_greater_or_equal_10kg" DECIMAL(12,2);

UPDATE "courier_zones"
SET
  "rate_less_than_10kg" = COALESCE(
    "per_kg_over_10kg",
    CASE WHEN "rate_up_to_10kg" IS NOT NULL THEN "rate_up_to_10kg" / 10 ELSE NULL END,
    35
  ),
  "rate_greater_or_equal_10kg" = COALESCE(
    "per_kg_over_10kg",
    CASE WHEN "rate_up_to_10kg" IS NOT NULL THEN "rate_up_to_10kg" / 10 ELSE NULL END,
    35
  )
WHERE "rate_less_than_10kg" IS NULL OR "rate_greater_or_equal_10kg" IS NULL;

ALTER TABLE "courier_zones" ALTER COLUMN "rate_less_than_10kg" SET NOT NULL;
ALTER TABLE "courier_zones" ALTER COLUMN "rate_greater_or_equal_10kg" SET NOT NULL;

ALTER TABLE "courier_zones" DROP COLUMN IF EXISTS "rate_up_to_5kg";
ALTER TABLE "courier_zones" DROP COLUMN IF EXISTS "rate_up_to_10kg";
ALTER TABLE "courier_zones" DROP COLUMN IF EXISTS "per_kg_over_10kg";

-- Global shipping GST % (default 18)
ALTER TABLE "store_settings"
  ADD COLUMN IF NOT EXISTS "shipping_gst_percentage" DECIMAL(5,2) NOT NULL DEFAULT 18;
