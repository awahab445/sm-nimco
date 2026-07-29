-- CreateTable
CREATE TABLE "shipping_rates" (
    "id" TEXT NOT NULL,
    "province" VARCHAR(100) NOT NULL,
    "city" VARCHAR(100),
    "min_weight_kg" DECIMAL(10,3) NOT NULL,
    "max_weight_kg" DECIMAL(10,3) NOT NULL,
    "rate_amount" DECIMAL(12,2) NOT NULL,
    "is_cod_available" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shipping_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shipping_rates_province_city_idx" ON "shipping_rates"("province", "city");

-- CreateIndex
CREATE INDEX "shipping_rates_province_min_weight_kg_max_weight_kg_idx" ON "shipping_rates"("province", "min_weight_kg", "max_weight_kg");

-- CreateIndex
CREATE INDEX "shipping_rates_is_cod_available_idx" ON "shipping_rates"("is_cod_available");
