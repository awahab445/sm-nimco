-- PLP browse tree nodes (managed under Store filters, synced from Store navigation mega menu).

CREATE TABLE IF NOT EXISTS "storefront_filter_tree_nodes" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "filter_id" UUID NOT NULL,
  "parent_id" UUID,
  "nav_link_id" UUID,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "storefront_filter_tree_nodes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "storefront_filter_tree_nodes_filter_id_nav_link_id_key"
  ON "storefront_filter_tree_nodes"("filter_id", "nav_link_id");

CREATE INDEX IF NOT EXISTS "storefront_filter_tree_nodes_filter_id_parent_id_sort_order_idx"
  ON "storefront_filter_tree_nodes"("filter_id", "parent_id", "sort_order");

CREATE INDEX IF NOT EXISTS "storefront_filter_tree_nodes_filter_id_is_active_sort_order_idx"
  ON "storefront_filter_tree_nodes"("filter_id", "is_active", "sort_order");

ALTER TABLE "storefront_filter_tree_nodes"
  ADD CONSTRAINT "storefront_filter_tree_nodes_filter_id_fkey"
  FOREIGN KEY ("filter_id") REFERENCES "storefront_filters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "storefront_filter_tree_nodes"
  ADD CONSTRAINT "storefront_filter_tree_nodes_parent_id_fkey"
  FOREIGN KEY ("parent_id") REFERENCES "storefront_filter_tree_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "storefront_filter_tree_nodes"
  ADD CONSTRAINT "storefront_filter_tree_nodes_nav_link_id_fkey"
  FOREIGN KEY ("nav_link_id") REFERENCES "storefront_nav_links"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed browse tree from existing mega menu navigation (category filter must exist).
INSERT INTO "storefront_filter_tree_nodes" ("id", "filter_id", "parent_id", "nav_link_id", "sort_order", "is_active", "created_at", "updated_at")
SELECT gen_random_uuid(), f.id, NULL, n.id, n.sort_order, n.is_active, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "storefront_filters" f
CROSS JOIN "storefront_nav_links" n
WHERE f.kind = 'CATEGORY'
  AND n.zone = 'mega'
  AND n.parent_id IS NULL
  AND NOT EXISTS (SELECT 1 FROM "storefront_filter_tree_nodes" t WHERE t.filter_id = f.id);

INSERT INTO "storefront_filter_tree_nodes" ("id", "filter_id", "parent_id", "nav_link_id", "sort_order", "is_active", "created_at", "updated_at")
SELECT gen_random_uuid(), f.id, p.id, n.id, n.sort_order, n.is_active, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM "storefront_filters" f
JOIN "storefront_nav_links" n ON n.zone = 'mega' AND n.parent_id IS NOT NULL
JOIN "storefront_nav_links" pn ON pn.id = n.parent_id
JOIN "storefront_filter_tree_nodes" p ON p.filter_id = f.id AND p.nav_link_id = pn.id
WHERE f.kind = 'CATEGORY'
  AND NOT EXISTS (
    SELECT 1 FROM "storefront_filter_tree_nodes" t
    WHERE t.filter_id = f.id AND t.nav_link_id = n.id
  );
