ALTER TABLE "site_config"
ADD COLUMN IF NOT EXISTS "announcement_text" VARCHAR(500),
ADD COLUMN IF NOT EXISTS "show_announcement" BOOLEAN NOT NULL DEFAULT false;
