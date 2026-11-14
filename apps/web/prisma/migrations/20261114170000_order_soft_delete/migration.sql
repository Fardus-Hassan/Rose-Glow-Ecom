-- Soft-delete orders (recycle bin, 30-day retention)
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "Order_deletedAt_idx" ON "Order"("deletedAt");
