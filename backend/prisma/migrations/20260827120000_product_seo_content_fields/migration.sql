-- AlterTable: Nimco-tailored SEO & product content fields
ALTER TABLE "products" ADD COLUMN "seo_title" TEXT;
ALTER TABLE "products" ADD COLUMN "meta_description" TEXT;
ALTER TABLE "products" ADD COLUMN "taste_profile" TEXT;
ALTER TABLE "products" ADD COLUMN "ingredients" TEXT;
ALTER TABLE "products" ADD COLUMN "serving_suggestions" TEXT;
ALTER TABLE "products" ADD COLUMN "storage_instructions" TEXT;
ALTER TABLE "products" ADD COLUMN "dietary_highlights" TEXT;
ALTER TABLE "products" ADD COLUMN "spice_level" TEXT;
ALTER TABLE "products" ADD COLUMN "faqs" TEXT;
ALTER TABLE "products" ADD COLUMN "focus_keywords" TEXT;
ALTER TABLE "products" ADD COLUMN "product_tags" TEXT;
