import {
  MediaType,
  OrderStatus,
  PaymentMethod,
  Prisma,
} from "@prisma/client";
import { prisma } from "./prisma";
import { HttpError } from "./http";
import { paginated, type PageParams, type Paginated } from "./pagination";
import {
  normalizeLandingSlug,
  parseLandingConfig,
} from "@/lib/landing";

const productInclude = {
  category: true,
  media: { orderBy: { sortOrder: "asc" as const } },
};

function normalizeMedia(media: Array<Record<string, unknown>>) {
  return media
    .filter((m) => String(m.src || "").trim())
    .slice(0, 24)
    .map((m, i) => {
      const raw = String(m.type || "IMAGE").toUpperCase();
      return {
        type: raw === "VIDEO" ? MediaType.VIDEO : MediaType.IMAGE,
        src: String(m.src).trim(),
        poster:
          raw === "VIDEO" && m.poster
            ? String(m.poster).trim() || null
            : null,
        altEn: String(m.altEn ?? ""),
        altBn: String(m.altBn ?? ""),
        sortOrder: Number(m.sortOrder ?? i),
      };
    });
}

function normalizeLandingFields(dto: Record<string, unknown>) {
  const enabled = Boolean(dto.landingEnabled);
  const productSlug = normalizeLandingSlug(String(dto.slug || ""));
  let landingSlug = normalizeLandingSlug(String(dto.landingSlug || ""));
  if (enabled && !landingSlug) landingSlug = productSlug;
  const landing = parseLandingConfig(dto.landing);
  return {
    landingEnabled: enabled,
    landingSlug: enabled && landingSlug ? landingSlug : null,
    landing: landing as unknown as Prisma.InputJsonValue,
  };
}

