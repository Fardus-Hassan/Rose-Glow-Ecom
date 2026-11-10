import type { OrderStatus } from "./constants";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AdminUser;
};

export type DashboardOverview = {
  stats: {
    productCount: number;
    publishedProducts: number;
    orderCount: number;
    pendingOrders: number;
    revenue: number;
    reviewCount: number;
  };
  statusGroups: { status: OrderStatus; count: number }[];
  recentOrders: Order[];
  lowStock: {
    id: string;
    nameEn: string;
    sku: string;
    stock: number;
    slug: string;
  }[];
};

export type Order = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  addressLine: string;
  city: string;
  district: string;
  note?: string | null;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
};

export type OrderItem = {
  id: string;
  productName: string;
  productSku: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type Category = {
  id: string;
  slug: string;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  seoTitleEn: string;
  seoTitleBn: string;
  seoDescriptionEn: string;
  seoDescriptionBn: string;
  sortOrder: number;
  isActive: boolean;
};

export type ProductMedia = {
  id?: string;
  type: "IMAGE" | "VIDEO" | string;
  src: string;
  poster?: string | null;
  altEn?: string;
  altBn?: string;
  sortOrder?: number;
};

export type ProductColor = {
  en: string;
  bn: string;
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  price: number;
  compareAtPrice?: number | null;
  categoryId: string;
  category?: Category;
  stock: number;
  featured: boolean;
  newest: boolean;
  inStock: boolean;
  published: boolean;
  seoTitleEn: string;
  seoTitleBn: string;
  seoDescriptionEn: string;
  seoDescriptionBn: string;
  seoKeywords: string;
  canonicalPath: string;
  ogImage: string;
  materialEn?: string;
  materialBn?: string;
  colors?: ProductColor[] | unknown;
  media?: ProductMedia[];
  landingEnabled?: boolean;
  landingSlug?: string | null;
  landing?: unknown;
};

export type ContentBlock = {
  id: string;
  key: string;
  label: string;
  group?: string | null;
  value: Record<string, unknown>;
};

export type CmsPage = {
  id: string;
  slug: string;
  titleEn: string;
  titleBn: string;
  bodyEn: string;
  bodyBn: string;
  seoTitleEn: string;
  seoTitleBn: string;
  seoDescriptionEn: string;
  seoDescriptionBn: string;
  ogImage: string;
  isPublished: boolean;
};

export type SeoEntry = {
  id: string;
  path: string;
  titleEn: string;
  titleBn: string;
  descriptionEn: string;
  descriptionBn: string;
  keywords: string;
  ogImage: string;
  noIndex: boolean;
  canonicalUrl: string;
};

export type Review = {
  id: string;
  productId?: string | null;
  authorName: string;
  locationEn: string;
  locationBn: string;
  bodyEn: string;
  bodyBn: string;
  rating: number;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  product?: { nameEn: string; slug: string } | null;
};
