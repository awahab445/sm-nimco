-- Configurable storefront header navigation (main menu links + mega menu slot).

CREATE TABLE "storefront_nav_links" (
    "id" UUID NOT NULL,
    "label" VARCHAR(128) NOT NULL,
    "secondary_label" VARCHAR(128),
    "href" VARCHAR(512) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "kind" VARCHAR(32) NOT NULL DEFAULT 'LINK',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storefront_nav_links_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "storefront_nav_links_is_active_sort_order_idx" ON "storefront_nav_links" ("is_active", "sort_order");

-- Default header items (stable IDs for idempotent seed / migrations)
INSERT INTO "storefront_nav_links" ("id", "label", "secondary_label", "href", "sort_order", "is_active", "kind", "created_at", "updated_at")
VALUES
  ('00000000-0000-0000-0000-00000000e001', 'Home', NULL, '/', 0, true, 'LINK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('00000000-0000-0000-0000-00000000e002', 'Products', 'Categories', '/products', 10, true, 'MEGA_CATEGORIES', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('00000000-0000-0000-0000-00000000e003', 'Track order', NULL, '/track-order', 20, true, 'LINK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('00000000-0000-0000-0000-00000000e004', 'Complaints', NULL, '/complain', 30, true, 'LINK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('00000000-0000-0000-0000-00000000e005', 'Cart', NULL, '/cart', 40, true, 'LINK', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
