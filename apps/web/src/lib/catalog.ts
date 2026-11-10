import {
  type Product,
  type ProductCategory,
  type ProductMedia,
} from "@/data/products";
import { type Review } from "@/data/reviews";
import { siteContact as staticContact } from "@/data/contact";
import { heroMedia as staticHero } from "@/data/hero";
import { type SocialLink } from "@/data/social";
import { apiFetch, getApiBase } from "./api";
import { mediaUrl } from "./media";

type ApiLocalized = { en: string; bn: string };

type ApiMedia = {
  type: "IMAGE" | "VIDEO" | "image" | "video";
  src: string;
  poster?: string | null;
  altEn?: string;
  altBn?: string;
  sortOrder?: number;
  blurDataUrl?: string | null;
  variants?: {
    thumb?: string;
    card?: string;
    detail?: string;
    full?: string;
  } | null;
};

export type ApiProduct = {
  id?: string;
  slug: string;
  sku: string;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  price: number;
  compareAtPrice?: number | null;
  category?: { slug: string };
  materialEn?: string;
  materialBn?: string;
  colors?: ApiLocalized[] | unknown;
  rating?: number;
  reviewCount?: number;
  soldCount?: number;
  featured?: boolean;
  newest?: boolean;
  inStock?: boolean;
  media?: ApiMedia[];
  seoTitleEn?: string;
  seoTitleBn?: string;
  seoDescriptionEn?: string;
  seoDescriptionBn?: string;
};

type ApiReview = {
  id: string;
  authorName: string;
  locationEn?: string;
  locationBn?: string;
  bodyEn: string;
  bodyBn: string;
  rating: number;
  imageUrls?: string[] | unknown;
};

type ApiContentBlock = {
  key: string;
  value: Record<string, unknown>;
};

type ApiCategory = {
  slug: string;
  nameEn: string;
  nameBn: string;
  isActive?: boolean;
  sortOrder?: number;
};

type ApiPage = {
  slug: string;
  titleEn: string;
  titleBn: string;
  bodyEn: string;
  bodyBn: string;
  seoTitleEn?: string;
  seoTitleBn?: string;
  seoDescriptionEn?: string;
  seoDescriptionBn?: string;
  ogImage?: string;
  isPublished?: boolean;
};

type ApiSeo = {
  path: string;
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  noIndex?: boolean;
  canonicalUrl?: string;
};

export type HeroContent = {
  brand: string;
  headlineEn: string;
  headlineBn: string;
  bodyEn: string;
  bodyBn: string;
  ctaEn: string;
  ctaBn: string;
  mode: "image" | "video";
  image: { desktop: string; mobile: string };
  video?: {
    desktop: { src: string; poster: string };
    mobile: { src: string; poster: string };
  };
};

export type ContactContent = {
  phoneDisplay: string;
  phoneTel: string;
  whatsappDisplay: string;
  whatsappHref: string;
  email: string;
  emailHref: string;
  addressEn: string;
  addressBn: string;
  hoursEn: string;
  hoursBn: string;
};

export type CmsPage = {
  slug: string;
  title: { en: string; bn: string };
  body: { en: string; bn: string };
  seoTitle: { en: string; bn: string };
  seoDescription: { en: string; bn: string };
  ogImage: string;
};

export type CreateStoreOrderInput = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  addressLine: string;
  city: string;
  district: string;
  note?: string;
  shippingFee?: number;
  discount?: number;
  items: Array<{
    productId?: string;
    productName: string;
    productSku: string;
    unitPrice: number;
    quantity: number;
  }>;
};

const CATEGORIES: ProductCategory[] = [
  "earrings",
  "necklaces",
  "bangles",
  "rings",
  "sets",
];

function asCategory(slug?: string): ProductCategory {
  if (slug && CATEGORIES.includes(slug as ProductCategory)) {
    return slug as ProductCategory;
  }
  return "earrings";
}

function asColors(value: unknown): ApiLocalized[] {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is ApiLocalized =>
      !!item &&
      typeof item === "object" &&
      typeof (item as ApiLocalized).en === "string" &&
      typeof (item as ApiLocalized).bn === "string",
  );
}

function asImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

