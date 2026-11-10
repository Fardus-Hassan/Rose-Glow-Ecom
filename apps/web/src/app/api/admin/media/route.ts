import { randomBytes } from "node:crypto";
import path from "node:path";
import { Role } from "@prisma/client";
import { handleRouteError, json, HttpError } from "@/lib/server/http";
import { requireUser } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { uploadToR2 } from "@/lib/server/r2";
import { optimizeImageForR2 } from "@/lib/server/image-optimize";
import { paginated, parsePageParams } from "@/lib/server/pagination";

export async function GET(request: Request) {
  try {
    await requireUser(request);
    const { searchParams } = new URL(request.url);
    const kind = searchParams.get("kind")?.trim();
    const q = searchParams.get("q")?.trim();
    const pageParams = parsePageParams(searchParams, {
      pageSize: 24,
      maxPageSize: 60,
    });

    const where = {
      ...(kind === "image" || kind === "video" || kind === "document"
        ? { kind }
        : {}),
      ...(q
        ? {
            OR: [
              { filename: { contains: q, mode: "insensitive" as const } },
              { alt: { contains: q, mode: "insensitive" as const } },
            ],
          }
        : {}),
    };

    const [total, items] = await Promise.all([
      prisma.mediaAsset.count({ where }),
      prisma.mediaAsset.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: pageParams.skip,
        take: pageParams.pageSize,
      }),
    ]);

    return json(paginated(items, total, pageParams));
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    await requireUser(request, [Role.ADMIN]);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new HttpError(400, "File required");

    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = file.type || "application/octet-stream";
    const isImage = mime.startsWith("image/");
    const isVideo = mime.startsWith("video/");
    const isPdf = mime === "application/pdf";
    if (!isImage && !isVideo && !isPdf) {
      throw new HttpError(400, "Only images, videos, and PDFs are supported");
    }

    const now = new Date();
    const folder = [
      String(now.getFullYear()),
      String(now.getMonth() + 1).padStart(2, "0"),
    ].join("/");

    const id = randomBytes(4).toString("hex");
    const safeBase =
      file.name
        .replace(/\.[^.]+$/, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "file";

    const keyBase = `${folder}/${safeBase}-${id}`;
    let kind: "image" | "video" | "document" = isImage
      ? "image"
      : isVideo
        ? "video"
        : "document";

    if (isImage && !mime.includes("svg") && !mime.includes("gif")) {
      const optimized = await optimizeImageForR2({ bytes, keyBase });
      const row = await prisma.mediaAsset.create({
        data: {
          kind,
          url: optimized.url,
          filename: optimized.filename,
          mime: optimized.mime,
          size: optimized.size,
          width: optimized.width,
          height: optimized.height,
          alt: String(form.get("alt") || ""),
          blurDataUrl: optimized.blurDataUrl,
          variants: optimized.variants,
        },
      });
      return json(row, 201);
    }

    const ext =
      path.extname(file.name) ||
      (isVideo ? ".mp4" : isPdf ? ".pdf" : mime.includes("svg") ? ".svg" : ".bin");
    const filename = `${safeBase}-${id}${ext.toLowerCase()}`;
    const key = `${folder}/${filename}`;
    const url = await uploadToR2({
      key,
      body: bytes,
      contentType: mime,
    });

    const row = await prisma.mediaAsset.create({
      data: {
        kind,
        url,
        filename,
        mime,
        size: bytes.length,
        alt: String(form.get("alt") || ""),
      },
    });

    return json(row, 201);
  } catch (err) {
    return handleRouteError(err);
  }
}
