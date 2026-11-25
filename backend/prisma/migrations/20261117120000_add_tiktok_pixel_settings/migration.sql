-- AlterTable
ALTER TABLE "analytics_ga4_settings" ADD COLUMN "tiktok_pixel_id" VARCHAR(32),
ADD COLUMN "tiktok_pixel_enabled" BOOLEAN NOT NULL DEFAULT false;
