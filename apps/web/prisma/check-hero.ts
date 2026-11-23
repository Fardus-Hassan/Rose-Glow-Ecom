import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const home = await prisma.section.findUnique({ where: { key: "home" } });
  const data = (home?.data ?? {}) as Record<string, unknown>;
  const hero = (data.hero ?? {}) as Record<string, unknown>;
  console.log(
    JSON.stringify(
      {
        imageDesktop: hero.imageDesktop,
        imageMobile: hero.imageMobile,
        mode: hero.mode,
      },
      null,
      2,
    ),
  );

  const sample = await prisma.product.findFirst({
    where: { slug: "velvet-night-set" },
    include: { media: { orderBy: { sortOrder: "asc" }, take: 1 } },
  });
  console.log("velvet-night cover:", sample?.media[0]?.src);
}

main().finally(() => prisma.$disconnect());
