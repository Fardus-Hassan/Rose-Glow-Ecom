import { prisma } from "./prisma";
import { HttpError } from "./http";

export const TRASH_RETENTION_DAYS = 30;

export type TrashKind =
  | "product"
  | "category"
  | "review"
  | "subscriber"
  | "order";

export type TrashItem = {
  kind: TrashKind;
  id: string;
  title: string;
  subtitle?: string;
  deletedAt: string;
  expiresAt: string;
  daysLeft: number;
};

function cutoffDate(from = new Date()) {
  return new Date(
    from.getTime() - TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );
}

function expiryMeta(deletedAt: Date) {
  const expiresAt = new Date(
    deletedAt.getTime() + TRASH_RETENTION_DAYS * 24 * 60 * 60 * 1000,
  );
  const daysLeft = Math.max(
    0,
    Math.ceil((expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
  );
  return {
    deletedAt: deletedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
    daysLeft,
  };
}

/** Permanently remove items soft-deleted more than 30 days ago. */
export async function purgeExpiredTrash() {
  const cutoff = cutoffDate();
  const [products, categories, reviews, subscribers, orders] =
    await Promise.all([
      prisma.product.deleteMany({ where: { deletedAt: { lt: cutoff } } }),
      prisma.category.deleteMany({ where: { deletedAt: { lt: cutoff } } }),
      prisma.review.deleteMany({ where: { deletedAt: { lt: cutoff } } }),
      prisma.subscriber.deleteMany({ where: { deletedAt: { lt: cutoff } } }),
      prisma.order.deleteMany({ where: { deletedAt: { lt: cutoff } } }),
    ]);
  return {
    products: products.count,
    categories: categories.count,
    reviews: reviews.count,
    subscribers: subscribers.count,
    orders: orders.count,
  };
}

export async function listTrash(): Promise<TrashItem[]> {
  await purgeExpiredTrash();

  const [products, categories, reviews, subscribers, orders] =
    await Promise.all([
      prisma.product.findMany({
        where: { deletedAt: { not: null } },
        select: {
          id: true,
          nameEn: true,
          sku: true,
          deletedAt: true,
        },
        orderBy: { deletedAt: "desc" },
      }),
      prisma.category.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, nameEn: true, slug: true, deletedAt: true },
        orderBy: { deletedAt: "desc" },
      }),
      prisma.review.findMany({
        where: { deletedAt: { not: null } },
        select: {
          id: true,
          authorName: true,
          bodyEn: true,
          deletedAt: true,
          product: { select: { nameEn: true } },
        },
        orderBy: { deletedAt: "desc" },
      }),
      prisma.subscriber.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, email: true, deletedAt: true },
        orderBy: { deletedAt: "desc" },
      }),
      prisma.order.findMany({
        where: { deletedAt: { not: null } },
        select: {
          id: true,
          orderNumber: true,
          customerName: true,
          customerPhone: true,
          total: true,
          deletedAt: true,
        },
        orderBy: { deletedAt: "desc" },
      }),
    ]);

  const items: TrashItem[] = [
    ...products.map((p) => ({
      kind: "product" as const,
      id: p.id,
      title: p.nameEn,
      subtitle: p.sku,
      ...expiryMeta(p.deletedAt!),
    })),
    ...categories.map((c) => ({
      kind: "category" as const,
      id: c.id,
      title: c.nameEn,
      subtitle: c.slug,
      ...expiryMeta(c.deletedAt!),
    })),
    ...reviews.map((r) => ({
      kind: "review" as const,
      id: r.id,
      title: r.authorName,
      subtitle: r.product?.nameEn || r.bodyEn.slice(0, 80),
      ...expiryMeta(r.deletedAt!),
    })),
    ...subscribers.map((s) => ({
      kind: "subscriber" as const,
      id: s.id,
      title: s.email,
      ...expiryMeta(s.deletedAt!),
    })),
    ...orders.map((o) => ({
      kind: "order" as const,
      id: o.id,
      title: o.orderNumber,
      subtitle: `${o.customerName} · ${o.customerPhone}`,
      ...expiryMeta(o.deletedAt!),
    })),
  ];

  return items.sort(
    (a, b) =>
      new Date(b.deletedAt).getTime() - new Date(a.deletedAt).getTime(),
  );
}

