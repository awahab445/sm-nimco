-- Storefront filter definitions + attribute options (replaces catalog_facet_options).

DROP TABLE IF EXISTS "catalog_facet_options";

CREATE TABLE "storefront_filters" (
    "id" UUID NOT NULL,
    "code" VARCHAR(64) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "kind" VARCHAR(32) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storefront_filters_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "storefront_filters_code_key" ON "storefront_filters" ("code");

CREATE INDEX "storefront_filters_is_active_sort_order_idx" ON "storefront_filters" ("is_active", "sort_order");

CREATE TABLE "storefront_filter_options" (
    "id" UUID NOT NULL,
    "filter_id" UUID NOT NULL,
    "value" VARCHAR(255) NOT NULL,
    "label" VARCHAR(255),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "storefront_filter_options_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "storefront_filter_options_filter_id_value_key" ON "storefront_filter_options" ("filter_id", "value");

CREATE INDEX "storefront_filter_options_filter_id_is_active_sort_order_idx" ON "storefront_filter_options" ("filter_id", "is_active", "sort_order");

ALTER TABLE "storefront_filter_options" ADD CONSTRAINT "storefront_filter_options_filter_id_fkey" FOREIGN KEY ("filter_id") REFERENCES "storefront_filters" ("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Default filter slots (admin can rename / toggle / add attribute filters + options)
INSERT INTO "storefront_filters" ("id", "code", "name", "kind", "sort_order", "is_active", "created_at", "updated_at")
VALUES
  (gen_random_uuid(), 'category', 'Category', 'CATEGORY', 0, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'price', 'Price', 'PRICE', 1, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'brand', 'Brand', 'ATTRIBUTE', 2, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (gen_random_uuid(), 'size', 'Size', 'ATTRIBUTE', 3, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
