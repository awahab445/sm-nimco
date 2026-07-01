-- Singleton GA4 analytics settings for storefront tracking.

CREATE TABLE "analytics_ga4_settings" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "measurement_id" VARCHAR(32),
    "is_enabled" BOOLEAN NOT NULL DEFAULT false,
    "debug_mode" BOOLEAN NOT NULL DEFAULT false,
    "track_page_views" BOOLEAN NOT NULL DEFAULT true,
    "track_cart_events" BOOLEAN NOT NULL DEFAULT true,
    "track_checkout_steps" BOOLEAN NOT NULL DEFAULT true,
    "track_purchases" BOOLEAN NOT NULL DEFAULT true,
    "track_refunds" BOOLEAN NOT NULL DEFAULT false,
    "track_custom_events" BOOLEAN NOT NULL DEFAULT true,
    "anonymize_ip" BOOLEAN NOT NULL DEFAULT true,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'PKR',
    "updated_at" TIMESTAMP(3) NOT NULL,
    "updated_by_admin_user_id" TEXT,

    CONSTRAINT "analytics_ga4_settings_pkey" PRIMARY KEY ("id")
);

INSERT INTO "analytics_ga4_settings" ("id", "updated_at")
VALUES ('default', CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
