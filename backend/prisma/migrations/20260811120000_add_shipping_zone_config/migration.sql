-- Nationwide Economy & Overland shipping config (replaces Zone A-E rate table for checkout).
ALTER TABLE "store_settings" ADD COLUMN IF NOT EXISTS "shipping_zone_config" JSONB;
