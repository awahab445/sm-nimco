-- CreateTable
CREATE TABLE "shipping_zones" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "coverage" JSONB NOT NULL DEFAULT '{}',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_methods" (
    "id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "type" VARCHAR(50) NOT NULL,
    "config" JSONB NOT NULL DEFAULT '{}',
    "min_order_amount" DECIMAL(12,2),
    "max_order_amount" DECIMAL(12,2),
    "min_weight" DECIMAL(10,2),
    "max_weight" DECIMAL(10,2),
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "courier_config" JSONB DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_shipping" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "shipping_method_id" TEXT NOT NULL,
    "cost" DECIMAL(12,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "tracking_number" VARCHAR(255),
    "tracking_url" TEXT,
    "courier_code" VARCHAR(50),
    "courier_name" VARCHAR(255),
    "shipped_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "shipping_address" JSONB NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_shipping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shipping_method_customer_groups" (
    "id" TEXT NOT NULL,
    "shipping_method_id" TEXT NOT NULL,
    "customer_group_id" UUID NOT NULL,
    "discount_percent" DECIMAL(5,2),
    "fixed_cost" DECIMAL(12,2),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_method_customer_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shipping_zones_is_active_priority_idx" ON "shipping_zones"("is_active", "priority");

-- CreateIndex
CREATE INDEX "shipping_zones_priority_idx" ON "shipping_zones"("priority");

-- CreateIndex
CREATE INDEX "shipping_methods_zone_id_idx" ON "shipping_methods"("zone_id");

-- CreateIndex
CREATE INDEX "shipping_methods_code_idx" ON "shipping_methods"("code");

-- CreateIndex
CREATE INDEX "shipping_methods_is_active_priority_idx" ON "shipping_methods"("is_active", "priority");

-- CreateIndex
CREATE INDEX "shipping_methods_type_idx" ON "shipping_methods"("type");

-- CreateIndex
CREATE UNIQUE INDEX "order_shipping_order_id_key" ON "order_shipping"("order_id");

-- CreateIndex
CREATE INDEX "order_shipping_order_id_idx" ON "order_shipping"("order_id");

-- CreateIndex
CREATE INDEX "order_shipping_shipping_method_id_idx" ON "order_shipping"("shipping_method_id");

-- CreateIndex
CREATE INDEX "order_shipping_status_idx" ON "order_shipping"("status");

-- CreateIndex
CREATE INDEX "order_shipping_tracking_number_idx" ON "order_shipping"("tracking_number");

-- CreateIndex
CREATE INDEX "order_shipping_courier_code_idx" ON "order_shipping"("courier_code");

-- CreateIndex
CREATE INDEX "order_shipping_shipped_at_idx" ON "order_shipping"("shipped_at");

-- CreateIndex
CREATE UNIQUE INDEX "shipping_method_customer_groups_shipping_method_id_customer_group_id_key" ON "shipping_method_customer_groups"("shipping_method_id", "customer_group_id");

-- CreateIndex
CREATE INDEX "shipping_method_customer_groups_shipping_method_id_idx" ON "shipping_method_customer_groups"("shipping_method_id");

-- CreateIndex
CREATE INDEX "shipping_method_customer_groups_customer_group_id_idx" ON "shipping_method_customer_groups"("customer_group_id");

ALTER TABLE "shipping_methods" ADD CONSTRAINT "shipping_methods_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "shipping_zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_shipping" ADD CONSTRAINT "order_shipping_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_shipping" ADD CONSTRAINT "order_shipping_shipping_method_id_fkey" FOREIGN KEY ("shipping_method_id") REFERENCES "shipping_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_method_customer_groups" ADD CONSTRAINT "shipping_method_customer_groups_shipping_method_id_fkey" FOREIGN KEY ("shipping_method_id") REFERENCES "shipping_methods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shipping_method_customer_groups" ADD CONSTRAINT "shipping_method_customer_groups_customer_group_id_fkey" FOREIGN KEY ("customer_group_id") REFERENCES "customer_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;
