import type { SectionKey } from "./types";
import { mediaUrl } from "@/lib/media";

export const sectionDefaults: Record<SectionKey, Record<string, unknown>> = {
  home: {
    hero: {
      eyebrowEn: "Est. atelier · Dhaka",
      eyebrowBn: "অ্যাটেলিয়ের · ঢাকা",
      headlineEn: "Quiet shine. Lasting presence.",
      headlineBn: "নরম আলো। স্থায়ী উপস্থিতি।",
      bodyEn:
        "Ladies ornaments composed with soft light, fine finish, and everyday grace.",
      bodyBn:
        "কোমল আলো, সূক্ষ্ম ফিনিশ আর প্রতিদিনের কমনীয়তায় সাজানো লেডিস অর্নামেন্টস।",
      ctaEn: "Enter the collection",
      ctaBn: "কালেকশনে প্রবেশ করুন",
      mode: "image",
      imageDesktop: mediaUrl("/home/atelier-gold-spread.jpg"),
      imageMobile: mediaUrl("/home/hero-ornaments.jpg"),
      videoDesktop: "",
      videoMobile: "",
    },
    featured: {
      titleEn: "The collection",
      titleBn: "কালেকশন",
      subEn: "Selected ornaments for glow, balance, and wear.",
      subBn: "গ্লো, ব্যালান্স আর পরার জন্য বাছাই করা অর্নামেন্টস।",
    },
    reviews: {
      titleEn: "Words from our glow circle",
      titleBn: "আমাদের গ্লো সার্কেলের কথা",
      subEn: "Real notes from women who wear Rose Glow every day.",
      subBn: "যারা প্রতিদিন Rose Glow পরেন, তাদের আসল নোট।",
    },
  },
  about: {
    eyebrowEn: "The atelier",
    eyebrowBn: "অ্যাটেলিয়ের",
    titleEn: "Quiet luxury, made to wear.",
    titleBn: "শান্ত বিলাসিতা, পরার জন্য।",
    leadEn:
      "Rose Glow is a ladies ornaments atelier based in Dhaka. We compose soft, lasting pieces for women who want presence without noise.",
    leadBn:
      "Rose Glow ঢাকার একটি লেডিস অর্নামেন্টস অ্যাটেলিয়ের — শব্দ ছাড়া উপস্থিতি চান এমন নারীদের জন্য।",
    image: mediaUrl("/home/atelier-gold-spread.jpg"),
    ctaEn: "Shop the atelier",
    ctaBn: "অ্যাটেলিয়ের দেখুন",
    pillars: [
      {
        titleEn: "Curated finish",
        titleBn: "বাছাই করা ফিনিশ",
        bodyEn: "Every ornament is reviewed for glow, balance, and everyday wear.",
        bodyBn: "প্রতিটি পিস গ্লো, ব্যালান্স আর প্রতিদিনের পরার জন্য দেখা হয়।",
      },
      {
        titleEn: "Soft everyday luxury",
        titleBn: "নরম প্রতিদিনের বিলাসিতা",
        bodyEn: "Pieces meant for real life — mornings, evenings, quiet hours.",
        bodyBn: "আসল জীবনের জন্য — সকাল, সন্ধ্যা, শান্ত সময়।",
      },
      {
        titleEn: "Nationwide COD",
        titleBn: "সারাদেশে COD",
        bodyEn: "Cash on delivery across Bangladesh with careful packing.",
        bodyBn: "সারা বাংলাদেশে ক্যাশ অন ডেলিভারি, যত্নসহ প্যাকিং।",
      },
    ],
  },
  contactPage: {
    eyebrowEn: "Say hello",
    eyebrowBn: "হ্যালো বলুন",
    titleEn: "We’re here to help",
    titleBn: "আমরা সাহায্য করতে এখানে",
    subEn:
      "Questions on sizing, delivery, COD, or a gift note? Message us — we reply with care.",
    subBn:
      "সাইজ, ডেলিভারি, COD বা গিফট নোট নিয়ে প্রশ্ন? মেসেজ করুন — যত্ন করে উত্তর দিই।",
  },
  settings: {
    storeName: "Rose Glow",
    logo: mediaUrl("/brand/logo.png"),
    taglineEn: "Ladies ornaments with a soft, lasting glow.",
    taglineBn: "কোমল, স্থায়ী গ্লো নিয়ে লেডিস অর্নামেন্টস।",
    contact: {
      phone: "01700-000000",
      whatsapp: "8801700000000",
      email: "hello@roseglo.studio",
      addressEn: "Dhaka, Bangladesh",
      addressBn: "ঢাকা, বাংলাদেশ",
      hoursEn: "Sat–Thu · 10:00–20:00",
      hoursBn: "শনি–বৃহস্পতি · ১০:০০–২০:০০",
    },
    social: {
      instagram: "https://instagram.com/roseglo.bd",
      facebook: "https://facebook.com/roseglo.bd",
      whatsapp: "https://wa.me/8801700000000",
      tiktok: "https://tiktok.com/@roseglo.bd",
    },
  },
  navigation: {
    links: [
      { labelEn: "Home", labelBn: "হোম", href: "/" },
      { labelEn: "Shop", labelBn: "শপ", href: "/products" },
      { labelEn: "About", labelBn: "আমাদের কথা", href: "/about" },
      { labelEn: "Contact", labelBn: "যোগাযোগ", href: "/contact" },
    ],
    featuredProductSlug: "glow-bridal-set",
  },
  footer: {
    taglineEn: "Ladies ornaments with a soft, lasting glow.",
    taglineBn: "কোমল, স্থায়ী গ্লো নিয়ে লেডিস অর্নামেন্টস।",
    newsletterTitleEn: "Stay in the glow",
    newsletterTitleBn: "গ্লোতে থাকুন",
    newsletterSubEn: "Occasional notes on new ornaments and private offers.",
    newsletterSubBn: "নতুন অর্নামেন্টস ও প্রাইভেট অফারের সংক্ষিপ্ত নোট।",
    extraLinks: [],
  },
  shipping: {
    shippingFeeDefault: 80,
    freeShippingOver: 2500,
    codEnabled: true,
    codNoteEn: "Cash on delivery available nationwide.",
    codNoteBn: "সারাদেশে ক্যাশ অন ডেলিভারি পাওয়া যায়।",
  },
  seoDefaults: {
    titleEn: "Rose Glow — Ladies Ornaments",
    titleBn: "Rose Glow — লেডিস অর্নামেন্টস",
    descriptionEn:
      "Ladies ornaments with a soft, lasting glow. Cash on delivery across Bangladesh.",
    descriptionBn:
      "কোমল, স্থায়ী গ্লো নিয়ে লেডিস অর্নামেন্টস। সারাদেশে ক্যাশ অন ডেলিভারি।",
    keywords: "Rose Glow, ornaments, earrings, necklace, Dhaka",
    ogImage: mediaUrl("/brand/logo.png"),
  },
};
