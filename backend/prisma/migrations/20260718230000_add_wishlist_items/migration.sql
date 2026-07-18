-- Customer wishlist items (authenticated users only; guests use localStorage on storefront).

CREATE TABLE "wishlist_items" (
    "id" UUID NOT NULL,
    "customer_id" UUID NOT NULL,
    "product_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wishlist_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "wishlist_items_customer_id_product_id_key" ON "wishlist_items"("customer_id", "product_id");

CREATE INDEX "wishlist_items_customer_id_idx" ON "wishlist_items"("customer_id");

CREATE INDEX "wishlist_items_product_id_idx" ON "wishlist_items"("product_id");

ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "wishlist_items" ADD CONSTRAINT "wishlist_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
