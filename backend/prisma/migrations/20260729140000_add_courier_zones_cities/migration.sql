-- CreateTable
CREATE TABLE "courier_zones" (
    "id" TEXT NOT NULL,
    "code" VARCHAR(1) NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "per_kg_rate" DECIMAL(12,2) NOT NULL,
    "min_charge_kg" INTEGER NOT NULL DEFAULT 10,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courier_cities" (
    "id" TEXT NOT NULL,
    "city_code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "province" VARCHAR(100) NOT NULL,
    "zone_id" TEXT NOT NULL,
    "via" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courier_cities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "courier_zones_code_key" ON "courier_zones"("code");

-- CreateIndex
CREATE UNIQUE INDEX "courier_cities_city_code_key" ON "courier_cities"("city_code");

-- CreateIndex
CREATE INDEX "courier_cities_province_idx" ON "courier_cities"("province");

-- CreateIndex
CREATE INDEX "courier_cities_zone_id_idx" ON "courier_cities"("zone_id");

-- CreateIndex
CREATE INDEX "courier_cities_name_idx" ON "courier_cities"("name");

-- CreateIndex
CREATE INDEX "courier_cities_is_active_idx" ON "courier_cities"("is_active");

-- AddForeignKey
ALTER TABLE "courier_cities" ADD CONSTRAINT "courier_cities_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "courier_zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
