ALTER TABLE "storefront_nav_links"
  ADD COLUMN IF NOT EXISTS "banner_image_url" VARCHAR(512),
  ADD COLUMN IF NOT EXISTS "banner_href" VARCHAR(512),
  ADD COLUMN IF NOT EXISTS "banner_alt" VARCHAR(256);
