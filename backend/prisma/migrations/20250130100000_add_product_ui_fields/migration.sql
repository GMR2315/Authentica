-- AlterTable: Add UI fields to Product
ALTER TABLE "Product" ADD COLUMN "category" TEXT;
ALTER TABLE "Product" ADD COLUMN "brand" TEXT;
ALTER TABLE "Product" ADD COLUMN "manufacturing_date" TIMESTAMP(3);
ALTER TABLE "Product" ADD COLUMN "manufacturing_location" TEXT;
ALTER TABLE "Product" ADD COLUMN "materials" TEXT;
ALTER TABLE "Product" ADD COLUMN "weight_grams" INTEGER;
ALTER TABLE "Product" ADD COLUMN "dimensions" TEXT;
ALTER TABLE "Product" ADD COLUMN "color" TEXT;
ALTER TABLE "Product" ADD COLUMN "special_features" TEXT;
ALTER TABLE "Product" ADD COLUMN "retail_price" DECIMAL(12,2);
ALTER TABLE "Product" ADD COLUMN "warranty_period" TEXT;
ALTER TABLE "Product" ADD COLUMN "tags" TEXT;
ALTER TABLE "Product" ADD COLUMN "sku" TEXT;
ALTER TABLE "Product" ADD COLUMN "quantity" INTEGER;
ALTER TABLE "Product" ADD COLUMN "batch_id" TEXT;
ALTER TABLE "Product" ADD COLUMN "quality_score" DOUBLE PRECISION;
ALTER TABLE "Product" ADD COLUMN "image_cids" TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Product" ADD COLUMN "document_cids" TEXT[] DEFAULT ARRAY[]::TEXT[];
