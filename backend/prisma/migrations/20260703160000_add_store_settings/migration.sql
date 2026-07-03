-- CreateTable
CREATE TABLE "store_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "current_theme" VARCHAR(32) NOT NULL DEFAULT 'default',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_admin_user_id" TEXT,

    CONSTRAINT "store_settings_pkey" PRIMARY KEY ("id")
);

-- Seed singleton row
INSERT INTO "store_settings" ("id", "current_theme", "updated_at")
VALUES ('default', 'default', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
