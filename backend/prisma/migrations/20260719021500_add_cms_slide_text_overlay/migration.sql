-- Per-slide text overlay alignment for home hero banners (Kalles-style).
ALTER TABLE "cms_banner_slides"
  ADD COLUMN IF NOT EXISTS "text_align" VARCHAR(16) NOT NULL DEFAULT 'left',
  ADD COLUMN IF NOT EXISTS "text_position" VARCHAR(16) NOT NULL DEFAULT 'middle',
  ADD COLUMN IF NOT EXISTS "text_color" VARCHAR(16) NOT NULL DEFAULT 'light';
