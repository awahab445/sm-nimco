-- CreateTable
CREATE TABLE "bundle_deals" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "deal_price" DECIMAL(10,2) NOT NULL,
    "compare_at_total" DECIMAL(10,2) NOT NULL,
    "savings_amount" DECIMAL(10,2) NOT NULL,
    "savings_percent" DECIMAL(5,2),
    "image_url" TEXT,
    "valid_from" TIMESTAMP(3),
    "valid_to" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "bundle_deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bundle_deal_items" (
    "id" TEXT NOT NULL,
    "bundle_deal_id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "variant_id" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "position" INTEGER NOT NULL DEFAULT 0,
    "unit_list_price" DECIMAL(10,2),

    CONSTRAINT "bundle_deal_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bundle_deals_slug_key" ON "bundle_deals"("slug");

-- CreateIndex
CREATE INDEX "bundle_deals_slug_idx" ON "bundle_deals"("slug");

-- CreateIndex
CREATE INDEX "bundle_deals_status_deleted_at_idx" ON "bundle_deals"("status", "deleted_at");

-- CreateIndex
CREATE INDEX "bundle_deals_valid_from_valid_to_idx" ON "bundle_deals"("valid_from", "valid_to");

-- CreateIndex
CREATE INDEX "bundle_deals_is_featured_idx" ON "bundle_deals"("is_featured");

-- CreateIndex
CREATE UNIQUE INDEX "bundle_deal_items_bundle_deal_id_product_id_variant_id_key" ON "bundle_deal_items"("bundle_deal_id", "product_id", "variant_id");

-- CreateIndex
CREATE INDEX "bundle_deal_items_bundle_deal_id_position_idx" ON "bundle_deal_items"("bundle_deal_id", "position");

-- AddForeignKey
ALTER TABLE "bundle_deal_items" ADD CONSTRAINT "bundle_deal_items_bundle_deal_id_fkey" FOREIGN KEY ("bundle_deal_id") REFERENCES "bundle_deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_deal_items" ADD CONSTRAINT "bundle_deal_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bundle_deal_items" ADD CONSTRAINT "bundle_deal_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
