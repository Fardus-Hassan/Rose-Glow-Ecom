import sharp from "sharp";
import { uploadToR2 } from "@/lib/server/r2";

export type MediaVariants = {
  thumb: string;
  card: string;
  detail: string;
  full: string;
};

export const VARIANT_WIDTHS = {
  thumb: 400,
  card: 900,
  detail: 1600,
  full: 2000,
} as const;

function keyWithWidth(baseKey: string, width: number) {
  const cleaned = baseKey.replace(/-w\d+(?=\.[a-z0-9]+$)/i, "");
  return cleaned.replace(/(\.[a-z0-9]+)$/i, `-w${width}.webp`);
}

function fullKey(baseKey: string) {
  return baseKey.replace(/\.[a-z0-9]+$/i, ".webp").replace(/-w\d+(?=\.webp$)/i, "");
}

/**
 * Build responsive WebP variants + LQIP blur for e-com images.
 */
export async function optimizeImageForR2(opts: {
  bytes: Buffer;
  /** Object key without size suffix, e.g. 2026/11/name-id */
  keyBase: string;
}) {
  const pipeline = sharp(opts.bytes).rotate();
  const meta = await pipeline.metadata();

  const blurBuf = await sharp(opts.bytes)
    .rotate()
    .resize({ width: 16, withoutEnlargement: true })
    .webp({ quality: 40 })
    .toBuffer();
  const blurDataUrl = `data:image/webp;base64,${blurBuf.toString("base64")}`;

  const variants: Partial<MediaVariants> = {};
  let fullWidth = meta.width ?? 0;
  let fullHeight = meta.height ?? 0;
  let fullSize = 0;

  for (const [name, width] of Object.entries(VARIANT_WIDTHS) as Array<
    [keyof typeof VARIANT_WIDTHS, number]
  >) {
    const out = await sharp(opts.bytes)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: name === "thumb" ? 78 : name === "card" ? 80 : 82 })
      .toBuffer({ resolveWithObject: true });

    const key =
      name === "full"
        ? fullKey(`${opts.keyBase}.webp`)
        : keyWithWidth(`${opts.keyBase}.webp`, width);

    const url = await uploadToR2({
      key,
      body: out.data,
      contentType: "image/webp",
    });
    variants[name] = url;

    if (name === "full") {
      fullWidth = out.info.width;
      fullHeight = out.info.height;
      fullSize = out.info.size;
    }
  }

  return {
    url: variants.full!,
    filename: fullKey(`${opts.keyBase}.webp`).split("/").pop()!,
    mime: "image/webp" as const,
    size: fullSize,
    width: fullWidth,
    height: fullHeight,
    blurDataUrl,
    variants: variants as MediaVariants,
  };
}
