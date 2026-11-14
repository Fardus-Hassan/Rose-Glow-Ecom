export type MediaVariantName = "thumb" | "card" | "detail" | "full";

export type MediaVariants = {
  thumb?: string;
  card?: string;
  detail?: string;
  full?: string;
};

const R2_BASE = (
  process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
  process.env.R2_PUBLIC_URL ||
  ""
).replace(/\/$/, "");

const VARIANT_WIDTH: Record<Exclude<MediaVariantName, "full">, number> = {
  thumb: 400,
  card: 900,
  detail: 1600,
};

/** Preset `sizes` strings for common e-com slots */
export const MEDIA_SIZES = {
  thumb: "72px",
  card: "(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 280px",
  /** Display slot — keep moderate for LCP */
  gallery: "(max-width: 768px) 100vw, min(820px, 52vw)",
  /** Hover-zoom layer — request near-full source so CSS scale stays sharp */
  galleryZoom: "2000px",
  hero: "100vw",
  review: "(max-width: 768px) 33vw, 160px",
  logo: "44px",
} as const;

function toWebpOnR2(url: string) {
  if (!R2_BASE || !url.startsWith(R2_BASE)) return url;
  if (!/\.(jpe?g|png)(\?|$)/i.test(url)) return url;
  return url.replace(/\.(jpe?g|png)(\?|$)/i, ".webp$2");
}

/**
 * Resolve storefront/admin media paths to Cloudflare R2 when configured.
 */
export function mediaUrl(src: string | null | undefined): string {
  if (!src) return "";
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;

  if (src.startsWith("http://") || src.startsWith("https://")) {
    return toWebpOnR2(src);
  }
  if (!R2_BASE) return src;

  let resolved = src;
  if (src.startsWith("/uploads/")) {
    resolved = `${R2_BASE}/${src.slice("/uploads/".length)}`;
  } else if (
    src.startsWith("/products/") ||
    src.startsWith("/home/") ||
    src.startsWith("/brand/")
  ) {
    resolved = `${R2_BASE}${src}`;
  }

  return toWebpOnR2(resolved);
}

export function r2PublicBase() {
  return R2_BASE;
}

function stripVariantSuffix(url: string) {
  return url.replace(/-w\d+(?=\.[a-z0-9]+(?:\?|$))/i, "");
}

/**
 * Pick a responsive variant. Prefers explicit `variants` from MediaAsset,
 * otherwise derives `-w{N}.webp` next to the original on R2.
 */
export function mediaVariant(
  src: string | null | undefined,
  variant: MediaVariantName = "full",
  variants?: MediaVariants | null,
): string {
  const absolute = mediaUrl(src);
  if (!absolute) return "";

  if (variants?.[variant]) return variants[variant]!;
  if (variant === "full") {
    return variants?.full || absolute;
  }

  const width = VARIANT_WIDTH[variant];
  const base = stripVariantSuffix(absolute);
  return base.replace(/(\.[a-z0-9]+)(?:\?.*)?$/i, `-w${width}.webp`);
}

export function isRemoteMedia(src: string) {
  return /^https?:\/\//i.test(src);
}
