/**
 * Backfill responsive WebP variants + LQIP blur for existing R2 MediaAssets.
 * Usage: pnpm exec tsx scripts/optimize-r2-media.ts
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { optimizeImageForR2 } from "../src/lib/server/image-optimize";

function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const file = path.join(process.cwd(), name);
    if (!existsSync(file)) continue;
    for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)\s*=\s*"(.*)"\s*$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  }
}

function keyBaseFromUrl(url: string, publicBase: string) {
  let key = url.startsWith(publicBase)
    ? url.slice(publicBase.length + 1)
    : new URL(url).pathname.replace(/^\//, "");
  key = key.replace(/-w\d+(?=\.[a-z0-9]+$)/i, "");
  return key.replace(/\.[a-z0-9]+$/i, "");
}

async function main() {
  loadEnv();
  const prisma = new PrismaClient();
  const publicBase = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
  const rows = await prisma.mediaAsset.findMany({
    where: { kind: "image" },
    orderBy: { createdAt: "asc" },
  });

  console.log(`Images to optimize: ${rows.length}`);

  for (const row of rows) {
    if (row.blurDataUrl && row.variants) {
      console.log(`skip ${row.filename}`);
      continue;
    }
    if (!row.mime.startsWith("image/") || row.mime.includes("svg")) {
      console.log(`skip non-raster ${row.filename}`);
      continue;
    }

    const res = await fetch(row.url);
    if (!res.ok) {
      console.warn(`fail fetch ${row.url} (${res.status})`);
      continue;
    }
    const bytes = Buffer.from(await res.arrayBuffer());
    const keyBase = keyBaseFromUrl(row.url, publicBase);
    const optimized = await optimizeImageForR2({ bytes, keyBase });

    // Keep unique url — if full URL changed, update references carefully
    const clash = await prisma.mediaAsset.findUnique({
      where: { url: optimized.url },
    });

    if (clash && clash.id !== row.id) {
      await prisma.mediaAsset.update({
        where: { id: row.id },
        data: {
          blurDataUrl: optimized.blurDataUrl,
          variants: optimized.variants,
          width: optimized.width,
          height: optimized.height,
          size: optimized.size,
          mime: optimized.mime,
        },
      });
    } else {
      await prisma.mediaAsset.update({
        where: { id: row.id },
        data: {
          url: optimized.url,
          filename: optimized.filename,
          blurDataUrl: optimized.blurDataUrl,
          variants: optimized.variants,
          width: optimized.width,
          height: optimized.height,
          size: optimized.size,
          mime: optimized.mime,
        },
      });

      if (row.url !== optimized.url) {
        await prisma.productMedia.updateMany({
          where: { src: row.url },
          data: { src: optimized.url },
        });
        await prisma.productMedia.updateMany({
          where: { poster: row.url },
          data: { poster: optimized.url },
        });
        await prisma.product.updateMany({
          where: { ogImage: row.url },
          data: { ogImage: optimized.url },
        });
      }
    }

    console.log(`✓ ${row.filename} → ${optimized.filename}`);
  }

  await prisma.$disconnect();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
