import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { HttpError } from "./http";
import { sectionDefaults } from "@/lib/cms/defaults";
import type { SectionKey } from "@/lib/cms/types";
import { sectionSchemas } from "@/lib/cms/schema";

export async function ensureCmsSeed() {
  for (const schema of sectionSchemas) {
    const existing = await prisma.section.findUnique({
      where: { key: schema.key },
    });
    if (!existing) {
      await prisma.section.create({
        data: {
          key: schema.key,
          data: sectionDefaults[schema.key] as Prisma.InputJsonValue,
        },
      });
    }
  }

  const statuses = await prisma.messageStatus.count();
  if (statuses === 0) {
    await prisma.messageStatus.createMany({
      data: [
        { key: "NEW", label: "New", color: "#c9a08a", inInbox: true, sortOrder: 0 },
        {
          key: "REPLIED",
          label: "Replied",
          color: "#5b8c5a",
          inInbox: true,
          sortOrder: 1,
        },
        {
          key: "ARCHIVED",
          label: "Archived",
          color: "#7d7470",
          inInbox: false,
          sortOrder: 2,
        },
      ],
    });
  }
}

export async function getSection(key: string) {
  await ensureCmsSeed();
  const row = await prisma.section.findUnique({ where: { key } });
  if (!row) {
    const fallback = sectionDefaults[key as SectionKey];
    if (!fallback) throw new HttpError(404, "Section not found");
    return { key, data: fallback, seo: null, updatedAt: new Date() };
  }
  return row;
}

export async function upsertSection(
  key: string,
  data: Record<string, unknown>,
  seo?: Record<string, unknown> | null,
) {
  if (!sectionSchemas.some((s) => s.key === key)) {
    throw new HttpError(400, "Unknown section");
  }
  return prisma.section.upsert({
    where: { key },
    create: {
      key,
      data: data as Prisma.InputJsonValue,
      seo: (seo ?? undefined) as Prisma.InputJsonValue | undefined,
    },
    update: {
      data: data as Prisma.InputJsonValue,
      ...(seo !== undefined
        ? { seo: seo as Prisma.InputJsonValue | undefined }
        : {}),
    },
  });
}

export async function listSections() {
  await ensureCmsSeed();
  return prisma.section.findMany({
    select: { key: true, updatedAt: true },
    orderBy: { key: "asc" },
  });
}

export async function dashboardStats() {
  await ensureCmsSeed();
  const [
    unread,
    messages,
    subscribers,
    media,
    pendingOrders,
    orderCount,
    productCount,
    recentMessages,
    recentOrders,
  ] = await Promise.all([
    prisma.contactMessage.count({ where: { read: false } }),
    prisma.contactMessage.count(),
    prisma.subscriber.count(),
    prisma.mediaAsset.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count(),
    prisma.product.count({ where: { published: true } }),
    prisma.contactMessage.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        subject: true,
        read: true,
        createdAt: true,
        message: true,
      },
    }),
    prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
  ]);

  return {
    unread,
    messages,
    subscribers,
    media,
    pendingOrders,
    orderCount,
    productCount,
    recentMessages,
    recentOrders,
  };
}
