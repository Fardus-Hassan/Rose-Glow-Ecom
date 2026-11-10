-- AlterTable
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "landingEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "landingSlug" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "landing" JSONB NOT NULL DEFAULT '{}';

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Product_landingSlug_key" ON "Product"("landingSlug");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Product_landingEnabled_idx" ON "Product"("landingEnabled");
