/**
 * Full local demo dataset — products, CMS sections, reviews, landings.
 * Safe for local DB only. Soft-deletes junk pag-test products.
 *
 * Run: pnpm --filter web exec tsx prisma/seed-local-demo.ts
 */
import {
  MediaType,
  Prisma,
  PrismaClient,
  Role,
} from "@prisma/client";
import * as bcrypt from "bcrypt";
import { sectionDefaults } from "../src/lib/cms/defaults";

const prisma = new PrismaClient();

const R2 =
  (
    process.env.R2_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
    "https://pub-19c3bb11c2e84d748e4f08a3800f13ab.r2.dev"
  ).replace(/\/$/, "");

function media(path: string) {
  if (path.startsWith("http")) return path;
  return `${R2}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Soft editorial studio shots — cream/white surfaces for Quiet Luxury theme */
const U = (id: string, w = 1200) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

const IMG = {
  bridal: U("photo-1515562141207-7a88fb7ce338"),
  earrings: U("photo-1535632066927-ab7c9ab60908"),
  necklace: U("photo-1599643478518-a784e5dc4c8f"),
  ring: U("photo-1605100804763-247f67b3557e"),
  bangles: U("photo-1611591437281-460bfbe1220a"),
  hoops: U("photo-1630019852942-f89202989a59"),
  pearl: U("photo-1588444837495-c6cfeb53ea07"),
  velvet: U("photo-1617038260897-41a1f14a8ca0"),
  lifestyle: U("photo-1596944924616-7b38e7cfac36", 1600),
  heroDesktop: U("photo-1617038260897-41a1f14a8ca0", 1800),
  heroMobile: U("photo-1515562141207-7a88fb7ce338", 1200),
  logo: media("/brand/logo.png"),
};

type DemoProduct = {
  slug: string;
  sku: string;
  nameEn: string;
  nameBn: string;
  shortEn: string;
  shortBn: string;
  descriptionEn: string;
  descriptionBn: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  materialEn: string;
  materialBn: string;
  colors: Array<{ en: string; bn: string }>;
  rating: number;
  reviewCount: number;
  soldCount: number;
  stock: number;
  featured?: boolean;
  newest?: boolean;
  media: Array<{ src: string; altEn: string; altBn: string }>;
  variants?: Array<{
    sku: string;
    nameEn: string;
    nameBn: string;
    price: number;
    compareAtPrice?: number;
    stock: number;
    image?: string;
  }>;
  landing?: {
    slug: string;
    eyebrowEn: string;
    eyebrowBn: string;
    headlineEn: string;
    headlineBn: string;
    bodyEn: string;
    bodyBn: string;
    points: Array<{ en: string; bn: string }>;
    relatedSlugs: string[];
  };
};

const products: DemoProduct[] = [
  {
    slug: "glow-bridal-set",
    sku: "RG-ST-021",
    nameEn: "Glow Bridal Set",
    nameBn: "গ্লো ব্রাইডাল সেট",
    shortEn: "Necklace + earrings with lattice spheres and heart tassels.",
    shortBn: "ল্যাটিস স্ফিয়ার ও হার্ট ট্যাসেলসহ নেকলেস + ইয়াররিংস।",
    descriptionEn:
      "<p>Matching necklace and earring set with open lattice spheres and heart-charm tassels. Made for celebrations, receptions, and framed photos.</p><p>Lightweight alloy with a warm gold finish that holds its glow through the evening.</p>",
    descriptionBn:
      "<p>ওপেন ল্যাটিস স্ফিয়ার ও হার্ট-চার্ম ট্যাসেলসহ ম্যাচিং নেকলেস ও ইয়াররিংস সেট। উৎসব, রিসেপশন আর ফ্রেমড ফটোর জন্য।</p><p>হালকা অ্যালয়, উষ্ণ গোল্ড ফিনিশ — সারা সন্ধ্যা গ্লো ধরে রাখে।</p>",
    price: 2890,
    compareAtPrice: 3490,
    category: "sets",
    materialEn: "Alloy · Filigree gold",
    materialBn: "অ্যালয় · ফিলিগ্রি গোল্ড",
    colors: [{ en: "Gold", bn: "গোল্ড" }],
    rating: 4.9,
    reviewCount: 48,
    soldCount: 520,
    stock: 24,
    featured: true,
    newest: true,
    media: [
      { src: IMG.bridal, altEn: "Glow bridal set", altBn: "গ্লো ব্রাইডাল সেট" },
      { src: IMG.earrings, altEn: "Bridal earrings", altBn: "ব্রাইডাল ইয়াররিংস" },
      { src: IMG.velvet, altEn: "Set on velvet", altBn: "ভেলভেটে সেট" },
    ],
    landing: {
      slug: "glow-bridal-set",
      eyebrowEn: "Wedding edit",
      eyebrowBn: "ওয়েডিং এডিট",
      headlineEn: "Glow Bridal Set — quiet shine for your day",
      headlineBn: "গ্লো ব্রাইডাল সেট — আপনার দিনের নরম আলো",
      bodyEn:
        "<p>Order on COD. Tell us piece, quantity, and address — we confirm on call / WhatsApp.</p>",
      bodyBn:
        "<p>COD-তে অর্ডার করুন। পিস, পরিমাণ আর ঠিকানা বলুন — ফোন / WhatsApp-এ কনফার্ম করব।</p>",
      points: [
        { en: "Necklace + matching earrings", bn: "নেকলেস + ম্যাচিং ইয়াররিংস" },
        { en: "Cash on delivery nationwide", bn: "সারাদেশে ক্যাশ অন ডেলিভারি" },
        { en: "Careful gift-ready packing", bn: "গিফট-রেডি যত্নসহ প্যাকিং" },
      ],
      relatedSlugs: ["pearl-bloom-earrings", "rose-veil-necklace", "dusk-bangle-set"],
    },
  },
  {
    slug: "pearl-bloom-earrings",
    sku: "RG-ER-001",
    nameEn: "Pearl Bloom Earrings",
    nameBn: "পার্ল ব্লুম ইয়াররিংস",
    shortEn: "Soft pearl drops in polished gold tone.",
    shortBn: "পালিশড গোল্ড টোনের কোমল পার্ল ড্রপ।",
    descriptionEn:
      "<p>Soft pearl drops framed in polished gold-tone metal. Light enough for all-day wear, luminous enough for evenings.</p>",
    descriptionBn:
      "<p>পালিশড গোল্ড টোন মেটালে মোড়ানো কোমল পার্ল ড্রপ। সারাদিন পরার মতো হালকা, সন্ধ্যার জন্য যথেষ্ট উজ্জ্বল।</p>",
    price: 990,
    compareAtPrice: 1290,
    category: "earrings",
    materialEn: "Alloy · Pearl finish",
    materialBn: "অ্যালয় · পার্ল ফিনিশ",
    colors: [
      { en: "Gold", bn: "গোল্ড" },
      { en: "Pearl", bn: "পার্ল" },
    ],
    rating: 4.8,
    reviewCount: 124,
    soldCount: 860,
    stock: 40,
    featured: true,
    newest: true,
    media: [
      { src: IMG.pearl, altEn: "Pearl bloom earrings", altBn: "পার্ল ব্লুম ইয়াররিংস" },
      { src: IMG.earrings, altEn: "Side view", altBn: "সাইড ভিউ" },
    ],
    variants: [
      {
        sku: "RG-ER-001-G",
        nameEn: "Gold",
        nameBn: "গোল্ড",
        price: 990,
        compareAtPrice: 1290,
        stock: 22,
        image: IMG.pearl,
      },
      {
        sku: "RG-ER-001-P",
        nameEn: "Pearl white",
        nameBn: "পার্ল হোয়াইট",
        price: 1090,
        stock: 18,
        image: IMG.pearl,
      },
    ],
  },
  {
    slug: "rose-veil-necklace",
    sku: "RG-NK-014",
    nameEn: "Filigree Veil Necklace",
    nameBn: "ফিলিগ্রি ভেইল নেকলেস",
    shortEn: "Open lattice pendant with heart-charm tassels.",
    shortBn: "হার্ট-চার্ম ট্যাসেলসহ ওপেন ল্যাটিস পেন্ডান্ট।",
    descriptionEn:
      "<p>A delicate gold necklace with an open lattice pendant and heart-charm tassels. Sits close to the collarbone.</p>",
    descriptionBn:
      "<p>ওপেন ল্যাটিস পেন্ডান্ট ও হার্ট-চার্ম ট্যাসেলসহ ডেলিকেট গোল্ড নেকলেস। কলারবোনের কাছে সুন্দরভাবে বসে।</p>",
    price: 1450,
    compareAtPrice: 1790,
    category: "necklaces",
    materialEn: "Alloy · Gold finish",
    materialBn: "অ্যালয় · গোল্ড ফিনিশ",
    colors: [{ en: "Gold", bn: "গোল্ড" }],
    rating: 4.9,
    reviewCount: 98,
    soldCount: 640,
    stock: 18,
    featured: true,
    media: [
      { src: IMG.necklace, altEn: "Filigree veil necklace", altBn: "ফিলিগ্রি ভেইল নেকলেস" },
      { src: IMG.velvet, altEn: "Necklace detail", altBn: "নেকলেস ডিটেইল" },
    ],
  },
  {
    slug: "dusk-bangle-set",
    sku: "RG-BG-008",
    nameEn: "Dusk Bangle Set",
    nameBn: "ডাস্ক ব্যাঙ্গল সেট",
    shortEn: "Slim brushed and polished gold-tone stack.",
    shortBn: "ব্রাশড ও পালিশড গোল্ড-টোন স্লিম স্ট্যাক।",
    descriptionEn:
      "<p>A stack of slim gold-tone bangles with brushed and polished finishes. Mix for a soft evening look.</p>",
    descriptionBn:
      "<p>ব্রাশড ও পালিশড ফিনিশের স্লিম গোল্ড-টোন ব্যাঙ্গল স্ট্যাক। সন্ধ্যার লুকের জন্য মিক্স করুন।</p>",
    price: 1250,
    compareAtPrice: 1500,
    category: "bangles",
    materialEn: "Alloy · Brushed gold",
    materialBn: "অ্যালয় · ব্রাশড গোল্ড",
    colors: [{ en: "Gold", bn: "গোল্ড" }],
    rating: 4.7,
    reviewCount: 76,
    soldCount: 520,
    stock: 22,
    featured: true,
    media: [
      { src: IMG.bangles, altEn: "Dusk bangle set", altBn: "ডাস্ক ব্যাঙ্গল সেট" },
    ],
  },
  {
    slug: "petal-ring",
    sku: "RG-RG-003",
    nameEn: "Lattice Petal Ring",
    nameBn: "ল্যাটিস পেটাল রিং",
    shortEn: "Sculpted filigree motif, everyday comfort band.",
    shortBn: "ফিলিগ্রি মোটিফ, প্রতিদিনের আরামদায়ক ব্যান্ড।",
    descriptionEn:
      "<p>A sculpted filigree motif ring with a soft gold shine. Comfortable band for daily wear.</p>",
    descriptionBn:
      "<p>কোমল গোল্ড চকচকে ফিলিগ্রি মোটিফ রিং। প্রতিদিন পরার জন্য আরামদায়ক ব্যান্ড।</p>",
    price: 650,
    compareAtPrice: 850,
    category: "rings",
    materialEn: "Alloy · Gold finish",
    materialBn: "অ্যালয় · গোল্ড ফিনিশ",
    colors: [
      { en: "Gold", bn: "গোল্ড" },
      { en: "Rose gold", bn: "রোজ গোল্ড" },
    ],
    rating: 4.6,
    reviewCount: 54,
    soldCount: 310,
    stock: 35,
    newest: true,
    featured: true,
    media: [
      { src: IMG.ring, altEn: "Lattice petal ring", altBn: "ল্যাটিস পেটাল রিং" },
    ],
    variants: [
      {
        sku: "RG-RG-003-G",
        nameEn: "Gold · Size adjustable",
        nameBn: "গোল্ড · অ্যাডজাস্টেবল",
        price: 650,
        stock: 20,
        image: IMG.ring,
      },
      {
        sku: "RG-RG-003-R",
        nameEn: "Rose gold · Size adjustable",
        nameBn: "রোজ গোল্ড · অ্যাডজাস্টেবল",
        price: 690,
        stock: 15,
        image: IMG.ring,
      },
    ],
  },
  {
    slug: "soft-hoop-earrings",
    sku: "RG-ER-019",
    nameEn: "Soft Hoop Earrings",
    nameBn: "সফট হুপ ইয়াররিংস",
    shortEn: "Medium satin-gold hoops for everyday.",
    shortBn: "প্রতিদিনের জন্য মিডিয়াম স্যাটিন-গোল্ড হুপ।",
    descriptionEn:
      "<p>Medium hoops with a satin gold finish. Everyday essential with a quiet shine.</p>",
    descriptionBn:
      "<p>স্যাটিন গোল্ড ফিনিশের মিডিয়াম হুপ। নরম চকচকে প্রতিদিনের এসেনশিয়াল।</p>",
    price: 720,
    compareAtPrice: 950,
    category: "earrings",
    materialEn: "Alloy · Satin gold",
    materialBn: "অ্যালয় · স্যাটিন গোল্ড",
    colors: [{ en: "Gold", bn: "গোল্ড" }],
    rating: 4.5,
    reviewCount: 67,
    soldCount: 390,
    stock: 28,
    featured: true,
    media: [
      { src: IMG.hoops, altEn: "Soft hoop earrings", altBn: "সফট হুপ ইয়াররিংস" },
    ],
  },
  {
    slug: "atelier-drop-earrings",
    sku: "RG-ER-027",
    nameEn: "Atelier Drop Earrings",
    nameBn: "অ্যাটেলিয়ের ড্রপ ইয়াররিংস",
    shortEn: "Long filigree drops with quiet movement.",
    shortBn: "নরম মুভমেন্টসহ লম্বা ফিলিগ্রি ড্রপ।",
    descriptionEn:
      "<p>Elongated filigree drops that catch soft light with every turn. Pair with an open neckline.</p>",
    descriptionBn:
      "<p>লম্বা ফিলিগ্রি ড্রপ — প্রতিটি ঘুরে নরম আলো ধরে। ওপেন নেকলাইনসের সাথে পারফেক্ট।</p>",
    price: 1180,
    compareAtPrice: 1450,
    category: "earrings",
    materialEn: "Alloy · Filigree gold",
    materialBn: "অ্যালয় · ফিলিগ্রি গোল্ড",
    colors: [{ en: "Gold", bn: "গোল্ড" }],
    rating: 4.8,
    reviewCount: 41,
    soldCount: 210,
    stock: 16,
    featured: true,
    newest: true,
    media: [
      { src: IMG.earrings, altEn: "Atelier drop earrings", altBn: "অ্যাটেলিয়ের ড্রপ" },
      { src: IMG.bridal, altEn: "Worn look", altBn: "পরার লুক" },
    ],
  },
  {
    slug: "collarbone-chain",
    sku: "RG-NK-022",
    nameEn: "Collarbone Chain",
    nameBn: "কলারবোন চেইন",
    shortEn: "Minimal chain for layering or alone.",
    shortBn: "লেয়ারিং বা একলা পরার মিনিমাল চেইন।",
    descriptionEn:
      "<p>A fine collarbone chain with a clean clasp. Layer with the Filigree Veil or wear alone.</p>",
    descriptionBn:
      "<p>ক্লিন ক্ল্যাস্পসহ ফাইন কলারবোন চেইন। ফিলিগ্রি ভেইলের সাথে লেয়ার করুন বা একলা পরুন।</p>",
    price: 890,
    category: "necklaces",
    materialEn: "Alloy · Gold finish",
    materialBn: "অ্যালয় · গোল্ড ফিনিশ",
    colors: [{ en: "Gold", bn: "গোল্ড" }],
    rating: 4.4,
    reviewCount: 33,
    soldCount: 180,
    stock: 30,
    newest: true,
    media: [
      { src: IMG.necklace, altEn: "Collarbone chain", altBn: "কলারবোন চেইন" },
    ],
  },
  {
    slug: "velvet-night-set",
    sku: "RG-ST-030",
    nameEn: "Velvet Night Set",
    nameBn: "ভেলভেট নাইট সেট",
    shortEn: "Statement set photographed on dark velvet.",
    shortBn: "ডার্ক ভেলভেটে ধরা স্টেটমেন্ট সেট।",
    descriptionEn:
      "<p>A richer set for evenings — necklace and earrings composed for soft contrast against dark outfits.</p>",
    descriptionBn:
      "<p>সন্ধ্যার জন্য রিচার সেট — ডার্ক আউটফিটের সাথে নরম কনট্রাস্ট।</p>",
    price: 2590,
    compareAtPrice: 3100,
    category: "sets",
    materialEn: "Alloy · Gold finish",
    materialBn: "অ্যালয় · গোল্ড ফিনিশ",
    colors: [{ en: "Gold", bn: "গোল্ড" }],
    rating: 4.7,
    reviewCount: 29,
    soldCount: 140,
    stock: 12,
    featured: true,
    media: [
      { src: IMG.velvet, altEn: "Velvet night set", altBn: "ভেলভেট নাইট সেট" },
      { src: IMG.bridal, altEn: "Full set", altBn: "ফুল সেট" },
      { src: IMG.earrings, altEn: "Earrings", altBn: "ইয়াররিংস" },
    ],
    landing: {
      slug: "velvet-night-set",
      eyebrowEn: "Evening edit",
      eyebrowBn: "ইভনিং এডিট",
      headlineEn: "Velvet Night Set — for soft evening light",
      headlineBn: "ভেলভেট নাইট সেট — সন্ধ্যার নরম আলোর জন্য",
      bodyEn: "<p>COD across Bangladesh. Confirm on call after you order.</p>",
      bodyBn: "<p>সারাদেশে COD। অর্ডারের পর ফোনে কনফার্ম।</p>",
      points: [
        { en: "Necklace + earrings", bn: "নেকলেস + ইয়াররিংস" },
        { en: "Gift-ready box", bn: "গিফট-রেডি বক্স" },
        { en: "Easy exchange support", bn: "সহজ এক্সচেঞ্জ সাপোর্ট" },
      ],
      relatedSlugs: ["glow-bridal-set", "atelier-drop-earrings", "dusk-bangle-set"],
    },
  },
  {
    slug: "daily-glow-bangle",
    sku: "RG-BG-012",
    nameEn: "Daily Glow Bangle",
    nameBn: "ডেইলি গ্লো ব্যাঙ্গল",
    shortEn: "Single polished bangle for everyday stack.",
    shortBn: "প্রতিদিনের স্ট্যাকের জন্য সিঙ্গেল পালিশড ব্যাঙ্গল।",
    descriptionEn:
      "<p>One polished gold-tone bangle — stack with Dusk or wear alone for a clean line.</p>",
    descriptionBn:
      "<p>একটি পালিশড গোল্ড-টোন ব্যাঙ্গল — ডাস্কের সাথে স্ট্যাক করুন বা একলা পরুন।</p>",
    price: 480,
    category: "bangles",
    materialEn: "Alloy · Polished gold",
    materialBn: "অ্যালয় · পালিশড গোল্ড",
    colors: [{ en: "Gold", bn: "গোল্ড" }],
    rating: 4.3,
    reviewCount: 22,
    soldCount: 95,
    stock: 40,
    newest: true,
    media: [
      { src: IMG.bangles, altEn: "Daily glow bangle", altBn: "ডেইলি গ্লো ব্যাঙ্গল" },
    ],
  },
];

async function ensureCategories() {
  const defs = [
    { slug: "earrings", nameEn: "Earrings", nameBn: "ইয়াররিংস", sortOrder: 1 },
    { slug: "necklaces", nameEn: "Necklaces", nameBn: "নেকলেস", sortOrder: 2 },
    { slug: "bangles", nameEn: "Bangles", nameBn: "চুড়ি / ব্যাঙ্গল", sortOrder: 3 },
    { slug: "rings", nameEn: "Rings", nameBn: "রিং", sortOrder: 4 },
    { slug: "sets", nameEn: "Sets", nameBn: "সেট", sortOrder: 5 },
  ];
  const map = new Map<string, string>();
  for (const cat of defs) {
    const existing = await prisma.category.findFirst({
      where: { slug: cat.slug, deletedAt: null },
    });
    const row = existing
      ? await prisma.category.update({
          where: { id: existing.id },
          data: {
            nameEn: cat.nameEn,
            nameBn: cat.nameBn,
            sortOrder: cat.sortOrder,
            isActive: true,
          },
        })
      : await prisma.category.create({
          data: {
            ...cat,
            isActive: true,
            seoTitleEn: `${cat.nameEn} | Rose Glow`,
            seoTitleBn: `${cat.nameBn} | Rose Glow`,
            seoDescriptionEn: `Shop ${cat.nameEn.toLowerCase()} from Rose Glow.`,
            seoDescriptionBn: `Rose Glow থেকে ${cat.nameBn} কিনুন।`,
          },
        });
    map.set(cat.slug, row.id);
  }
  return map;
}

async function softDeleteJunk() {
  const junk = await prisma.product.findMany({
    where: {
      deletedAt: null,
      OR: [
        { slug: { startsWith: "pag-test" } },
        { slug: { startsWith: "test-" } },
        { nameEn: { contains: "test", mode: "insensitive" } },
      ],
    },
    select: { id: true, slug: true },
  });
  if (!junk.length) return 0;
  const now = new Date();
  await prisma.product.updateMany({
    where: { id: { in: junk.map((j) => j.id) } },
    data: { deletedAt: now, published: false, featured: false },
  });
  console.log(`Soft-deleted ${junk.length} test products`);
  return junk.length;
}

async function upsertProduct(
  p: DemoProduct,
  categories: Map<string, string>,
) {
  const categoryId = categories.get(p.category)!;
  const existing = await prisma.product.findFirst({
    where: { slug: p.slug },
  });

  const landing = p.landing
    ? {
        landingEnabled: true,
        landingSlug: p.landing.slug,
        landing: {
          eyebrowEn: p.landing.eyebrowEn,
          eyebrowBn: p.landing.eyebrowBn,
          headlineEn: p.landing.headlineEn,
          headlineBn: p.landing.headlineBn,
          bodyEn: p.landing.bodyEn,
          bodyBn: p.landing.bodyBn,
          points: p.landing.points,
          relatedSlugs: p.landing.relatedSlugs,
          metaTitleEn: `${p.nameEn} | Rose Glow`,
          metaTitleBn: `${p.nameBn} | Rose Glow`,
          metaDescriptionEn: p.shortEn,
          metaDescriptionBn: p.shortBn,
        },
      }
    : {
        landingEnabled: false,
        landingSlug: null as string | null,
        landing: {},
      };

  const baseData = {
    sku: p.sku,
    nameEn: p.nameEn,
    nameBn: p.nameBn,
    shortDescriptionEn: p.shortEn,
    shortDescriptionBn: p.shortBn,
    descriptionEn: p.descriptionEn,
    descriptionBn: p.descriptionBn,
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? null,
    categoryId,
    materialEn: p.materialEn,
    materialBn: p.materialBn,
    colors: p.colors,
    rating: p.rating,
    reviewCount: p.reviewCount,
    soldCount: p.soldCount,
    stock: p.stock,
    featured: !!p.featured,
    newest: !!p.newest,
    inStock: true,
    published: true,
    deletedAt: null,
    seoTitleEn: `${p.nameEn} | Rose Glow`,
    seoTitleBn: `${p.nameBn} | Rose Glow`,
    seoDescriptionEn: p.shortEn,
    seoDescriptionBn: p.shortBn,
    seoKeywords: `${p.nameEn}, Rose Glow, ornaments, ${p.category}`,
    canonicalPath: `/product/${p.slug}`,
    ogImage: p.media[0]?.src ?? "",
    ...landing,
  };

  const row = existing
    ? await prisma.product.update({
        where: { id: existing.id },
        data: baseData,
      })
    : await prisma.product.create({
        data: {
          slug: p.slug,
          ...baseData,
        },
      });

  await prisma.productMedia.deleteMany({ where: { productId: row.id } });
  await prisma.productMedia.createMany({
    data: p.media.map((m, i) => ({
      productId: row.id,
      type: MediaType.IMAGE,
      src: m.src,
      altEn: m.altEn,
      altBn: m.altBn,
      sortOrder: i,
    })),
  });

  await prisma.productVariant.deleteMany({ where: { productId: row.id } });
  if (p.variants?.length) {
    for (const [i, v] of p.variants.entries()) {
      await prisma.productVariant.create({
        data: {
          productId: row.id,
          sku: v.sku,
          nameEn: v.nameEn,
          nameBn: v.nameBn,
          price: v.price,
          compareAtPrice: v.compareAtPrice ?? null,
          stock: v.stock,
          image: v.image || "",
          sortOrder: i,
        },
      });
    }
  }

  return row.id;
}

async function seedReviews(productIds: Record<string, string>) {
  await prisma.review.deleteMany({
    where: {
      OR: [
        { authorName: { in: ["Nusrat A.", "Farzana K.", "Sadia T.", "Rehena", "Rumi", "Sanjida Akter", "Mitu R."] } },
      ],
    },
  });

  const reviews = [
    {
      productId: productIds["pearl-bloom-earrings"],
      authorName: "Nusrat A.",
      locationEn: "Dhaka",
      locationBn: "ঢাকা",
      bodyEn:
        "The earrings feel light and look expensive in person. Packaging was beautiful too — I wore them to a family dinner the same week.",
      bodyBn:
        "ইয়াররিংস খুব হালকা আর লাইভে দেখতে প্রিমিয়াম। প্যাকেজিংও সুন্দর — একই সপ্তাহে ফ্যামিলি ডিনারে পরেছি।",
      rating: 5,
      imageUrls: [IMG.pearl],
      showOnHome: true,
      sortOrder: 1,
    },
    {
      productId: productIds["rose-veil-necklace"],
      authorName: "Farzana K.",
      locationEn: "Chattogram",
      locationBn: "চট্টগ্রাম",
      bodyEn:
        "Ordered on COD without worry. The necklace matched the photos and arrived safely packed.",
      bodyBn:
        "COD-তে নিশ্চিন্তে অর্ডার করেছি। নেকলেস ছবির মতোই, নিরাপদে প্যাক করে পৌঁছেছে।",
      rating: 5,
      imageUrls: [IMG.necklace],
      showOnHome: true,
      sortOrder: 2,
    },
    {
      productId: productIds["glow-bridal-set"],
      authorName: "Sadia T.",
      locationEn: "Rajshahi",
      locationBn: "রাজশাহী",
      bodyEn:
        "The bridal set looked graceful in photos and even better when worn. Soft shine, not flashy.",
      bodyBn:
        "ব্রাইডাল সেট ফটোতে সুন্দর, পরলে আরও কমনীয়। নরম চকচক, চটাচটে নয়।",
      rating: 5,
      imageUrls: [IMG.bridal, IMG.earrings],
      showOnHome: true,
      sortOrder: 3,
    },
    {
      productId: productIds["dusk-bangle-set"],
      authorName: "Rehena",
      locationEn: "Sylhet",
      locationBn: "সিলেট",
      bodyEn:
        "Stack sits comfortably and the finish stayed nice after a full day out.",
      bodyBn:
        "স্ট্যাক আরামদায়ক, সারাদিন পরার পরও ফিনিশ ভালো ছিল।",
      rating: 5,
      imageUrls: [IMG.bangles],
      showOnHome: true,
      sortOrder: 4,
    },
    {
      productId: productIds["soft-hoop-earrings"],
      authorName: "Rumi",
      locationEn: "Khulna",
      locationBn: "খুলনা",
      bodyEn: "Everyday hoops I actually reach for. Quiet shine, easy with salwar and saree.",
      bodyBn: "প্রতিদিন পরার হুপ — শান্ত চকচক, সালোয়ার আর শাড়ির সাথে সহজ।",
      rating: 4,
      imageUrls: [],
      showOnHome: true,
      sortOrder: 5,
    },
    {
      productId: productIds["petal-ring"],
      authorName: "Sanjida Akter",
      locationEn: "Dhaka",
      locationBn: "ঢাকা",
      bodyEn: "Adjustable fit is perfect. Looks delicate but feels solid.",
      bodyBn: "অ্যাডজাস্টেবল ফিট পারফেক্ট। ডেলিকেট দেখতে, পরতে স্ট্রং।",
      rating: 5,
      imageUrls: [IMG.ring],
      showOnHome: false,
      sortOrder: 6,
    },
    {
      productId: productIds["velvet-night-set"],
      authorName: "Mitu R.",
      locationEn: "Barishal",
      locationBn: "বরিশাল",
      bodyEn: "Wore the night set to a reception — compliments all evening. COD was smooth.",
      bodyBn: "রিসেপশনে নাইট সেট পরেছি — সারা সন্ধ্যা প্রশংসা। COD মসৃণ ছিল।",
      rating: 5,
      imageUrls: [IMG.velvet],
      showOnHome: true,
      sortOrder: 7,
    },
  ];

  for (const r of reviews) {
    if (!r.productId) continue;
    await prisma.review.create({
      data: {
        ...r,
        isPublished: true,
      },
    });
  }
  console.log(`Reviews: ${reviews.length}`);
}

async function seedSections() {
  const home = {
    ...sectionDefaults.home,
    hero: {
      ...(sectionDefaults.home.hero as Record<string, unknown>),
      headlineEn: "Quiet shine. Lasting presence.",
      headlineBn: "নরম আলো। স্থায়ী উপস্থিতি।",
      imageDesktop: IMG.heroDesktop,
      imageMobile: IMG.heroMobile,
      mode: "image",
    },
  };

  const settings = {
    ...sectionDefaults.settings,
    storeName: "Rose Glow",
    logo: IMG.logo,
    taglineEn: "Ladies ornaments with a soft, lasting glow.",
    taglineBn: "কোমল, স্থায়ী গ্লো নিয়ে লেডিস অর্নামেন্টস।",
    contact: {
      phone: "01712-345678",
      whatsapp: "8801712345678",
      showCallOnProducts: true,
      showWhatsappOnProducts: true,
      email: "hello@roseglo.studio",
      addressEn: "Gulshan, Dhaka, Bangladesh",
      addressBn: "গুলশান, ঢাকা, বাংলাদেশ",
      hoursEn: "Sat–Thu · 10:00–20:00",
      hoursBn: "শনি–বৃহস্পতি · ১০:০০–২০:০০",
    },
    social: {
      instagram: "https://instagram.com/roseglo.bd",
      facebook: "https://facebook.com/roseglo.bd",
      whatsapp: "https://wa.me/8801712345678",
      tiktok: "https://tiktok.com/@roseglo.bd",
    },
  };

  const about = {
    ...sectionDefaults.about,
    image: IMG.heroDesktop,
  };

  const payloads: Array<{ key: string; data: Record<string, unknown>; seo?: unknown }> = [
    { key: "home", data: home as Record<string, unknown> },
    { key: "about", data: about as Record<string, unknown> },
    { key: "settings", data: settings as Record<string, unknown> },
    {
      key: "navigation",
      data: {
        ...sectionDefaults.navigation,
        featuredProductSlug: "glow-bridal-set",
      } as Record<string, unknown>,
    },
    { key: "footer", data: sectionDefaults.footer as Record<string, unknown> },
    { key: "shipping", data: sectionDefaults.shipping as Record<string, unknown> },
    {
      key: "contactPage",
      data: sectionDefaults.contactPage as Record<string, unknown>,
    },
    {
      key: "seoDefaults",
      data: {
        ...sectionDefaults.seoDefaults,
        ogImage: IMG.logo,
      } as Record<string, unknown>,
    },
  ];

  for (const row of payloads) {
    await prisma.section.upsert({
      where: { key: row.key },
      create: { key: row.key, data: row.data as Prisma.InputJsonValue },
      update: { data: row.data as Prisma.InputJsonValue },
    });
  }
  console.log(`CMS sections: ${payloads.length}`);
}

async function seedPages() {
  await prisma.page.upsert({
    where: { slug: "about" },
    create: {
      slug: "about",
      titleEn: "About Rose Glow",
      titleBn: "Rose Glow সম্পর্কে",
      bodyEn:
        "<p>Rose Glow is an ornaments atelier for women who want quiet luxury — pieces that feel light, look composed, and hold their shine.</p><p>Based in Dhaka, we ship COD nationwide with careful packing.</p>",
      bodyBn:
        "<p>Rose Glow একটি অর্নামেন্টস অ্যাটেলিয়ের — যারা শান্ত বিলাসিতা চান, তাদের জন্য হালকা, পরিপাটি আর স্থায়ী চকচকে পিস।</p><p>ঢাকা থেকে সারাদেশে COD, যত্নসহ প্যাকিং।</p>",
      seoTitleEn: "About | Rose Glow",
      seoTitleBn: "আমাদের কথা | Rose Glow",
      seoDescriptionEn: "The story of Rose Glow atelier in Dhaka.",
      seoDescriptionBn: "ঢাকার Rose Glow অ্যাটেলিয়েরের গল্প।",
      ogImage: IMG.heroDesktop,
      isPublished: true,
    },
    update: {
      titleEn: "About Rose Glow",
      titleBn: "Rose Glow সম্পর্কে",
      bodyEn:
        "<p>Rose Glow is an ornaments atelier for women who want quiet luxury — pieces that feel light, look composed, and hold their shine.</p><p>Based in Dhaka, we ship COD nationwide with careful packing.</p>",
      bodyBn:
        "<p>Rose Glow একটি অর্নামেন্টস অ্যাটেলিয়ের — যারা শান্ত বিলাসিতা চান, তাদের জন্য হালকা, পরিপাটি আর স্থায়ী চকচকে পিস।</p><p>ঢাকা থেকে সারাদেশে COD, যত্নসহ প্যাকিং।</p>",
      ogImage: IMG.heroDesktop,
      isPublished: true,
    },
  });

  await prisma.page.upsert({
    where: { slug: "contact" },
    create: {
      slug: "contact",
      titleEn: "Contact",
      titleBn: "যোগাযোগ",
      bodyEn:
        "<p>Write to us for orders, custom notes, or atelier questions. We reply on WhatsApp and phone with care.</p>",
      bodyBn:
        "<p>অর্ডার, কাস্টম নোট বা অ্যাটেলিয়ের প্রশ্নের জন্য লিখুন। WhatsApp ও ফোনে যত্ন করে উত্তর দিই।</p>",
      seoTitleEn: "Contact | Rose Glow",
      seoTitleBn: "যোগাযোগ | Rose Glow",
      isPublished: true,
    },
    update: {
      bodyEn:
        "<p>Write to us for orders, custom notes, or atelier questions. We reply on WhatsApp and phone with care.</p>",
      bodyBn:
        "<p>অর্ডার, কাস্টম নোট বা অ্যাটেলিয়ের প্রশ্নের জন্য লিখুন। WhatsApp ও ফোনে যত্ন করে উত্তর দিই।</p>",
      isPublished: true,
    },
  });
}

async function ensureAdmin() {
  const email = (process.env.ADMIN_EMAIL ?? "rose.glow.bd@gmail.com").toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "rose.glow.bd2026";
  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      name: "Rose Glow Admin",
      role: Role.ADMIN,
    },
    update: { passwordHash, role: Role.ADMIN },
  });
  console.log(`Admin → ${email}`);
}

async function main() {
  console.log("Seeding local demo data…");
  await ensureAdmin();
  await softDeleteJunk();
  const categories = await ensureCategories();

  const ids: Record<string, string> = {};
  for (const p of products) {
    ids[p.slug] = await upsertProduct(p, categories);
  }
  console.log(`Products: ${products.length}`);

  await seedReviews(ids);
  await seedSections();
  await seedPages();

  await prisma.seoEntry.upsert({
    where: { path: "/" },
    create: {
      path: "/",
      titleEn: "Rose Glow — Ladies Ornaments",
      titleBn: "Rose Glow — লেডিস অর্নামেন্টস",
      descriptionEn:
        "Ladies ornaments with a soft, lasting glow. Cash on delivery across Bangladesh.",
      descriptionBn:
        "কোমল, স্থায়ী গ্লো নিয়ে লেডিস অর্নামেন্টস। সারাদেশে ক্যাশ অন ডেলিভারি।",
      keywords: "Rose Glow, ornaments, earrings, necklace, Dhaka",
      ogImage: IMG.logo,
    },
    update: {
      titleEn: "Rose Glow — Ladies Ornaments",
      titleBn: "Rose Glow — লেডিস অর্নামেন্টস",
      ogImage: IMG.logo,
    },
  });

  console.log("Local demo seed complete.");
  console.log("Landings: /bn/l/glow-bridal-set  ·  /bn/l/velvet-night-set");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
