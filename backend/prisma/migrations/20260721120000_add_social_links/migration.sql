-- Dynamic social media links for storefront footer (Admin → Site settings).
CREATE TABLE IF NOT EXISTS "social_links" (
    "id" UUID NOT NULL,
    "platform" VARCHAR(32) NOT NULL,
    "url" VARCHAR(1024) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_links_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "social_links_is_active_sort_order_idx"
  ON "social_links"("is_active", "sort_order");
