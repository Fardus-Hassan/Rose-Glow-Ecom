import { prisma } from "@/lib/server/prisma";
import type { MediaVariants } from "@/lib/media";

export type MediaMeta = {
  blurDataUrl?: string;
  variants?: MediaVariants | null;
};

export async function mediaMetaByUrls(urls: string[]) {
  const unique = [
    ...new Set(urls.map((u) => u?.trim()).filter(Boolean) as string[]),
  ];
  const map = new Map<string, MediaMeta>();
  if (!unique.length) return map;

  const rows = await prisma.mediaAsset.findMany({
    where: { url: { in: unique } },
    select: { url: true, blurDataUrl: true, variants: true },
  });

  for (const row of rows) {
    map.set(row.url, {
      blurDataUrl: row.blurDataUrl || undefined,
      variants: (row.variants as MediaVariants | null) ?? null,
    });
  }

  // Also index by each variant URL so product media pointing at a variant still resolves
  for (const row of rows) {
    const variants = row.variants as MediaVariants | null;
    if (!variants) continue;
    for (const url of Object.values(variants)) {
      if (url) {
        map.set(url, {
          blurDataUrl: row.blurDataUrl || undefined,
          variants,
        });
      }
    }
  }

  return map;
}

type WithMedia = {
  media?: Array<{ src: string; poster?: string | null }>;
  ogImage?: string | null;
};

export async function attachMediaMeta<T extends WithMedia>(rows: T[]) {
  const urls = rows.flatMap((row) => [
    ...(row.media ?? []).flatMap((m) => [m.src, m.poster ?? ""]),
    row.ogImage ?? "",
  ]);
  const meta = await mediaMetaByUrls(urls);

  return rows.map((row) => ({
    ...row,
    media: row.media?.map((m) => {
      const hit = meta.get(m.src) || (m.poster ? meta.get(m.poster) : undefined);
      return {
        ...m,
        blurDataUrl: hit?.blurDataUrl,
        variants: hit?.variants ?? undefined,
      };
    }),
  }));
}
