/**
 * Upload local public media (uploads/products/home/brand) to Cloudflare R2
 * and rewrite every matching DB URL.
 *
 * Usage: pnpm exec tsx scripts/migrate-media-to-r2.ts
 */
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";

const MEDIA_ROOTS = ["uploads", "products", "home", "brand"] as const;
const SKIP_NAMES = new Set([
  "file.svg",
  "globe.svg",
  "next.svg",
  "vercel.svg",
  "window.svg",
]);

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

function required(name: string) {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function mimeFor(file: string) {
  const ext = path.extname(file).toLowerCase();
  const map: Record<string, string> = {
    ".webp": "image/webp",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".mov": "video/quicktime",
    ".pdf": "application/pdf",
  };
  return map[ext] || "application/octet-stream";
}

function walkFiles(dir: string, out: string[] = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walkFiles(full, out);
    else if (!SKIP_NAMES.has(entry)) out.push(full);
  }
  return out;
}

function rewriteUrls(value: unknown, map: Map<string, string>): unknown {
  if (typeof value === "string") {
    if (map.has(value)) return map.get(value)!;
    let next = value;
    for (const [from, to] of map) {
      if (next.includes(from)) next = next.split(from).join(to);
    }
    return next;
  }
  if (Array.isArray(value)) return value.map((v) => rewriteUrls(v, map));
  if (value && typeof value === "object") {
    const next: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      next[k] = rewriteUrls(v, map);
    }
    return next;
  }
  return value;
}

function isLocalMediaUrl(url: string) {
  return MEDIA_ROOTS.some(
    (root) => url === `/${root}` || url.startsWith(`/${root}/`),
  );
}

