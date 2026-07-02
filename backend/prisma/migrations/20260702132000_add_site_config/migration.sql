CREATE TABLE IF NOT EXISTS "site_config" (
  "id" TEXT NOT NULL DEFAULT 'default',
  "logo_url" VARCHAR(1024),
  "logo_width" INTEGER NOT NULL DEFAULT 36,
  "logo_height" INTEGER NOT NULL DEFAULT 36,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_by_admin_user_id" TEXT,
  CONSTRAINT "site_config_pkey" PRIMARY KEY ("id")
);

INSERT INTO "site_config" ("id", "logo_width", "logo_height")
VALUES ('default', 36, 36)
ON CONFLICT ("id") DO NOTHING;
