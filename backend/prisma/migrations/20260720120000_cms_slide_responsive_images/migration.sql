-- Optional art-direction mobile image + auto-generated tablet variant paths.
ALTER TABLE "cms_banner_slides"
  ADD COLUMN IF NOT EXISTS "mobile_image_url" TEXT,
  ADD COLUMN IF NOT EXISTS "image_url_tablet" TEXT;
