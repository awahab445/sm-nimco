-- CreateTable
CREATE TABLE "tax_classes" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tax_classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "taxes" (
    "id" UUID NOT NULL,
    "tax_class_id" UUID NOT NULL,
    "country" VARCHAR(2) NOT NULL,
    "region" VARCHAR(100),
    "rate" DECIMAL(5,4) NOT NULL,
    "is_inclusive" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "taxes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_taxes" (
    "id" UUID NOT NULL,
    "order_id" TEXT NOT NULL,
    "tax_id" UUID NOT NULL,
    "tax_class_id" UUID NOT NULL,
    "tax_class_code" VARCHAR(50) NOT NULL,
    "tax_class_name" VARCHAR(255) NOT NULL,
    "country" VARCHAR(2) NOT NULL,
    "region" VARCHAR(100),
    "rate" DECIMAL(5,4) NOT NULL,
    "is_inclusive" BOOLEAN NOT NULL,
    "taxable_amount" DECIMAL(12,2) NOT NULL,
    "tax_amount" DECIMAL(12,2) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "order_taxes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tax_classes_code_key" ON "tax_classes"("code");

-- CreateIndex
CREATE INDEX "tax_classes_code_idx" ON "tax_classes"("code");

-- CreateIndex
CREATE INDEX "taxes_tax_class_id_idx" ON "taxes"("tax_class_id");

-- CreateIndex
CREATE INDEX "taxes_country_region_idx" ON "taxes"("country", "region");

-- CreateIndex
CREATE INDEX "taxes_is_active_idx" ON "taxes"("is_active");

-- CreateIndex
CREATE INDEX "taxes_start_date_end_date_idx" ON "taxes"("start_date", "end_date");

-- CreateIndex
CREATE INDEX "taxes_country_region_tax_class_id_is_active_idx" ON "taxes"("country", "region", "tax_class_id", "is_active");

-- CreateIndex
CREATE INDEX "order_taxes_order_id_idx" ON "order_taxes"("order_id");

-- CreateIndex
CREATE INDEX "order_taxes_tax_id_idx" ON "order_taxes"("tax_id");

-- CreateIndex
CREATE INDEX "order_taxes_tax_class_id_idx" ON "order_taxes"("tax_class_id");

-- AddForeignKey
ALTER TABLE "taxes" ADD CONSTRAINT "taxes_tax_class_id_fkey" FOREIGN KEY ("tax_class_id") REFERENCES "tax_classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_taxes" ADD CONSTRAINT "order_taxes_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_taxes" ADD CONSTRAINT "order_taxes_tax_id_fkey" FOREIGN KEY ("tax_id") REFERENCES "taxes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