export const products = {
  async findPublic(params: {
    category?: string;
    featured?: boolean;
    q?: string;
    sort?: "featured" | "newest" | "price-asc" | "price-desc";
    minPrice?: number;
    maxPrice?: number;
    page: PageParams;
  }) {
    const where: Prisma.ProductWhereInput = {
      published: true,
      ...(params.featured ? { featured: true } : {}),
      ...(params.category
        ? { category: { slug: params.category, isActive: true } }
        : {}),
      ...(params.q
        ? {
            OR: [
              { nameEn: { contains: params.q, mode: "insensitive" } },
              { nameBn: { contains: params.q, mode: "insensitive" } },
              { sku: { contains: params.q, mode: "insensitive" } },
              { slug: { contains: params.q, mode: "insensitive" } },
              { descriptionEn: { contains: params.q, mode: "insensitive" } },
              { descriptionBn: { contains: params.q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(params.minPrice != null || params.maxPrice != null
        ? {
            price: {
              ...(params.minPrice != null ? { gte: params.minPrice } : {}),
              ...(params.maxPrice != null ? { lte: params.maxPrice } : {}),
            },
          }
        : {}),
    };

    const orderBy: Prisma.ProductOrderByWithRelationInput[] =
      params.sort === "price-asc"
        ? [{ price: "asc" }]
        : params.sort === "price-desc"
          ? [{ price: "desc" }]
          : params.sort === "newest"
            ? [{ newest: "desc" }, { createdAt: "desc" }]
            : [{ featured: "desc" }, { createdAt: "desc" }];

    const facetWhere: Prisma.ProductWhereInput = {
      published: true,
      ...(params.category
        ? { category: { slug: params.category, isActive: true } }
        : {}),
      ...(params.q
        ? {
            OR: [
              { nameEn: { contains: params.q, mode: "insensitive" } },
              { nameBn: { contains: params.q, mode: "insensitive" } },
              { sku: { contains: params.q, mode: "insensitive" } },
              { slug: { contains: params.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [total, items, priceAgg] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy,
        skip: params.page.skip,
        take: params.page.pageSize,
      }),
      prisma.product.aggregate({
        where: facetWhere,
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

    return {
      ...paginated(items, total, params.page),
      facets: {
        minPrice: priceAgg._min.price ?? 0,
        maxPrice: priceAgg._max.price ?? 0,
      },
    };
  },

  async findOnePublic(slug: string) {
    const product = await prisma.product.findFirst({
      where: { slug, published: true },
      include: productInclude,
    });
    if (!product) throw new HttpError(404, "Product not found");
    return product;
  },

  async findLandingPublic(landingSlug: string) {
    const product = await prisma.product.findFirst({
      where: {
        landingEnabled: true,
        landingSlug,
        published: true,
      },
      include: productInclude,
    });
    if (!product) throw new HttpError(404, "Landing not found");
    return product;
  },

  async findAdmin(
    q: string | undefined,
    pageParams: PageParams,
  ): Promise<Paginated<Prisma.ProductGetPayload<{ include: typeof productInclude }>>> {
    const where: Prisma.ProductWhereInput | undefined = q
      ? {
          OR: [
            { nameEn: { contains: q, mode: "insensitive" } },
            { nameBn: { contains: q, mode: "insensitive" } },
            { sku: { contains: q, mode: "insensitive" } },
            { slug: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined;
    const [total, items] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        include: productInclude,
        orderBy: { updatedAt: "desc" },
        skip: pageParams.skip,
        take: pageParams.pageSize,
      }),
    ]);
    return paginated(items, total, pageParams);
  },

  async findOneAdmin(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });
    if (!product) throw new HttpError(404, "Product not found");
    return product;
  },

  async create(dto: Record<string, unknown>) {
    const media = normalizeMedia(
      (dto.media as Array<Record<string, unknown>> | undefined) ?? [],
    );
    const colors = (dto.colors as unknown[]) ?? [];
    const { media: _m, colors: _c, landing: _l, ...rest } = dto;
    const landingFields = normalizeLandingFields(dto);
    return prisma.product.create({
      data: {
        ...(rest as Prisma.ProductUncheckedCreateInput),
        ...landingFields,
        colors: colors as Prisma.InputJsonValue,
        media: {
          create: media,
        },
      },
      include: productInclude,
    });
  },

  async update(id: string, dto: Record<string, unknown>) {
    await this.findOneAdmin(id);
    const media = dto.media
      ? normalizeMedia(dto.media as Array<Record<string, unknown>>)
      : undefined;
    const colors = dto.colors as unknown[] | undefined;
    const { media: _m, colors: _c, landing: _l, ...rest } = dto;
    const landingFields =
      "landingEnabled" in dto || "landing" in dto || "landingSlug" in dto
        ? normalizeLandingFields(dto)
        : {};

    return prisma.$transaction(async (tx) => {
      if (media) {
        await tx.productMedia.deleteMany({ where: { productId: id } });
        await tx.productMedia.createMany({
          data: media.map((m) => ({
            productId: id,
            ...m,
          })),
        });
      }
      return tx.product.update({
        where: { id },
        data: {
          ...(rest as Prisma.ProductUncheckedUpdateInput),
          ...landingFields,
          ...(colors
            ? { colors: colors as Prisma.InputJsonValue }
            : {}),
        },
        include: productInclude,
      });
    });
  },

  async remove(id: string) {
    await this.findOneAdmin(id);
    return prisma.product.delete({ where: { id } });
  },
};

export const categories = {
  findAll(activeOnly = false) {
    return prisma.category.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
      include: { _count: { select: { products: true } } },
    });
  },
  async findOne(idOrSlug: string) {
    const category = await prisma.category.findFirst({
      where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      include: { _count: { select: { products: true } } },
    });
    if (!category) throw new HttpError(404, "Category not found");
    return category;
  },
  create(dto: Prisma.CategoryCreateInput) {
    return prisma.category.create({ data: dto });
  },
  async update(id: string, dto: Prisma.CategoryUpdateInput) {
    await this.findOne(id);
    return prisma.category.update({ where: { id }, data: dto });
  },
  async remove(id: string) {
    await this.findOne(id);
    return prisma.category.delete({ where: { id } });
  },
};

export const orders = {
  async nextOrderNumber() {
    const count = await prisma.order.count();
    const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return `RG-${stamp}-${String(count + 1).padStart(4, "0")}`;
  },

  async create(dto: {
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    addressLine: string;
    city: string;
    district: string;
    note?: string;
    paymentMethod?: PaymentMethod;
    shippingFee?: number;
    discount?: number;
    items: Array<{
      productId?: string;
      productName: string;
      productSku: string;
      unitPrice: number;
      quantity: number;
    }>;
  }) {
    if (!dto.items?.length) throw new HttpError(400, "Order needs at least one item");

    const { computeShippingFee, getShippingSettings } = await import(
      "@/lib/server/shipping"
    );
    const shipping = await getShippingSettings();
    if (!shipping.codEnabled) {
      throw new HttpError(400, "Cash on delivery is currently unavailable");
    }

    const items = dto.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      productSku: item.productSku,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.unitPrice * item.quantity,
    }));
    const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
    // Always recompute on server — never trust client shippingFee
    const shippingFee = computeShippingFee(subtotal, shipping);
    const discount = dto.discount ?? 0;
    const total = Math.max(0, subtotal + shippingFee - discount);

    return prisma.order.create({
      data: {
        orderNumber: await this.nextOrderNumber(),
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        customerEmail: dto.customerEmail,
        addressLine: dto.addressLine,
        city: dto.city,
        district: dto.district,
        note: dto.note,
        paymentMethod: PaymentMethod.COD,
        subtotal,
        shippingFee,
        discount,
        total,
        items: { create: items },
      },
      include: { items: true },
    });
  },

  async findAll(params: {
    status?: OrderStatus;
    q?: string;
    page: PageParams;
  }) {
    const where: Prisma.OrderWhereInput = {
      ...(params.status ? { status: params.status } : {}),
      ...(params.q
        ? {
            OR: [
              { orderNumber: { contains: params.q, mode: "insensitive" } },
              { customerName: { contains: params.q, mode: "insensitive" } },
              { customerPhone: { contains: params.q, mode: "insensitive" } },
              { customerEmail: { contains: params.q, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [total, items] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        include: { items: true },
        orderBy: { createdAt: "desc" },
        skip: params.page.skip,
        take: params.page.pageSize,
      }),
    ]);
    return paginated(items, total, params.page);
  },

  async findOne(id: string) {
    const order = await prisma.order.findFirst({
      where: { OR: [{ id }, { orderNumber: id }] },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new HttpError(404, "Order not found");
    return order;
  },

  async updateStatus(id: string, status: OrderStatus) {
    await this.findOne(id);
    return prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
  },
};

export const content = {
  listBlocks(group?: string) {
    return prisma.contentBlock.findMany({
      where: group ? { group } : undefined,
      orderBy: [{ group: "asc" }, { label: "asc" }],
    });
  },
  async getBlock(key: string) {
    const block = await prisma.contentBlock.findUnique({ where: { key } });
    if (!block) throw new HttpError(404, `Content "${key}" not found`);
    return block;
  },
  upsertBlock(data: {
    key: string;
    label: string;
    group?: string;
    value: Prisma.InputJsonValue;
  }) {
    return prisma.contentBlock.upsert({
      where: { key: data.key },
      create: {
        key: data.key,
        label: data.label,
        group: data.group ?? "general",
        value: data.value,
      },
      update: {
        label: data.label,
        group: data.group ?? "general",
        value: data.value,
      },
    });
  },
  listPages() {
    return prisma.page.findMany({ orderBy: { slug: "asc" } });
  },
  async getPage(slug: string) {
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page) throw new HttpError(404, "Page not found");
    return page;
  },
  upsertPage(data: Prisma.PageUncheckedCreateInput) {
    return prisma.page.upsert({
      where: { slug: data.slug },
      create: data,
      update: data,
    });
  },
  listSettings() {
    return prisma.siteSetting.findMany({ orderBy: { key: "asc" } });
  },
  upsertSetting(key: string, value: Prisma.InputJsonValue) {
    return prisma.siteSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  },
};

export const reviews = {
  async findPublic(params: {
    productId?: string;
    productSlug?: string;
    page: PageParams;
  }) {
    const where: Prisma.ReviewWhereInput = {
      isPublished: true,
      ...(params.productId ? { productId: params.productId } : {}),
      ...(params.productSlug
        ? { product: { slug: params.productSlug } }
        : {}),
    };
    const [total, items] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        skip: params.page.skip,
        take: params.page.pageSize,
        include: {
          product: { select: { slug: true, nameEn: true, nameBn: true } },
        },
      }),
    ]);
    return paginated(items, total, params.page);
  },
  async findAdmin(pageParams: PageParams) {
    const [total, items] = await Promise.all([
      prisma.review.count(),
      prisma.review.findMany({
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: { product: { select: { slug: true, nameEn: true } } },
        skip: pageParams.skip,
        take: pageParams.pageSize,
      }),
    ]);
    return paginated(items, total, pageParams);
  },
  create(data: Prisma.ReviewUncheckedCreateInput) {
    return prisma.review.create({ data });
  },
  async update(id: string, data: Prisma.ReviewUncheckedUpdateInput) {
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, "Review not found");
    return prisma.review.update({ where: { id }, data });
  },
  async remove(id: string) {
    const existing = await prisma.review.findUnique({ where: { id } });
    if (!existing) throw new HttpError(404, "Review not found");
    return prisma.review.delete({ where: { id } });
  },
};

export const seo = {
  list() {
    return prisma.seoEntry.findMany({ orderBy: { path: "asc" } });
  },
  async resolve(path: string, locale: "en" | "bn" = "en") {
    const entry = await prisma.seoEntry.findUnique({ where: { path } });
    if (!entry) return null;
    return {
      path: entry.path,
      title: locale === "bn" ? entry.titleBn || entry.titleEn : entry.titleEn,
      description:
        locale === "bn"
          ? entry.descriptionBn || entry.descriptionEn
          : entry.descriptionEn,
      keywords: entry.keywords,
      ogImage: entry.ogImage,
      noIndex: entry.noIndex,
      canonicalUrl: entry.canonicalUrl || path,
    };
  },
  upsert(data: {
    path: string;
    titleEn?: string;
    titleBn?: string;
    descriptionEn?: string;
    descriptionBn?: string;
    keywords?: string;
    ogImage?: string;
    noIndex?: boolean;
    canonicalUrl?: string;
  }) {
    const { path, ...rest } = data;
    return prisma.seoEntry.upsert({
      where: { path },
      create: { path, ...rest },
      update: rest,
    });
  },
  async remove(path: string) {
    const entry = await prisma.seoEntry.findUnique({ where: { path } });
    if (!entry) throw new HttpError(404, "SEO entry not found");
    return prisma.seoEntry.delete({ where: { path } });
  },
};

export async function dashboardOverview() {
  const [
    productCount,
    publishedProducts,
    orderCount,
    pendingOrders,
    revenueAgg,
    recentOrders,
    lowStock,
    reviewCount,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { published: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: OrderStatus.CANCELLED } },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      include: { items: true },
    }),
    prisma.product.findMany({
      where: { inStock: true, stock: { lte: 5 } },
      take: 6,
      orderBy: { stock: "asc" },
      select: {
        id: true,
        nameEn: true,
        sku: true,
        stock: true,
        slug: true,
      },
    }),
    prisma.review.count({ where: { isPublished: true } }),
  ]);

  const statusGroups = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  return {
    stats: {
      productCount,
      publishedProducts,
      orderCount,
      pendingOrders,
      revenue: revenueAgg._sum.total ?? 0,
      reviewCount,
    },
    statusGroups: statusGroups.map((g) => ({
      status: g.status,
      count: g._count._all,
    })),
    recentOrders,
    lowStock,
  };
}