export function mapApiProduct(p: ApiProduct): Product {
  const media: ProductMedia[] = (p.media ?? [])
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((item) => ({
      type:
        String(item.type).toUpperCase() === "VIDEO"
          ? ("video" as const)
          : ("image" as const),
      src: mediaUrl(item.src),
      poster: item.poster ? mediaUrl(item.poster) : undefined,
      blurDataUrl: item.blurDataUrl || undefined,
      variants: item.variants || undefined,
      alt: {
        en: item.altEn ?? p.nameEn,
        bn: item.altBn ?? p.nameBn,
      },
    }));

  return {
    id: p.id,
    slug: p.slug,
    sku: p.sku,
    name: { en: p.nameEn, bn: p.nameBn },
    description: { en: p.descriptionEn, bn: p.descriptionBn },
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? undefined,
    category: asCategory(p.category?.slug),
    material: {
      en: p.materialEn ?? "",
      bn: p.materialBn ?? "",
    },
    colors: asColors(p.colors),
    media,
    rating: p.rating ?? 0,
    reviewCount: p.reviewCount ?? 0,
    soldCount: p.soldCount ?? 0,
    featured: !!p.featured,
    newest: !!p.newest,
    inStock: p.inStock !== false,
  };
}

export function mapApiReview(r: ApiReview): Review {
  return {
    id: r.id,
    name: { en: r.authorName, bn: r.authorName },
    place: {
      en: r.locationEn ?? "",
      bn: r.locationBn || r.locationEn || "",
    },
    quote: { en: r.bodyEn, bn: r.bodyBn || r.bodyEn },
    rating: r.rating,
    images: asImages(r.imageUrls).map(mediaUrl),
  };
}

export type ProductsPage = {
  items: Product[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  facets?: { minPrice: number; maxPrice: number };
};

function unwrapProductItems(
  payload: ApiProduct[] | { items?: ApiProduct[] } | null | undefined,
): ApiProduct[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  return payload.items ?? [];
}

export async function fetchProductsPage(params: {
  page?: number;
  pageSize?: number;
  category?: string;
  featured?: boolean;
  q?: string;
  sort?: string;
  minPrice?: number;
  maxPrice?: number;
} = {}): Promise<ProductsPage> {
  const search = new URLSearchParams();
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 12));
  if (params.category) search.set("category", params.category);
  if (params.featured) search.set("featured", "1");
  if (params.q) search.set("q", params.q);
  if (params.sort) search.set("sort", params.sort);
  if (params.minPrice != null) search.set("minPrice", String(params.minPrice));
  if (params.maxPrice != null) search.set("maxPrice", String(params.maxPrice));

  const res = await apiFetch<{
    items?: ApiProduct[];
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
    facets?: { minPrice: number; maxPrice: number };
  }>(`/products?${search.toString()}`);

  const rows = unwrapProductItems(res);

  return {
    items: rows.map(mapApiProduct),
    page: res?.page ?? params.page ?? 1,
    pageSize: res?.pageSize ?? params.pageSize ?? 12,
    total: res?.total ?? rows.length,
    totalPages: res?.totalPages ?? 1,
    facets: res?.facets,
  };
}

export async function fetchProducts(params?: {
  pageSize?: number;
  featured?: boolean;
  category?: string;
  q?: string;
}): Promise<Product[]> {
  const page = await fetchProductsPage({
    page: 1,
    pageSize: params?.pageSize ?? 48,
    featured: params?.featured,
    category: params?.category,
    q: params?.q,
  });
  return page.items;
}

export async function fetchProductBySlug(
  slug: string,
): Promise<Product | null> {
  const row = await apiFetch<ApiProduct>(`/products/${slug}`);
  if (row) return mapApiProduct(row);
  return null;
}

export async function fetchRelatedProducts(
  slug: string,
  limit = 4,
): Promise<Product[]> {
  const current = await fetchProductBySlug(slug);
  const page = await fetchProductsPage({
    page: 1,
    pageSize: Math.max(limit + 4, 12),
    category: current?.category,
  });
  const related = page.items.filter((p) => p.slug !== slug).slice(0, limit);
  if (related.length >= limit) return related;
  const more = await fetchProductsPage({ page: 1, pageSize: limit + 8 });
  const seen = new Set(related.map((p) => p.slug));
  for (const p of more.items) {
    if (p.slug === slug || seen.has(p.slug)) continue;
    related.push(p);
    if (related.length >= limit) break;
  }
  return related;
}

export async function fetchCategorySlugs(): Promise<ProductCategory[]> {
  const rows = await apiFetch<ApiCategory[]>("/categories?active=1");
  if (!rows?.length) return [];
  return rows
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((c) => c.slug)
    .filter((slug): slug is ProductCategory =>
      CATEGORIES.includes(slug as ProductCategory),
    );
}