export async function restoreTrashItem(kind: TrashKind, id: string) {
  switch (kind) {
    case "product": {
      const row = await prisma.product.findFirst({
        where: { id, deletedAt: { not: null } },
      });
      if (!row) throw new HttpError(404, "Trash item not found");
      const cat = await prisma.category.findFirst({
        where: { id: row.categoryId, deletedAt: null },
      });
      if (!cat) {
        throw new HttpError(
          400,
          "Restore the category first, or move this product to another category",
        );
      }
      return prisma.product.update({
        where: { id },
        data: { deletedAt: null, published: false },
      });
    }
    case "category": {
      const row = await prisma.category.findFirst({
        where: { id, deletedAt: { not: null } },
      });
      if (!row) throw new HttpError(404, "Trash item not found");
      return prisma.category.update({
        where: { id },
        data: { deletedAt: null, isActive: false },
      });
    }
    case "review": {
      const row = await prisma.review.findFirst({
        where: { id, deletedAt: { not: null } },
      });
      if (!row) throw new HttpError(404, "Trash item not found");
      return prisma.review.update({
        where: { id },
        data: { deletedAt: null, isPublished: false },
      });
    }
    case "subscriber": {
      const row = await prisma.subscriber.findFirst({
        where: { id, deletedAt: { not: null } },
      });
      if (!row) throw new HttpError(404, "Trash item not found");
      const clash = await prisma.subscriber.findFirst({
        where: { email: row.email, deletedAt: null, NOT: { id } },
      });
      if (clash) {
        throw new HttpError(409, "An active subscriber already uses this email");
      }
      return prisma.subscriber.update({
        where: { id },
        data: { deletedAt: null },
      });
    }
    case "order": {
      const row = await prisma.order.findFirst({
        where: { id, deletedAt: { not: null } },
      });
      if (!row) throw new HttpError(404, "Trash item not found");
      return prisma.order.update({
        where: { id },
        data: { deletedAt: null },
      });
    }
    default:
      throw new HttpError(400, "Unknown trash kind");
  }
}

export async function destroyTrashItem(kind: TrashKind, id: string) {
  switch (kind) {
    case "product": {
      const row = await prisma.product.findFirst({
        where: { id, deletedAt: { not: null } },
      });
      if (!row) throw new HttpError(404, "Trash item not found");
      return prisma.product.delete({ where: { id } });
    }
    case "category": {
      const row = await prisma.category.findFirst({
        where: { id, deletedAt: { not: null } },
      });
      if (!row) throw new HttpError(404, "Trash item not found");
      const activeProducts = await prisma.product.count({
        where: { categoryId: id, deletedAt: null },
      });
      if (activeProducts > 0) {
        throw new HttpError(
          400,
          "Category still has active products — move or trash them first",
        );
      }
      // Permanent: also purge soft-deleted products in this category
      await prisma.product.deleteMany({
        where: { categoryId: id, deletedAt: { not: null } },
      });
      return prisma.category.delete({ where: { id } });
    }
    case "review": {
      const row = await prisma.review.findFirst({
        where: { id, deletedAt: { not: null } },
      });
      if (!row) throw new HttpError(404, "Trash item not found");
      return prisma.review.delete({ where: { id } });
    }
    case "subscriber": {
      const row = await prisma.subscriber.findFirst({
        where: { id, deletedAt: { not: null } },
      });
      if (!row) throw new HttpError(404, "Trash item not found");
      return prisma.subscriber.delete({ where: { id } });
    }
    case "order": {
      const row = await prisma.order.findFirst({
        where: { id, deletedAt: { not: null } },
      });
      if (!row) throw new HttpError(404, "Trash item not found");
      return prisma.order.delete({ where: { id } });
    }
    default:
      throw new HttpError(400, "Unknown trash kind");
  }
}

export async function trashCount() {
  const [products, categories, reviews, subscribers, orders] =
    await Promise.all([
      prisma.product.count({ where: { deletedAt: { not: null } } }),
      prisma.category.count({ where: { deletedAt: { not: null } } }),
      prisma.review.count({ where: { deletedAt: { not: null } } }),
      prisma.subscriber.count({ where: { deletedAt: { not: null } } }),
      prisma.order.count({ where: { deletedAt: { not: null } } }),
    ]);
  return products + categories + reviews + subscribers + orders;
}
