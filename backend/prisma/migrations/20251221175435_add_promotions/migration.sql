-- CreateTable
CREATE TABLE "promotions" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(100),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "discount_value" DECIMAL(10,2),
    "discount_type" VARCHAR(50) NOT NULL,
    "scope" VARCHAR(50) NOT NULL DEFAULT 'cart',
    "is_stackable" BOOLEAN NOT NULL DEFAULT false,
    "is_exclusive" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB NOT NULL DEFAULT '{}',
    "usage_limit" INTEGER,
    "usage_limit_per_user" INTEGER,
    "current_usage" INTEGER NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_products" (
    "id" TEXT NOT NULL,
    "promotion_id" TEXT NOT NULL,
    "product_id" TEXT,
    "variant_id" TEXT,
    "category_id" TEXT,

    CONSTRAINT "promotion_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "promotion_logs" (
    "id" TEXT NOT NULL,
    "promotion_id" TEXT NOT NULL,
    "cart_id" TEXT,
    "checkout_id" TEXT,
    "order_id" TEXT,
    "customer_id" TEXT,
    "coupon_code" VARCHAR(100),
    "discount_amount" DECIMAL(12,2) NOT NULL,
    "subtotal_before" DECIMAL(12,2) NOT NULL,
    "subtotal_after" DECIMAL(12,2) NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotion_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promotions_code_key" ON "promotions"("code");

-- CreateIndex
CREATE INDEX "promotions_code_idx" ON "promotions"("code");

-- CreateIndex
CREATE INDEX "promotions_status_idx" ON "promotions"("status");

-- CreateIndex
CREATE INDEX "promotions_start_date_end_date_idx" ON "promotions"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "promotions_status_start_date_end_date_idx" ON "promotions"("status", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "promotion_products_promotion_id_idx" ON "promotion_products"("promotion_id");

-- CreateIndex
CREATE INDEX "promotion_products_product_id_idx" ON "promotion_products"("product_id");

-- CreateIndex
CREATE INDEX "promotion_products_variant_id_idx" ON "promotion_products"("variant_id");

-- CreateIndex
CREATE INDEX "promotion_products_category_id_idx" ON "promotion_products"("category_id");

-- CreateIndex
CREATE INDEX "promotion_logs_promotion_id_idx" ON "promotion_logs"("promotion_id");

-- CreateIndex
CREATE INDEX "promotion_logs_cart_id_idx" ON "promotion_logs"("cart_id");

-- CreateIndex
CREATE INDEX "promotion_logs_checkout_id_idx" ON "promotion_logs"("checkout_id");

-- CreateIndex
CREATE INDEX "promotion_logs_order_id_idx" ON "promotion_logs"("order_id");

-- CreateIndex
CREATE INDEX "promotion_logs_customer_id_idx" ON "promotion_logs"("customer_id");

-- CreateIndex
CREATE INDEX "promotion_logs_coupon_code_idx" ON "promotion_logs"("coupon_code");

-- CreateIndex
CREATE INDEX "promotion_logs_created_at_idx" ON "promotion_logs"("created_at" DESC);

-- AddForeignKey
ALTER TABLE "promotion_products" ADD CONSTRAINT "promotion_products_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_logs" ADD CONSTRAINT "promotion_logs_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