export type ReviewsPage = {
  items: Review[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export async function fetchReviewsPage(params: {
  page?: number;
  pageSize?: number;
  productId?: string;
  productSlug?: string;
} = {}): Promise<ReviewsPage> {
  const search = new URLSearchParams();
  search.set("page", String(params.page ?? 1));
  search.set("pageSize", String(params.pageSize ?? 8));
  if (params.productId) search.set("productId", params.productId);
  if (params.productSlug) search.set("productSlug", params.productSlug);

  const res = await apiFetch<{
    items?: ApiReview[];
    page?: number;
    pageSize?: number;
    total?: number;
    totalPages?: number;
  }>(`/reviews?${search.toString()}`);

  const rows = Array.isArray(res) ? res : (res?.items ?? []);

  return {
    items: rows.map(mapApiReview),
    page: res && !Array.isArray(res) ? (res.page ?? 1) : 1,
    pageSize:
      res && !Array.isArray(res) ? (res.pageSize ?? rows.length) : rows.length,
    total: res && !Array.isArray(res) ? (res.total ?? rows.length) : rows.length,
    totalPages: res && !Array.isArray(res) ? (res.totalPages ?? 1) : 1,
  };
}

export async function fetchReviews(params?: {
  pageSize?: number;
  productSlug?: string;
}): Promise<Review[]> {
  const page = await fetchReviewsPage({
    page: 1,
    pageSize: params?.pageSize ?? 8,
    productSlug: params?.productSlug,
  });
  return page.items;
}

export async function fetchHeroContent(): Promise<HeroContent> {
  const section = await apiFetch<{ data?: { hero?: Record<string, string> } }>(
    "/cms/sections/home",
  );
  const hero = section?.data?.hero;
  if (hero) {
    return {
      brand: "Rose Glow",
      headlineEn: hero.headlineEn || "Quiet shine. Lasting presence.",
      headlineBn: hero.headlineBn || "নরম আলো। স্থায়ী উপস্থিতি।",
      bodyEn:
        hero.bodyEn ||
        "Ladies ornaments composed with soft light, fine finish, and everyday grace.",
      bodyBn:
        hero.bodyBn ||
        "কোমল আলো, সূক্ষ্ম ফিনিশ আর প্রতিদিনের কমনীয়তায় সাজানো লেডিস অর্নামেন্টস।",
      ctaEn: hero.ctaEn || "Enter the collection",
      ctaBn: hero.ctaBn || "কালেকশনে প্রবেশ করুন",
      mode: hero.mode === "video" ? "video" : "image",
      image: {
        desktop: hero.imageDesktop || staticHero.image.desktop,
        mobile: hero.imageMobile || staticHero.image.mobile,
      },
      video: {
        desktop: {
          src: hero.videoDesktop || staticHero.video.desktop.src,
          poster: hero.imageDesktop || staticHero.video.desktop.poster,
        },
        mobile: {
          src: hero.videoMobile || staticHero.video.mobile.src,
          poster: hero.imageMobile || staticHero.video.mobile.poster,
        },
      },
    };
  }

  const block = await apiFetch<ApiContentBlock>("/content/blocks/hero");
  const value = (block?.value ?? {}) as Partial<HeroContent> & {
    image?: { desktop?: string; mobile?: string };
    video?: HeroContent["video"];
  };

  return {
    brand: value.brand || "Rose Glow",
    headlineEn: value.headlineEn || "Quiet shine. Lasting presence.",
    headlineBn: value.headlineBn || "নরম আলো। স্থায়ী উপস্থিতি।",
    bodyEn:
      value.bodyEn ||
      "Ladies ornaments composed with soft light, fine finish, and everyday grace.",
    bodyBn:
      value.bodyBn ||
      "কোমল আলো, সূক্ষ্ম ফিনিশ আর প্রতিদিনের কমনীয়তায় সাজানো লেডিস অর্নামেন্টস।",
    ctaEn: value.ctaEn || "Enter the collection",
    ctaBn: value.ctaBn || "কালেকশনে প্রবেশ করুন",
    mode: value.mode === "video" ? "video" : "image",
    image: {
      desktop: value.image?.desktop || staticHero.image.desktop,
      mobile: value.image?.mobile || staticHero.image.mobile,
    },
    video: value.video ?? {
      desktop: { ...staticHero.video.desktop },
      mobile: { ...staticHero.video.mobile },
    },
  };
}

function mapContactValue(value: Record<string, string>): ContactContent {
  const phone = value.phone || staticContact.phoneDisplay;
  const digits = phone.replace(/[^\d+]/g, "");
  const waRaw = value.whatsapp || digits;
  const wa = waRaw.replace(/[^\d]/g, "");

  return {
    phoneDisplay: phone,
    phoneTel: digits.startsWith("+") ? `tel:${digits}` : `tel:+${digits}`,
    whatsappDisplay: value.whatsapp || phone,
    whatsappHref: `https://wa.me/${wa}`,
    email: value.email || staticContact.email,
    emailHref: `mailto:${value.email || staticContact.email}`,
    addressEn: value.addressEn || staticContact.addressEn,
    addressBn: value.addressBn || staticContact.addressBn,
    hoursEn: value.hoursEn || staticContact.hoursEn,
    hoursBn: value.hoursBn || staticContact.hoursBn,
  };
}

export async function fetchContactContent(): Promise<ContactContent> {
  const section = await apiFetch<{
    data?: { contact?: Record<string, string> };
  }>("/cms/sections/settings");
  if (section?.data?.contact) return mapContactValue(section.data.contact);

  const block = await apiFetch<ApiContentBlock>("/content/blocks/contact");
  return mapContactValue((block?.value ?? {}) as Record<string, string>);
}

export async function fetchSocialLinks(): Promise<SocialLink[]> {
  const section = await apiFetch<{
    data?: { social?: Record<string, string> };
  }>("/cms/sections/settings");
  const value =
    section?.data?.social ||
    ((await apiFetch<ApiContentBlock>("/content/blocks/social"))?.value as
      | Record<string, string>
      | undefined);

  if (!value) return [];

  const links: SocialLink[] = [
    {
      id: "instagram",
      href: value.instagram || "",
      label: "Instagram",
    },
    {
      id: "facebook",
      href: value.facebook || "",
      label: "Facebook",
    },
    {
      id: "whatsapp",
      href: value.whatsapp || "",
      label: "WhatsApp",
    },
    {
      id: "tiktok",
      href: value.tiktok || "",
      label: "TikTok",
    },
  ];

  return links.filter((link) => Boolean(link.href));
}

export async function fetchCmsPage(slug: string): Promise<CmsPage | null> {
  const page = await apiFetch<ApiPage>(`/pages/${slug}`);
  if (!page || page.isPublished === false) return null;
  return {
    slug: page.slug,
    title: { en: page.titleEn, bn: page.titleBn },
    body: { en: page.bodyEn, bn: page.bodyBn },
    seoTitle: {
      en: page.seoTitleEn || page.titleEn,
      bn: page.seoTitleBn || page.titleBn,
    },
    seoDescription: {
      en: page.seoDescriptionEn || "",
      bn: page.seoDescriptionBn || "",
    },
    ogImage: page.ogImage || "",
  };
}

export async function fetchSeoMeta(
  path: string,
  locale: "en" | "bn" = "en",
): Promise<ApiSeo | null> {
  return apiFetch<ApiSeo>(
    `/seo?path=${encodeURIComponent(path)}&locale=${locale}`,
  );
}

export const DEFAULT_SHIPPING_FEE = 80;
export const DEFAULT_FREE_SHIPPING_OVER = 2500;

export type ShippingSettings = {
  shippingFeeDefault: number;
  freeShippingOver: number;
  codEnabled: boolean;
  codNoteEn: string;
  codNoteBn: string;
};

export async function fetchShippingSettings(): Promise<ShippingSettings> {
  const section = await apiFetch<{ data?: Record<string, unknown> }>(
    "/cms/sections/shipping",
  );
  const data = section?.data || {};
  const num = (value: unknown, fallback: number) => {
    const n = typeof value === "number" ? value : Number(value);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  };
  return {
    shippingFeeDefault: num(data.shippingFeeDefault, DEFAULT_SHIPPING_FEE),
    freeShippingOver: num(data.freeShippingOver, DEFAULT_FREE_SHIPPING_OVER),
    codEnabled:
      typeof data.codEnabled === "boolean" ? data.codEnabled : true,
    codNoteEn: String(
      data.codNoteEn ?? "Cash on delivery available nationwide.",
    ),
    codNoteBn: String(
      data.codNoteBn ?? "সারাদেশে ক্যাশ অন ডেলিভারি পাওয়া যায়।",
    ),
  };
}

export function computeClientShippingFee(
  subtotal: number,
  settings: Pick<ShippingSettings, "shippingFeeDefault" | "freeShippingOver">,
) {
  if (
    settings.freeShippingOver > 0 &&
    subtotal >= settings.freeShippingOver
  ) {
    return 0;
  }
  return settings.shippingFeeDefault;
}

export async function createStoreOrder(input: CreateStoreOrderInput) {
  const response = await fetch(`${getApiBase()}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...input,
      paymentMethod: "COD",
    }),
  });

  if (!response.ok) {
    let message = "Order failed";
    try {
      const data = (await response.json()) as { message?: string | string[] };
      if (typeof data.message === "string") message = data.message;
      else if (Array.isArray(data.message)) message = data.message.join(", ");
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return response.json() as Promise<{
    id: string;
    orderNumber: string;
    total: number;
  }>;
}
