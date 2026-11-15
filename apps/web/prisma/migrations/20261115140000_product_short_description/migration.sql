-- Short description shown beside product gallery (central product fields)
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "shortDescriptionEn" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "shortDescriptionBn" TEXT NOT NULL DEFAULT '';
