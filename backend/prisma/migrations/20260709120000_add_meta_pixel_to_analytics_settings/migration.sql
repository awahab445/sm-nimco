-- Add Meta (Facebook) Pixel ID and enable flag to analytics settings singleton.

ALTER TABLE "analytics_ga4_settings" ADD COLUMN "meta_pixel_id" VARCHAR(32);
ALTER TABLE "analytics_ga4_settings" ADD COLUMN "meta_pixel_enabled" BOOLEAN NOT NULL DEFAULT false;
