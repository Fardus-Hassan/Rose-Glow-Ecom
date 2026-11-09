export type LocalizedString = {
  en: string;
  bn: string;
};

export type ProductMedia = {
  type: "image" | "video";
  src: string;
  poster?: string;
  alt?: LocalizedString;
};

export type ProductCategory =
  | "earrings"
  | "necklaces"
  | "bangles"
  | "rings"
  | "sets";

export type Product = {
  slug: string;
  sku: string;
  name: LocalizedString;
  description: LocalizedString;
  price: number;
  compareAtPrice?: number;
  category: ProductCategory;
  material: LocalizedString;
  colors: LocalizedString[];
  media: ProductMedia[];
  rating: number;
  reviewCount: number;
  soldCount: number;
  featured?: boolean;
  newest?: boolean;
  inStock: boolean;
};

export const products: Product[] = [
  {
    slug: "pearl-bloom-earrings",
    sku: "RG-ER-001",
    name: {
      en: "Pearl Bloom Earrings",
      bn: "পার্ল ব্লুম ইয়াররিংস",
    },
    description: {
      en: "Soft pearl drops framed in rose-gold tone metal. Light enough for all-day wear, luminous enough for evenings.",
      bn: "রোজ-গোল্ড টোন মেটালে মোড়ানো কোমল পার্ল ড্রপ। সারাদিন পরার মতো হালকা, সন্ধ্যার জন্য যথেষ্ট উজ্জ্বল।",
    },
    price: 890,
    compareAtPrice: 1100,
    category: "earrings",
    material: { en: "Alloy · Pearl finish", bn: "অ্যালয় · পার্ল ফিনিশ" },
    colors: [
      { en: "Rose gold", bn: "রোজ গোল্ড" },
      { en: "Pearl", bn: "পার্ল" },
    ],
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80",
        alt: { en: "Pearl bloom earrings", bn: "পার্ল ব্লুম ইয়াররিংস" },
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1200&q=80",
        alt: { en: "Earrings detail", bn: "ইয়াররিংস ডিটেইল" },
      },
      {
        type: "video",
        src: "https://videos.pexels.com/video-files/7626566/7626566-hd_1080_1920_25fps.mp4",
        poster:
          "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=1200&q=80",
        alt: { en: "Earrings on model", bn: "মডেলে ইয়াররিংস" },
      },
    ],
    rating: 4.8,
    reviewCount: 124,
    soldCount: 860,
    featured: true,
    newest: true,
    inStock: true,
  },
  {
    slug: "rose-veil-necklace",
    sku: "RG-NK-014",
    name: {
      en: "Rose Veil Necklace",
      bn: "রোজ ভেইল নেকলেস",
    },
    description: {
      en: "A delicate layered necklace with a soft floral pendant. Designed to sit close to the collarbone.",
      bn: "কোমল ফ্লোরাল পেন্ডান্টসহ ডেলিকেট লেয়ার্ড নেকলেস। কলারবোনের কাছে সুন্দরভাবে বসে।",
    },
    price: 1450,
    category: "necklaces",
    material: { en: "Alloy · Rose finish", bn: "অ্যালয় · রোজ ফিনিশ" },
    colors: [{ en: "Rose gold", bn: "রোজ গোল্ড" }],
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80",
        alt: { en: "Rose veil necklace", bn: "রোজ ভেইল নেকলেস" },
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80",
        alt: { en: "Necklace close-up", bn: "নেকলেস ক্লোজ-আপ" },
      },
      {
        type: "video",
        src: "https://videos.pexels.com/video-files/11353206/11353206-hd_1920_1080_25fps.mp4",
        poster:
          "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    rating: 4.9,
    reviewCount: 98,
    soldCount: 640,
    featured: true,
    inStock: true,
  },
  {
    slug: "dusk-bangle-set",
    sku: "RG-BG-008",
    name: {
      en: "Dusk Bangle Set",
      bn: "ডাস্ক ব্যাঙ্গল সেট",
    },
    description: {
      en: "A stack of slim bangles with brushed rose tone. Mix and match for a soft evening look.",
      bn: "ব্রাশড রোজ টোনের স্লিম ব্যাঙ্গল স্ট্যাক। সন্ধ্যার লুকের জন্য মিক্স অ্যান্ড ম্যাচ করুন।",
    },
    price: 1250,
    compareAtPrice: 1500,
    category: "bangles",
    material: { en: "Alloy · Brushed", bn: "অ্যালয় · ব্রাশড" },
    colors: [{ en: "Rose gold", bn: "রোজ গোল্ড" }],
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=1200&q=80",
        alt: { en: "Dusk bangle set", bn: "ডাস্ক ব্যাঙ্গল সেট" },
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1602173574767-37ac01994b2a?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    rating: 4.7,
    reviewCount: 76,
    soldCount: 520,
    featured: true,
    inStock: true,
  },
  {
    slug: "petal-ring",
    sku: "RG-RG-003",
    name: {
      en: "Petal Ring",
      bn: "পেটাল রিং",
    },
    description: {
      en: "A sculpted petal motif ring with a soft shine. Comfortable band for daily wear.",
      bn: "কোমল চকচকে পেটাল মোটিফ রিং। প্রতিদিন পরার জন্য আরামদায়ক ব্যান্ড।",
    },
    price: 650,
    category: "rings",
    material: { en: "Alloy", bn: "অ্যালয়" },
    colors: [
      { en: "Rose gold", bn: "রোজ গোল্ড" },
      { en: "Silver tone", bn: "সিলভার টোন" },
    ],
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1200&q=80",
        alt: { en: "Petal ring", bn: "পেটাল রিং" },
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1603561591411-07134e71a2a9?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    rating: 4.6,
    reviewCount: 54,
    soldCount: 310,
    newest: true,
    inStock: true,
  },
  {
    slug: "glow-bridal-set",
    sku: "RG-ST-021",
    name: {
      en: "Glow Bridal Set",
      bn: "গ্লো ব্রাইডাল সেট",
    },
    description: {
      en: "Necklace and earring set with intricate floral work. Made for celebrations and framed photos.",
      bn: "ইনট্রিকেট ফ্লোরাল ওয়ার্কসহ নেকলেস ও ইয়াররিংস সেট। উৎসব আর ফ্রেমড ফটোর জন্য।",
    },
    price: 2890,
    compareAtPrice: 3200,
    category: "sets",
    material: { en: "Alloy · Stone accents", bn: "অ্যালয় · স্টোন অ্যাকসেন্ট" },
    colors: [{ en: "Rose gold", bn: "রোজ গোল্ড" }],
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1200&q=80",
        alt: { en: "Glow bridal set", bn: "গ্লো ব্রাইডাল সেট" },
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&w=1200&q=80",
      },
      {
        type: "video",
        src: "https://videos.pexels.com/video-files/8246552/8246552-hd_1920_1080_25fps.mp4",
        poster:
          "https://images.unsplash.com/photo-1601121141461-9d6647bca1ed?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    rating: 4.9,
    reviewCount: 142,
    soldCount: 480,
    featured: true,
    newest: true,
    inStock: true,
  },
  {
    slug: "soft-hoop-earrings",
    sku: "RG-ER-019",
    name: {
      en: "Soft Hoop Earrings",
      bn: "সফট হুপ ইয়াররিংস",
    },
    description: {
      en: "Medium hoops with a satin rose finish. Everyday essential with a quiet shine.",
      bn: "স্যাটিন রোজ ফিনিশের মিডিয়াম হুপ। নরম চকচকে প্রতিদিনের এসেনশিয়াল।",
    },
    price: 720,
    category: "earrings",
    material: { en: "Alloy · Satin", bn: "অ্যালয় · স্যাটিন" },
    colors: [{ en: "Rose gold", bn: "রোজ গোল্ড" }],
    media: [
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1630019852942-f89202989a59?auto=format&fit=crop&w=1200&q=80",
        alt: { en: "Soft hoop earrings", bn: "সফট হুপ ইয়াররিংস" },
      },
      {
        type: "image",
        src: "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?auto=format&fit=crop&w=1200&q=80",
      },
    ],
    rating: 4.5,
    reviewCount: 67,
    soldCount: 390,
    inStock: true,
  },
];

export const categories: ProductCategory[] = [
  "earrings",
  "necklaces",
  "bangles",
  "rings",
  "sets",
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getRelatedProducts(slug: string, limit = 4) {
  const current = getProductBySlug(slug);
  if (!current) return products.slice(0, limit);

  return products
    .filter(
      (product) =>
        product.slug !== slug && product.category === current.category,
    )
    .concat(
      products.filter(
        (product) =>
          product.slug !== slug && product.category !== current.category,
      ),
    )
    .slice(0, limit);
}

export function getCoverMedia(product: Product) {
  const image = product.media.find((item) => item.type === "image");
  if (image) return image;
  const video = product.media.find((item) => item.type === "video");
  return video
    ? {
        type: "image" as const,
        src: video.poster || video.src,
        alt: video.alt,
      }
    : null;
}

export function localize<T extends LocalizedString>(
  value: T,
  locale: string,
): string {
  if (locale === "bn") return value.bn;
  return value.en;
}
