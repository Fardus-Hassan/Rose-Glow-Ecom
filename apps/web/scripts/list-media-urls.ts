import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

for (const name of [".env.local", ".env"]) {
  const file = path.join(process.cwd(), name);
  if (!existsSync(file)) continue;
  for (const line of readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)\s*=\s*"(.*)"\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const prisma = new PrismaClient();

function walk(value: unknown, trail: string, hits: string[]) {
  if (typeof value === "string") {
    if (
      value.startsWith("/uploads/") ||
      value.includes("r2.dev") ||
      value.startsWith("http")
    ) {
      if (/\.(webp|png|jpe?g|gif|mp4|webm|mov|svg)(\?|$)/i.test(value) || value.includes("/uploads/") || value.includes("r2.dev") || value.includes("images.") || value.includes("videos.")) {
        hits.push(`${trail}: ${value}`);
      }
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((v, i) => walk(v, `${trail}[${i}]`, hits));
    return;
  }
  if (value && typeof value === "object") {
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      walk(v, `${trail}.${k}`, hits);
    }
  }
}

async function main() {
  const assets = await prisma.mediaAsset.findMany({
    select: { kind: true, url: true },
  });
  const media = await prisma.productMedia.findMany({
    select: { type: true, src: true, poster: true },
  });
  const products = await prisma.product.findMany({
    select: { slug: true, ogImage: true },
  });
  const sections = await prisma.section.findMany();
  const hits: string[] = [];
  for (const s of sections) {
    walk(s.data, s.key, hits);
    walk(s.seo, `${s.key}.seo`, hits);
  }

  console.log("=== MediaAsset ===");
  for (const a of assets) console.log(a.kind, a.url);
  console.log("\n=== ProductMedia ===");
  for (const m of media) console.log(m.type, m.src, m.poster || "");
  console.log("\n=== Product ogImage ===");
  for (const p of products.filter((x) => x.ogImage))
    console.log(p.slug, p.ogImage);
  console.log("\n=== Section media-ish strings ===");
  for (const h of hits) console.log(h);

  const localLeft = [
    ...assets.filter((a) => a.url.startsWith("/uploads/")),
    ...media.filter(
      (m) => m.src.startsWith("/uploads/") || m.poster?.startsWith("/uploads/"),
    ),
    ...products.filter((p) => p.ogImage.startsWith("/uploads/")),
  ];
  console.log("\nLocal /uploads remaining:", localLeft.length);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
