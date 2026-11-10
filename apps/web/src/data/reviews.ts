import type { LocalizedString } from "./products";
import { mediaUrl } from "@/lib/media";

export type Review = {
  id: string;
  name: LocalizedString;
  place: LocalizedString;
  quote: LocalizedString;
  rating: number;
  /** Customer photo(s) attached to the review */
  images?: string[];
};

export const reviews: Review[] = [
  {
    id: "r1",
    name: { en: "Nusrat A.", bn: "নুসরাত এ." },
    place: { en: "Dhaka", bn: "ঢাকা" },
    quote: {
      en: "The earrings feel light and look expensive in person. Packaging was beautiful too.",
      bn: "ইয়াররিংস খুব হালকা আর লাইভে দেখতে প্রিমিয়াম। প্যাকেজিংও সুন্দর ছিল।",
    },
    rating: 5,
    images: [
      mediaUrl("/products/pearl-gold-earrings.jpg"),
      mediaUrl("/products/filigree-detail.jpg"),
    ],
  },
  {
    id: "r2",
    name: { en: "Farzana K.", bn: "ফারজানা কে." },
    place: { en: "Chattogram", bn: "চট্টগ্রাম" },
    quote: {
      en: "Ordered on COD without worry. The necklace matched the photos and arrived safely.",
      bn: "COD-তে নিশ্চিন্তে অর্ডার করেছি। নেকলেস ছবির মতোই, নিরাপদে পৌঁছেছে।",
    },
    rating: 5,
    images: [mediaUrl("/products/filigree-necklace.jpg")],
  },
  {
    id: "r3",
    name: { en: "Mim R.", bn: "মিম আর." },
    place: { en: "Sylhet", bn: "সিলেট" },
    quote: {
      en: "Soft shine, exactly what I wanted for everyday wear. Will order again.",
      bn: "নরম চকচকে, প্রতিদিন পরার জন্য যা চেয়েছিলাম। আবারও অর্ডার করব।",
    },
    rating: 5,
    images: [mediaUrl("/products/gold-hoops.jpg"), mediaUrl("/products/filigree-earrings.jpg")],
  },
  {
    id: "r4",
    name: { en: "Sadia T.", bn: "সাদিয়া টি." },
    place: { en: "Rajshahi", bn: "রাজশাহী" },
    quote: {
      en: "The bridal set looked graceful in photos and even better when worn.",
      bn: "ব্রাইডাল সেট ফটোতে সুন্দর, পরলে আরও বেশি কমনীয় লাগে।",
    },
    rating: 5,
    images: [
      mediaUrl("/products/filigree-bridal-set.jpg"),
      mediaUrl("/products/filigree-earrings.jpg"),
    ],
  },
  {
    id: "r5",
    name: { en: "Anika H.", bn: "আনিকা এইচ." },
    place: { en: "Khulna", bn: "খুলনা" },
    quote: {
      en: "Quick delivery and the finish is so neat. Rose Glow feels premium.",
      bn: "ডেলিভারি দ্রুত, ফিনিশ খুব পরিপাটি। Rose Glow সত্যিই প্রিমিয়াম লাগে।",
    },
    rating: 5,
    images: [mediaUrl("/products/filigree-ring.jpg"), mediaUrl("/products/gold-bangles.jpg")],
  },
];
