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
    slug: "glow-bridal-set",
    sku: "RG-ST-021",
    name: {
      en: "Glow Bridal Set",
      bn: "গ্লো ব্রাইডাল সেট",
    },
    description: {
      en: "Matching necklace and earring set with open lattice spheres and heart-charm tassels. Made for celebrations and framed photos.",
      bn: "ওপেন ল্যাটিস স্ফিয়ার ও হার্ট-চার্ম ট্যাসেলসহ ম্যাচিং নেকলেস ও ইয়াররিংস সেট। উৎসব আর ফ্রেমড ফটোর জন্য।",
    },
    price: 2890,
    compareAtPrice: 3200,
    category: "sets",
    material: { en: "Alloy · Filigree gold", bn: "অ্যালয় · ফিলিগ্রি গোল্ড" },
    colors: [{ en: "Gold", bn: "গোল্ড" }],
    media: [
      {
        type: "image",
        src: "/products/filigree-bridal-set.jpg",
        alt: { en: "Glow bridal set", bn: "গ্লো ব্রাইডাল সেট" },
      },
      {
        type: "image",
        src: "/products/filigree-earrings.jpg",
        alt: { en: "Bridal earrings", bn: "ব্রাইডাল ইয়াররিংস" },
      },
      {
        type: "image",
        src: "/products/filigree-detail.jpg",
        alt: { en: "Filigree detail", bn: "ফিলিগ্রি ডিটেইল" },
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
    slug: "pearl-bloom-earrings",
    sku: "RG-ER-001",
    name: {
      en: "Pearl Bloom Earrings",
      bn: "পার্ল ব্লুম ইয়াররিংস",
    },
    description: {
      en: "Soft pearl drops framed in polished gold tone metal. Light enough for all-day wear, luminous enough for evenings.",
      bn: "পালিশড গোল্ড টোন মেটালে মোড়ানো কোমল পার্ল ড্রপ। সারাদিন পরার মতো হালকা, সন্ধ্যার জন্য যথেষ্ট উজ্জ্বল।",
    },
    price: 890,
    compareAtPrice: 1100,
    category: "earrings",
    material: { en: "Alloy · Pearl finish", bn: "অ্যালয় · পার্ল ফিনিশ" },
    colors: [
      { en: "Gold", bn: "গোল্ড" },
      { en: "Pearl", bn: "পার্ল" },
    ],
    media: [
      {
        type: "image",
        src: "/products/pearl-gold-earrings.jpg",
        alt: { en: "Pearl bloom earrings", bn: "পার্ল ব্লুম ইয়াররিংস" },
      },
      {
        type: "image",
        src: "/products/filigree-detail.jpg",
        alt: { en: "Earrings detail", bn: "ইয়াররিংস ডিটেইল" },
      },
      {
        type: "video",
        src: "https://videos.pexels.com/video-files/7626566/7626566-hd_1080_1920_25fps.mp4",
        poster: "/products/pearl-gold-earrings.jpg",
        alt: { en: "Pearl bloom video", bn: "পার্ল ব্লুম ভিডিও" },
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
      en: "Filigree Veil Necklace",
      bn: "ফিলিগ্রি ভেইল নেকলেস",
    },
    description: {
      en: "A delicate gold necklace with an open lattice pendant and heart-charm tassels. Designed to sit close to the collarbone.",
      bn: "ওপেন ল্যাটিস পেন্ডান্ট ও হার্ট-চার্ম ট্যাসেলসহ ডেলিকেট গোল্ড নেকলেস। কলারবোনের কাছে সুন্দরভাবে বসে।",
    },
    price: 1450,
    category: "necklaces",
    material: { en: "Alloy · Gold finish", bn: "অ্যালয় · গোল্ড ফিনিশ" },
    colors: [{ en: "Gold", bn: "গোল্ড" }],
    media: [
      {
        type: "image",
        src: "/products/filigree-necklace.jpg",
        alt: { en: "Filigree veil necklace", bn: "ফিলিগ্রি ভেইল নেকলেস" },
      },
      {
        type: "image",
        src: "/products/filigree-detail.jpg",
        alt: { en: "Necklace close-up", bn: "নেকলেস ক্লোজ-আপ" },
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
      en: "A stack of slim gold-tone bangles with brushed and polished finishes. Mix and match for a soft evening look.",
      bn: "ব্রাশড ও পালিশড ফিনিশের স্লিম গোল্ড-টোন ব্যাঙ্গল স্ট্যাক। সন্ধ্যার লুকের জন্য মিক্স অ্যান্ড ম্যাচ করুন।",
    },
    price: 1250,
    compareAtPrice: 1500,
    category: "bangles",
    material: { en: "Alloy · Brushed gold", bn: "অ্যালয় · ব্রাশড গোল্ড" },
    colors: [{ en: "Gold", bn: "গোল্ড" }],
    media: [
      {
        type: "image",
        src: "/products/gold-bangles.jpg",
        alt: { en: "Dusk bangle set", bn: "ডাস্ক ব্যাঙ্গল সেট" },
      },
      {
        type: "image",
        src: "/products/filigree-detail.jpg",
        alt: { en: "Bangle detail", bn: "ব্যাঙ্গল ডিটেইল" },
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
      en: "Lattice Petal Ring",
      bn: "ল্যাটিস পেটাল রিং",
    },
    description: {
      en: "A sculpted filigree motif ring with a soft gold shine. Comfortable band for daily wear.",
      bn: "কোমল গোল্ড চকচকে ফিলিগ্রি মোটিফ রিং। প্রতিদিন পরার জন্য আরামদায়ক ব্যান্ড।",
    },
    price: 650,
    category: "rings",
    material: { en: "Alloy · Gold finish", bn: "অ্যালয় · গোল্ড ফিনিশ" },
    colors: [
      { en: "Gold", bn: "গোল্ড" },
      { en: "Rose gold", bn: "রোজ গোল্ড" },
    ],
    media: [
      {
        type: "image",
        src: "/products/filigree-ring.jpg",
        alt: { en: "Lattice petal ring", bn: "ল্যাটিস পেটাল রিং" },
      },
      {
        type: "image",
        src: "/products/filigree-detail.jpg",
        alt: { en: "Ring detail", bn: "রিং ডিটেইল" },
      },
    ],
    rating: 4.6,
    reviewCount: 54,
    soldCount: 310,
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
      en: "Medium hoops with a satin gold finish. Everyday essential with a quiet shine.",
      bn: "স্যাটিন গোল্ড ফিনিশের মিডিয়াম হুপ। নরম চকচকে প্রতিদিনের এসেনশিয়াল।",
    },
    price: 720,
    category: "earrings",
    material: { en: "Alloy · Satin gold", bn: "অ্যালয় · স্যাটিন গোল্ড" },
    colors: [{ en: "Gold", bn: "গোল্ড" }],
    media: [
      {
        type: "image",
        src: "/products/gold-hoops.jpg",
        alt: { en: "Soft hoop earrings", bn: "সফট হুপ ইয়াররিংস" },
      },
      {
        type: "image",
        src: "/products/filigree-detail.jpg",
        alt: { en: "Hoop detail", bn: "হুপ ডিটেইল" },
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
