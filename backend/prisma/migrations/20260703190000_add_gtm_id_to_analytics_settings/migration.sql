-- Add Google Tag Manager container ID to analytics settings singleton.

ALTER TABLE "analytics_ga4_settings" ADD COLUMN "gtm_id" VARCHAR(32);
