/**
 * Swap local demo product + hero media to soft editorial (cream-friendly) shots.
 * Run: pnpm --filter web exec tsx prisma/refresh-editorial-media.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const BY_SLUG: Record<string, string[]> = {
  "glow-bridal-set": [
    U("photo-1515562141207-7a88fb7ce338"),
    U("photo-1535632066927-ab7c9ab60908"),
    U("photo-1617038260897-41a1f14a8ca0"),
  ],
  "pearl-bloom-earrings": [
    U("photo-1588444837495-c6cfeb53ea07"),
    U("photo-1535632066927-ab7c9ab60908"),
  ],
  "rose-veil-necklace": [
    U("photo-1599643478518-a784e5dc4c8f"),
    U("photo-1617038260897-41a1f14a8ca0"),
  ],
  "petal-ring": [
    U("photo-1605100804763-247f67b3557e"),
    U("photo-1515562141207-7a88fb7ce338"),
  ],
  "dusk-bangle-set": [
    U("photo-1611591437281-460bfbe1220a"),
    U("photo-1515562141207-7a88fb7ce338"),
  ],
  "atelier-drop-earrings": [
    U("photo-1630019852942-f89202989a59"),
    U("photo-1535632066927-ab7c9ab60908"),
  ],
  "velvet-night-set": [
    U("photo-1617038260897-41a1f14a8ca0"),
    U("photo-1515562141207-7a88fb7ce338"),
  ],
  "soft-hoop-earrings": [
    U("photo-1535632066927-ab7c9ab60908"),
    U("photo-1630019852942-f89202989a59"),
  ],
  "daily-glow-bangle": [U("photo-1611591437281-460bfbe1220a")],
  "collarbone-chain": [U("photo-1599643478518-a784e5dc4c8f")],
  "qa-soft-glow-studs": [U("photo-1588444837495-c6cfeb53ea07")],
};

const HERO = {
  /* Soft lifestyle / light-studio for cream editorial hero circle */
  imageDesktop: U("photo-1596944924616-7b38e7cfac36", 1800),
  imageMobile: U("photo-1515562141207-7a88fb7ce338", 1200),
};

async function main() {
  const products = await prisma.product.findMany({
    where: { deletedAt: null },
    select: { id: true, slug: true, media: { orderBy: { sortOrder: "asc" } } },
  });

  for (const product of products) {
    const urls = BY_SLUG[product.slug];
    if (!urls?.length) continue;

    for (let i = 0; i < product.media.length; i++) {
      const src = urls[Math.min(i, urls.length - 1)];
      await prisma.productMedia.update({
        where: { id: product.media[i].id },
        data: { src },
      });
    }

    // Cover first frame if product has no media rows yet
    if (!product.media.length) {
      await prisma.productMedia.create({
        data: {
          productId: product.id,
          type: "IMAGE",
          src: urls[0],
          sortOrder: 0,
          altEn: product.slug,
          altBn: product.slug,
        },
      });
    }

    console.log(`updated media → ${product.slug}`);
  }

  const home = await prisma.section.findUnique({ where: { key: "home" } });
  if (home && home.data && typeof home.data === "object") {
    const data = home.data as Record<string, unknown>;
    const hero = {
      ...((data.hero as Record<string, unknown>) || {}),
      ...HERO,
      mode: "image",
      overlayDesktop: false,
      overlayMobile: false,
    };
    await prisma.section.update({
      where: { key: "home" },
      data: { data: { ...data, hero } },
    });
    console.log("updated home hero media");
  }

  console.log("done");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
