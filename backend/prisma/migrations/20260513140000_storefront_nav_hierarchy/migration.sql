-- Hierarchical store navigation (header + mega menu) with optional category linking.

ALTER TABLE "storefront_nav_links" ADD COLUMN IF NOT EXISTS "zone" VARCHAR(16) NOT NULL DEFAULT 'header';
ALTER TABLE "storefront_nav_links" ADD COLUMN IF NOT EXISTS "parent_id" UUID;
ALTER TABLE "storefront_nav_links" ADD COLUMN IF NOT EXISTS "category_id" TEXT;
ALTER TABLE "storefront_nav_links" ADD COLUMN IF NOT EXISTS "open_mega_menu" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "storefront_nav_links" ALTER COLUMN "href" SET DEFAULT '';

CREATE INDEX IF NOT EXISTS "storefront_nav_links_zone_parent_id_sort_order_idx"
  ON "storefront_nav_links" ("zone", "parent_id", "sort_order");

ALTER TABLE "storefront_nav_links" DROP CONSTRAINT IF EXISTS "storefront_nav_links_parent_id_fkey";
ALTER TABLE "storefront_nav_links"
  ADD CONSTRAINT "storefront_nav_links_parent_id_fkey"
  FOREIGN KEY ("parent_id") REFERENCES "storefront_nav_links"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "storefront_nav_links" DROP CONSTRAINT IF EXISTS "storefront_nav_links_category_id_fkey";
ALTER TABLE "storefront_nav_links"
  ADD CONSTRAINT "storefront_nav_links_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Legacy MEGA_CATEGORIES rows become mega menu triggers on the header bar.
UPDATE "storefront_nav_links"
SET "open_mega_menu" = true, "kind" = 'LINK', "zone" = 'header'
WHERE "kind" = 'MEGA_CATEGORIES';

-- Seed mega menu roots from active top-level categories (one-time; skips if mega rows exist).
INSERT INTO "storefront_nav_links" ("id", "label", "href", "sort_order", "is_active", "kind", "zone", "parent_id", "category_id", "open_mega_menu", "created_at", "updated_at")
SELECT
  gen_random_uuid(),
  c.name,
  '/categories/' || c.slug,
  c.position,
  c.is_active,
  'LINK',
  'mega',
  NULL,
  c.id,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "categories" c
WHERE c.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM "storefront_nav_links" n WHERE n.zone = 'mega' LIMIT 1);
