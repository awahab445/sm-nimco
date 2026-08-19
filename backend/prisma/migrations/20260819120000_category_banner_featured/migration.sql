-- AlterTable
ALTER TABLE "categories" ADD COLUMN "image_url" TEXT;
ALTER TABLE "categories" ADD COLUMN "banner_url" TEXT;
ALTER TABLE "categories" ADD COLUMN "is_featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "categories_is_featured_is_active_idx" ON "categories"("is_featured", "is_active");