async function main() {
  loadEnv();
  const prisma = new PrismaClient();
  const publicBase = required("R2_PUBLIC_URL").replace(/\/$/, "");
  const bucket = required("R2_BUCKET");
  const client = new S3Client({
    region: "auto",
    endpoint: required("R2_ENDPOINT"),
    credentials: {
      accessKeyId: required("R2_ACCESS_KEY_ID"),
      secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
    },
  });

  const publicRoot = path.join(process.cwd(), "public");
  const files: string[] = [];
  for (const root of MEDIA_ROOTS) {
    walkFiles(path.join(publicRoot, root), files);
  }
  console.log(`Local media files: ${files.length}`);

  const urlMap = new Map<string, string>();

  for (const file of files) {
    const rel = path.relative(publicRoot, file).split(path.sep).join("/");
    const localUrl = `/${rel}`;
    // Keep folder structure on R2 (products/..., home/..., brand/..., 2026/11/...)
    const key = rel.startsWith("uploads/")
      ? rel.slice("uploads/".length)
      : rel;
    const remoteUrl = `${publicBase}/${key}`;

    // Skip re-upload if already mapped to same remote and DB already uses it —
    // still upload to ensure object exists.
    const body = readFileSync(file);
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: mimeFor(file),
      }),
    );
    urlMap.set(localUrl, remoteUrl);
    console.log(`↑ ${localUrl} → ${remoteUrl}`);
  }

  let updated = 0;

  const mediaAssets = await prisma.mediaAsset.findMany();
  for (const row of mediaAssets) {
    if (!urlMap.has(row.url)) continue;
    const next = urlMap.get(row.url)!;
    const clash = await prisma.mediaAsset.findUnique({ where: { url: next } });
    if (clash && clash.id !== row.id) {
      await prisma.mediaAsset.delete({ where: { id: row.id } });
    } else {
      await prisma.mediaAsset.update({
        where: { id: row.id },
        data: { url: next },
      });
    }
    updated++;
  }

  const productMedia = await prisma.productMedia.findMany();
  for (const row of productMedia) {
    const data: { src?: string; poster?: string | null } = {};
    if (urlMap.has(row.src)) data.src = urlMap.get(row.src)!;
    if (row.poster && urlMap.has(row.poster)) data.poster = urlMap.get(row.poster)!;
    if (Object.keys(data).length) {
      await prisma.productMedia.update({ where: { id: row.id }, data });
      updated++;
    }
  }

  const products = await prisma.product.findMany({
    select: { id: true, ogImage: true },
  });
  for (const row of products) {
    if (!urlMap.has(row.ogImage)) continue;
    await prisma.product.update({
      where: { id: row.id },
      data: { ogImage: urlMap.get(row.ogImage)! },
    });
    updated++;
  }

  const pages = await prisma.page.findMany({ select: { id: true, ogImage: true } });
  for (const row of pages) {
    if (!urlMap.has(row.ogImage)) continue;
    await prisma.page.update({
      where: { id: row.id },
      data: { ogImage: urlMap.get(row.ogImage)! },
    });
    updated++;
  }

  const seo = await prisma.seoEntry.findMany({ select: { id: true, ogImage: true } });
  for (const row of seo) {
    if (!urlMap.has(row.ogImage)) continue;
    await prisma.seoEntry.update({
      where: { id: row.id },
      data: { ogImage: urlMap.get(row.ogImage)! },
    });
    updated++;
  }

  const reviews = await prisma.review.findMany({
    select: { id: true, imageUrls: true },
  });
  for (const row of reviews) {
    const next = rewriteUrls(row.imageUrls, urlMap);
    if (JSON.stringify(next) !== JSON.stringify(row.imageUrls)) {
      await prisma.review.update({
        where: { id: row.id },
        data: { imageUrls: next as object },
      });
      updated++;
    }
  }

  const sections = await prisma.section.findMany();
  for (const row of sections) {
    const data = rewriteUrls(row.data, urlMap);
    const seoJson = rewriteUrls(row.seo, urlMap);
    if (
      JSON.stringify(data) !== JSON.stringify(row.data) ||
      JSON.stringify(seoJson) !== JSON.stringify(row.seo)
    ) {
      await prisma.section.update({
        where: { key: row.key },
        data: { data: data as object, seo: seoJson as object | undefined },
      });
      updated++;
    }
  }

  const blocks = await prisma.contentBlock.findMany();
  for (const row of blocks) {
    const value = rewriteUrls(row.value, urlMap);
    if (JSON.stringify(value) !== JSON.stringify(row.value)) {
      await prisma.contentBlock.update({
        where: { id: row.id },
        data: { value: value as object },
      });
      updated++;
    }
  }

  const settings = await prisma.siteSetting.findMany();
  for (const row of settings) {
    const value = rewriteUrls(row.value, urlMap);
    if (JSON.stringify(value) !== JSON.stringify(row.value)) {
      await prisma.siteSetting.update({
        where: { id: row.id },
        data: { value: value as object },
      });
      updated++;
    }
  }

  // Register product/home/brand files in MediaAsset if missing
  for (const [localUrl, remoteUrl] of urlMap) {
    if (localUrl.startsWith("/uploads/")) continue;
    const existing = await prisma.mediaAsset.findUnique({
      where: { url: remoteUrl },
    });
    if (existing) continue;
    const filename = path.basename(localUrl);
    const file = path.join(publicRoot, localUrl.replace(/^\//, ""));
    const size = existsSync(file) ? statSync(file).size : 0;
    const mime = mimeFor(filename);
    const kind = mime.startsWith("video/")
      ? "video"
      : mime === "application/pdf"
        ? "document"
        : "image";
    await prisma.mediaAsset.create({
      data: {
        kind,
        url: remoteUrl,
        filename,
        mime,
        size,
        alt: "",
      },
    });
    console.log(`+ mediaAsset ${remoteUrl}`);
  }

  const leftoverMedia = await prisma.productMedia.findMany({
    where: {
      OR: [
        { src: { startsWith: "/products/" } },
        { src: { startsWith: "/uploads/" } },
        { src: { startsWith: "/home/" } },
        { poster: { startsWith: "/products/" } },
        { poster: { startsWith: "/uploads/" } },
      ],
    },
  });
  const leftoverOg = await prisma.product.count({
    where: {
      OR: [
        { ogImage: { startsWith: "/products/" } },
        { ogImage: { startsWith: "/uploads/" } },
        { ogImage: { startsWith: "/home/" } },
      ],
    },
  });

  console.log("\nDone.");
  console.log(`Uploaded: ${urlMap.size}`);
  console.log(`DB rows touched: ${updated}`);
  console.log(`Remaining local productMedia: ${leftoverMedia.length}`);
  console.log(`Remaining local product.ogImage: ${leftoverOg}`);
  console.log(
    `Local-looking map keys: ${[...urlMap.keys()].filter(isLocalMediaUrl).length}`,
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
