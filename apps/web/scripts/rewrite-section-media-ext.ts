import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";

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

function rewrite(value: unknown, map: Map<string, string>): unknown {
  if (typeof value === "string") {
    if (map.has(value)) return map.get(value)!;
    // soft rewrite .jpg/.png → .webp on same R2 host
    if (/\.(jpe?g|png)(\?|$)/i.test(value) && value.includes("r2.dev")) {
      return value.replace(/\.(jpe?g|png)(\?|$)/i, ".webp$2");
    }
    return value;
  }
  if (Array.isArray(value)) return value.map((v) => rewrite(v, map));
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      next[k] = rewrite(v, map);
    }
    return next;
  }
  return value;
}

async function main() {
  loadEnv();
  const prisma = new PrismaClient();
  const assets = await prisma.mediaAsset.findMany({ select: { url: true } });
  const map = new Map<string, string>();
  for (const a of assets) {
    const jpg = a.url.replace(/\.webp$/i, ".jpg");
    const jpeg = a.url.replace(/\.webp$/i, ".jpeg");
    const png = a.url.replace(/\.webp$/i, ".png");
    map.set(jpg, a.url);
    map.set(jpeg, a.url);
    map.set(png, a.url);
  }

  const sections = await prisma.section.findMany();
  for (const row of sections) {
    const data = rewrite(row.data, map);
    const seo = rewrite(row.seo, map);
    if (
      JSON.stringify(data) !== JSON.stringify(row.data) ||
      JSON.stringify(seo) !== JSON.stringify(row.seo)
    ) {
      await prisma.section.update({
        where: { key: row.key },
        data: { data: data as object, seo: seo as object | undefined },
      });
      console.log("updated section", row.key);
    }
  }

  const blocks = await prisma.contentBlock.findMany();
  for (const row of blocks) {
    const value = rewrite(row.value, map);
    if (JSON.stringify(value) !== JSON.stringify(row.value)) {
      await prisma.contentBlock.update({
        where: { id: row.id },
        data: { value: value as object },
      });
      console.log("updated block", row.key);
    }
  }

  await prisma.$disconnect();
  console.log("Done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
