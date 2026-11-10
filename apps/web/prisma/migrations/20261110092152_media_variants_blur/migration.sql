-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "blurDataUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "variants" JSONB;
