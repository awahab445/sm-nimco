-- AlterTable
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "courier_load_sheet_id" VARCHAR(255);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "orders_courier_load_sheet_id_idx" ON "orders"("courier_load_sheet_id");

-- CreateTable
CREATE TABLE IF NOT EXISTS "leopard_loadsheets" (
    "id" TEXT NOT NULL,
    "reference_number" VARCHAR(255) NOT NULL,
    "tracking_numbers" JSONB NOT NULL,
    "order_ids" JSONB NOT NULL,
    "pdf_data" BYTEA,
    "has_stored_pdf" BOOLEAN NOT NULL DEFAULT false,
    "pdf_url" TEXT,
    "print_url" TEXT,
    "html" TEXT,
    "packet_snapshot" JSONB NOT NULL,
    "company_name" VARCHAR(255),
    "account_number" VARCHAR(50),
    "packet_count" INTEGER NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leopard_loadsheets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "leopard_loadsheets_reference_number_idx" ON "leopard_loadsheets"("reference_number");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "leopard_loadsheets_created_at_idx" ON "leopard_loadsheets"("created_at" DESC);
