-- AlterTable
ALTER TABLE "promotions" ADD COLUMN "applies_to_all_groups" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "promotion_customer_groups" (
    "id" TEXT NOT NULL,
    "promotion_id" TEXT NOT NULL,
    "customer_group_id" UUID NOT NULL,
    "is_excluded" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "promotion_customer_groups_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "promotion_customer_groups_promotion_id_customer_group_id_key" ON "promotion_customer_groups"("promotion_id", "customer_group_id");

-- CreateIndex
CREATE INDEX "promotion_customer_groups_promotion_id_idx" ON "promotion_customer_groups"("promotion_id");

-- CreateIndex
CREATE INDEX "promotion_customer_groups_customer_group_id_idx" ON "promotion_customer_groups"("customer_group_id");

-- CreateIndex
CREATE INDEX "promotion_customer_groups_promotion_id_is_excluded_idx" ON "promotion_customer_groups"("promotion_id", "is_excluded");

-- AddForeignKey
ALTER TABLE "promotion_customer_groups" ADD CONSTRAINT "promotion_customer_groups_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "promotions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "promotion_customer_groups" ADD CONSTRAINT "promotion_customer_groups_customer_group_id_fkey" FOREIGN KEY ("customer_group_id") REFERENCES "customer_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

