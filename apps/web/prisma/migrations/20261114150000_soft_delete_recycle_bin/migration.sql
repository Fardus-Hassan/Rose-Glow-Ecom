-- Soft-delete + recycle bin (30-day retention)
-- Active uniqueness enforced via partial indexes (deletedAt IS NULL)

-- Category
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
DROP INDEX IF EXISTS "Category_slug_key";
CREATE INDEX IF NOT EXISTS "Category_deletedAt_idx" ON "Category"("deletedAt");
CREATE INDEX IF NOT EXISTS "Category_slug_idx" ON "Category"("slug");
CREATE UNIQUE INDEX "Category_slug_active_key" ON "Category"("slug") WHERE "deletedAt" IS NULL;

-- Product
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
DROP INDEX IF EXISTS "Product_slug_key";
DROP INDEX IF EXISTS "Product_sku_key";
DROP INDEX IF EXISTS "Product_landingSlug_key";
CREATE INDEX IF NOT EXISTS "Product_deletedAt_idx" ON "Product"("deletedAt");
CREATE INDEX IF NOT EXISTS "Product_slug_idx" ON "Product"("slug");
CREATE INDEX IF NOT EXISTS "Product_sku_idx" ON "Product"("sku");
CREATE UNIQUE INDEX "Product_slug_active_key" ON "Product"("slug") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "Product_sku_active_key" ON "Product"("sku") WHERE "deletedAt" IS NULL;
CREATE UNIQUE INDEX "Product_landingSlug_active_key" ON "Product"("landingSlug") WHERE "deletedAt" IS NULL AND "landingSlug" IS NOT NULL;

-- Review
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "Review_deletedAt_idx" ON "Review"("deletedAt");

-- Subscriber
ALTER TABLE "Subscriber" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
DROP INDEX IF EXISTS "Subscriber_email_key";
CREATE INDEX IF NOT EXISTS "Subscriber_deletedAt_idx" ON "Subscriber"("deletedAt");
CREATE INDEX IF NOT EXISTS "Subscriber_email_idx" ON "Subscriber"("email");
CREATE UNIQUE INDEX "Subscriber_email_active_key" ON "Subscriber"("email") WHERE "deletedAt" IS NULL;
