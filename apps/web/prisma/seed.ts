import {
  MediaType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PrismaClient,
  Role,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/** Point seed media at Cloudflare R2 when configured. */
function media(path: string) {
  const base = (
    process.env.R2_PUBLIC_URL ||
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
    ""
  ).replace(/\/$/, "");
  if (!base) return path;
  if (path.startsWith("/uploads/")) {
    return `${base}/${path.slice("/uploads/".length)}`;
  }
  return `${base}${path}`;
}

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? 'rose.glow.bd@gmail.com').toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'rose.glow.bd2026';
  const name = process.env.ADMIN_NAME ?? 'Rose Glow Admin';

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    create: { email, passwordHash, name, role: Role.ADMIN },
    update: { passwordHash, name, role: Role.ADMIN },
  });

  const categoryDefs = [
    { slug: 'earrings', nameEn: 'Earrings', nameBn: 'ইয়াররিংস', sortOrder: 1 },
    { slug: 'necklaces', nameEn: 'Necklaces', nameBn: 'নেকলেস', sortOrder: 2 },
    { slug: 'bangles', nameEn: 'Bangles', nameBn: 'চুড়ি / ব্যাঙ্গল', sortOrder: 3 },
    { slug: 'rings', nameEn: 'Rings', nameBn: 'রিং', sortOrder: 4 },
    { slug: 'sets', nameEn: 'Sets', nameBn: 'সেট', sortOrder: 5 },
  ];

  const categories = new Map<string, string>();
  for (const cat of categoryDefs) {
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
          },
        })
      : await prisma.category.create({
          data: {
            ...cat,
            seoTitleEn: `${cat.nameEn} | Rose Glow`,
            seoTitleBn: `${cat.nameBn} | Rose Glow`,
            seoDescriptionEn: `Shop ${cat.nameEn.toLowerCase()} from Rose Glow atelier.`,
            seoDescriptionBn: `Rose Glow অ্যাটেলিয়ের থেকে ${cat.nameBn} কিনুন।`,
          },
        });
    categories.set(cat.slug, row.id);
  }

  const products = [
    {
      slug: 'glow-bridal-set',
      sku: 'RG-ST-021',
      nameEn: 'Glow Bridal Set',
      nameBn: 'গ্লো ব্রাইডাল সেট',
      descriptionEn:
        'Matching necklace and earring set with open lattice spheres and heart-charm tassels. Made for celebrations and framed photos.',
      descriptionBn:
        'ওপেন ল্যাটিস স্ফিয়ার ও হার্ট-চার্ম ট্যাসেলসহ ম্যাচিং নেকলেস ও ইয়াররিংস সেট। উৎসব আর ফ্রেমড ফটোর জন্য।',
      price: 2890,
      compareAtPrice: 3200,
      category: 'sets',
      materialEn: 'Alloy · Filigree gold',
      materialBn: 'অ্যালয় · ফিলিগ্রি গোল্ড',
      colors: [{ en: 'Gold', bn: 'গোল্ড' }],
      rating: 4.9,
      reviewCount: 142,
      soldCount: 480,
      stock: 24,
      featured: true,
      newest: true,
      media: [
        {
          type: MediaType.IMAGE,
          src: media('/products/filigree-bridal-set.jpg'),
          altEn: 'Glow bridal set',
          altBn: 'গ্লো ব্রাইডাল সেট',
        },
        {
          type: MediaType.IMAGE,
          src: media('/products/filigree-earrings.jpg'),
          altEn: 'Bridal earrings',
          altBn: 'ব্রাইডাল ইয়াররিংস',
        },
      ],
    },
    {
      slug: 'pearl-bloom-earrings',
      sku: 'RG-ER-001',
      nameEn: 'Pearl Bloom Earrings',
      nameBn: 'পার্ল ব্লুম ইয়াররিংস',
      descriptionEn:
        'Soft pearl drops framed in polished gold tone metal. Light enough for all-day wear, luminous enough for evenings.',
      descriptionBn:
        'পালিশড গোল্ড টোন মেটালে মোড়ানো কোমল পার্ল ড্রপ। সারাদিন পরার মতো হালকা, সন্ধ্যার জন্য যথেষ্ট উজ্জ্বল।',
      price: 890,
      compareAtPrice: 1100,
      category: 'earrings',
      materialEn: 'Alloy · Pearl finish',
      materialBn: 'অ্যালয় · পার্ল ফিনিশ',
      colors: [
        { en: 'Gold', bn: 'গোল্ড' },
        { en: 'Pearl', bn: 'পার্ল' },
      ],
      rating: 4.8,
      reviewCount: 124,
      soldCount: 860,
      stock: 40,
      featured: true,
      newest: true,
      media: [
        {
          type: MediaType.IMAGE,
          src: media('/products/pearl-gold-earrings.jpg'),
          altEn: 'Pearl bloom earrings',
          altBn: 'পার্ল ব্লুম ইয়াররিংস',
        },
      ],
    },
    {
      slug: 'rose-veil-necklace',
      sku: 'RG-NK-014',
      nameEn: 'Filigree Veil Necklace',
      nameBn: 'ফিলিগ্রি ভেইল নেকলেস',
      descriptionEn:
        'A delicate gold necklace with an open lattice pendant and heart-charm tassels. Designed to sit close to the collarbone.',
      descriptionBn:
        'ওপেন ল্যাটিস পেন্ডান্ট ও হার্ট-চার্ম ট্যাসেলসহ ডেলিকেট গোল্ড নেকলেস। কলারবোনের কাছে সুন্দরভাবে বসে।',
      price: 1450,
      category: 'necklaces',
      materialEn: 'Alloy · Gold finish',
      materialBn: 'অ্যালয় · গোল্ড ফিনিশ',
      colors: [{ en: 'Gold', bn: 'গোল্ড' }],
      rating: 4.9,
      reviewCount: 98,
      soldCount: 640,
      stock: 18,
      featured: true,
      media: [
        {
          type: MediaType.IMAGE,
          src: media('/products/filigree-necklace.jpg'),
          altEn: 'Filigree veil necklace',
          altBn: 'ফিলিগ্রি ভেইল নেকলেস',
        },
      ],
    },
    {
      slug: 'dusk-bangle-set',
      sku: 'RG-BG-008',
      nameEn: 'Dusk Bangle Set',
      nameBn: 'ডাস্ক ব্যাঙ্গল সেট',
      descriptionEn:
        'A stack of slim gold-tone bangles with brushed and polished finishes. Mix and match for a soft evening look.',
      descriptionBn:
        'ব্রাশড ও পালিশড ফিনিশের স্লিম গোল্ড-টোন ব্যাঙ্গল স্ট্যাক। সন্ধ্যার লুকের জন্য মিক্স অ্যান্ড ম্যাচ করুন।',
      price: 1250,
      compareAtPrice: 1500,
      category: 'bangles',
      materialEn: 'Alloy · Brushed gold',
      materialBn: 'অ্যালয় · ব্রাশড গোল্ড',
      colors: [{ en: 'Gold', bn: 'গোল্ড' }],
      rating: 4.7,
      reviewCount: 76,
      soldCount: 520,
      stock: 22,
      featured: true,
      media: [
        {
          type: MediaType.IMAGE,
          src: media('/products/gold-bangles.jpg'),
          altEn: 'Dusk bangle set',
          altBn: 'ডাস্ক ব্যাঙ্গল সেট',
        },
      ],
    },
    {
      slug: 'petal-ring',
      sku: 'RG-RG-003',
      nameEn: 'Lattice Petal Ring',
      nameBn: 'ল্যাটিস পেটাল রিং',
      descriptionEn:
        'A sculpted filigree motif ring with a soft gold shine. Comfortable band for daily wear.',
      descriptionBn:
        'কোমল গোল্ড চকচকে ফিলিগ্রি মোটিফ রিং। প্রতিদিন পরার জন্য আরামদায়ক ব্যান্ড।',
      price: 650,
      category: 'rings',
      materialEn: 'Alloy · Gold finish',
      materialBn: 'অ্যালয় · গোল্ড ফিনিশ',
      colors: [
        { en: 'Gold', bn: 'গোল্ড' },
        { en: 'Rose gold', bn: 'রোজ গোল্ড' },
      ],
      rating: 4.6,
      reviewCount: 54,
      soldCount: 310,
      stock: 35,
      newest: true,
      media: [
        {
          type: MediaType.IMAGE,
          src: media('/products/filigree-ring.jpg'),
          altEn: 'Lattice petal ring',
          altBn: 'ল্যাটিস পেটাল রিং',
        },
      ],
    },
    {
      slug: 'soft-hoop-earrings',
      sku: 'RG-ER-019',
      nameEn: 'Soft Hoop Earrings',
      nameBn: 'সফট হুপ ইয়াররিংস',
      descriptionEn:
        'Medium hoops with a satin gold finish. Everyday essential with a quiet shine.',
      descriptionBn:
        'স্যাটিন গোল্ড ফিনিশের মিডিয়াম হুপ। নরম চকচকে প্রতিদিনের এসেনশিয়াল।',
      price: 720,
      category: 'earrings',
      materialEn: 'Alloy · Satin gold',
      materialBn: 'অ্যালয় · স্যাটিন গোল্ড',
      colors: [{ en: 'Gold', bn: 'গোল্ড' }],
      rating: 4.5,
      reviewCount: 67,
      soldCount: 390,
      stock: 28,
      media: [
        {
          type: MediaType.IMAGE,
          src: media('/products/gold-hoops.jpg'),
          altEn: 'Soft hoop earrings',
          altBn: 'সফট হুপ ইয়াররিংস',
        },
      ],
    },
  ] as const;

  const productIds: string[] = [];

  for (const p of products) {
    const categoryId = categories.get(p.category)!;
    const existing = await prisma.product.findFirst({
      where: { slug: p.slug, deletedAt: null },
    });
    const row = existing
      ? await prisma.product.update({
          where: { id: existing.id },
          data: {
            nameEn: p.nameEn,
            nameBn: p.nameBn,
            descriptionEn: p.descriptionEn,
            descriptionBn: p.descriptionBn,
            price: p.price,
            compareAtPrice: 'compareAtPrice' in p ? p.compareAtPrice : null,
            categoryId,
            stock: p.stock,
            featured: 'featured' in p ? !!p.featured : false,
            newest: 'newest' in p ? !!p.newest : false,
          },
        })
      : await prisma.product.create({
          data: {
            slug: p.slug,
            sku: p.sku,
            nameEn: p.nameEn,
            nameBn: p.nameBn,
            descriptionEn: p.descriptionEn,
            descriptionBn: p.descriptionBn,
            price: p.price,
            compareAtPrice: 'compareAtPrice' in p ? p.compareAtPrice : null,
            categoryId,
            materialEn: p.materialEn,
            materialBn: p.materialBn,
            colors: p.colors,
            rating: p.rating,
            reviewCount: p.reviewCount,
            soldCount: p.soldCount,
            stock: p.stock,
            featured: 'featured' in p ? !!p.featured : false,
            newest: 'newest' in p ? !!p.newest : false,
            inStock: true,
            published: true,
            seoTitleEn: `${p.nameEn} | Rose Glow`,
            seoTitleBn: `${p.nameBn} | Rose Glow`,
            seoDescriptionEn: p.descriptionEn.slice(0, 155),
            seoDescriptionBn: p.descriptionBn.slice(0, 155),
            seoKeywords: `${p.nameEn}, Rose Glow, ornaments`,
            canonicalPath: `/products/${p.slug}`,
            ogImage: p.media[0]?.src ?? '',
            media: {
              create: p.media.map((m, i) => ({
                type: m.type,
                src: m.src,
                altEn: m.altEn,
                altBn: m.altBn,
                sortOrder: i,
              })),
            },
          },
        });
    productIds.push(row.id);
  }

  await prisma.contentBlock.upsert({
    where: { key: 'hero' },
    create: {
      key: 'hero',
      label: 'Homepage Hero',
      group: 'homepage',
      value: {
        brand: 'Rose Glow',
        headlineEn: 'Quiet shine. Lasting presence.',
        headlineBn: 'নরম আলো। স্থায়ী উপস্থিতি।',
        bodyEn:
          'Ladies ornaments composed with soft light, fine finish, and everyday grace.',
        bodyBn:
          'কোমল আলো, সূক্ষ্ম ফিনিশ আর প্রতিদিনের কমনীয়তায় সাজানো লেডিস অর্নামেন্টস।',
        ctaEn: 'Enter the collection',
        ctaBn: 'কালেকশনে প্রবেশ করুন',
        mode: 'image',
        image: {
          desktop: media('/home/atelier-gold-spread.jpg'),
          mobile: media('/home/hero-ornaments.jpg'),
        },
      },
    },
    update: {},
  });

  await prisma.contentBlock.upsert({
    where: { key: 'contact' },
    create: {
      key: 'contact',
      label: 'Contact Info',
      group: 'contact',
      value: {
        email: 'rose.glow.bd@gmail.com',
        phone: '+8801712345678',
        whatsapp: '+8801712345678',
        addressEn: 'Dhaka, Bangladesh',
        addressBn: 'ঢাকা, বাংলাদেশ',
        hoursEn: 'Sat–Thu · 10:00–20:00',
        hoursBn: 'শনি–বৃহঃ · ১০:০০–২০:০০',
      },
    },
    update: {},
  });

  await prisma.contentBlock.upsert({
    where: { key: 'social' },
    create: {
      key: 'social',
      label: 'Social Links',
      group: 'site',
      value: {
        instagram: 'https://instagram.com/',
        facebook: 'https://facebook.com/',
        whatsapp: 'https://wa.me/8801712345678',
        tiktok: 'https://tiktok.com/',
      },
    },
    update: {},
  });

  await prisma.page.upsert({
    where: { slug: 'about' },
    create: {
      slug: 'about',
      titleEn: 'About Rose Glow',
      titleBn: 'Rose Glow সম্পর্কে',
      bodyEn:
        'Rose Glow is an ornaments atelier for women who want quiet luxury — pieces that feel light, look composed, and hold their shine.',
      bodyBn:
        'Rose Glow একটি অর্নামেন্টস অ্যাটেলিয়ের — যারা শান্ত বিলাসিতা চান, তাদের জন্য হালকা, পরিপাটি আর স্থায়ী চকচকে পিস।',
      seoTitleEn: 'About | Rose Glow',
      seoTitleBn: 'আমাদের কথা | Rose Glow',
      seoDescriptionEn: 'The story of Rose Glow atelier in Dhaka.',
      seoDescriptionBn: 'ঢাকার Rose Glow অ্যাটেলিয়েরের গল্প।',
      isPublished: true,
    },
    update: {},
  });

  await prisma.page.upsert({
    where: { slug: 'contact' },
    create: {
      slug: 'contact',
      titleEn: 'Contact',
      titleBn: 'যোগাযোগ',
      bodyEn: 'Write to us for orders, custom notes, or atelier visits.',
      bodyBn: 'অর্ডার, কাস্টম নোট বা অ্যাটেলিয়ের ভিজিটের জন্য লিখুন।',
      seoTitleEn: 'Contact | Rose Glow',
      seoTitleBn: 'যোগাযোগ | Rose Glow',
      isPublished: true,
    },
    update: {},
  });

  const seoPaths = [
    {
      path: '/',
      titleEn: 'Rose Glow — Ladies Ornaments',
      titleBn: 'Rose Glow — লেডিস অর্নামেন্টস',
      descriptionEn:
        'Ladies ornaments with a soft, lasting glow. Cash on delivery across Bangladesh.',
      descriptionBn:
        'কোমল, স্থায়ী গ্লো নিয়ে লেডিস অর্নামেন্টস। সারাদেশে ক্যাশ অন ডেলিভারি।',
      keywords: 'Rose Glow, ornaments, earrings, necklace, Dhaka',
    },
    {
      path: '/products',
      titleEn: 'Shop | Rose Glow',
      titleBn: 'শপ | Rose Glow',
      descriptionEn: 'Browse the Rose Glow collection by form and finish.',
      descriptionBn: 'ফর্ম ও ফিনিশ অনুযায়ী Rose Glow কালেকশন দেখুন।',
      keywords: 'shop, ornaments, Rose Glow',
    },
  ];

  for (const entry of seoPaths) {
    await prisma.seoEntry.upsert({
      where: { path: entry.path },
      create: entry,
      update: entry,
    });
  }

  await prisma.siteSetting.upsert({
    where: { key: 'store' },
    create: {
      key: 'store',
      value: {
        name: 'Rose Glow',
        currency: 'BDT',
        localeDefault: 'bn',
        shippingFeeDefault: 80,
        freeShippingOver: 2500,
      },
    },
    update: {},
  });

  const existingReviews = await prisma.review.count();
  if (existingReviews === 0) {
    const sampleReviews = [
      {
        productId: productIds[1] ?? productIds[0],
        authorName: 'Nusrat A.',
        locationEn: 'Dhaka',
        locationBn: 'ঢাকা',
        bodyEn:
          'The earrings feel light and look expensive in person. Packaging was beautiful too.',
        bodyBn:
          'ইয়াররিংস খুব হালকা আর লাইভে দেখতে প্রিমিয়াম। প্যাকেজিংও সুন্দর ছিল।',
        rating: 5,
        imageUrls: [media('/products/pearl-gold-earrings.jpg')],
        sortOrder: 1,
      },
      {
        productId: productIds[2] ?? productIds[0],
        authorName: 'Farzana K.',
        locationEn: 'Chattogram',
        locationBn: 'চট্টগ্রাম',
        bodyEn:
          'Ordered on COD without worry. The necklace matched the photos and arrived safely.',
        bodyBn:
          'COD-তে নিশ্চিন্তে অর্ডার করেছি। নেকলেস ছবির মতোই, নিরাপদে পৌঁছেছে।',
        rating: 5,
        imageUrls: [],
        sortOrder: 2,
      },
      {
        productId: productIds[0],
        authorName: 'Sadia T.',
        locationEn: 'Rajshahi',
        locationBn: 'রাজশাহী',
        bodyEn:
          'The bridal set looked graceful in photos and even better when worn.',
        bodyBn:
          'ব্রাইডাল সেট ফটোতে সুন্দর, পরলে আরও বেশি কমনীয় লাগে।',
        rating: 5,
        imageUrls: [media('/products/filigree-bridal-set.jpg')],
        sortOrder: 3,
      },
    ];

    for (const review of sampleReviews) {
      await prisma.review.create({ data: review });
    }
  }

  const existingOrders = await prisma.order.count();
  if (existingOrders === 0 && productIds[0]) {
    const sample = [
      {
        orderNumber: 'RG-20261109-0001',
        customerName: 'Nusrat Ahmed',
        customerPhone: '01711000001',
        customerEmail: 'nusrat@example.com',
        addressLine: 'House 12, Road 4, Dhanmondi',
        city: 'Dhaka',
        district: 'Dhaka',
        status: OrderStatus.PENDING,
        paymentMethod: PaymentMethod.COD,
        paymentStatus: PaymentStatus.UNPAID,
        note: 'Please call before delivery',
        items: [
          {
            productId: productIds[1] ?? productIds[0],
            productName: 'Pearl Bloom Earrings',
            productSku: 'RG-ER-001',
            unitPrice: 890,
            quantity: 1,
            lineTotal: 890,
          },
        ],
        subtotal: 890,
        shippingFee: 80,
        discount: 0,
        total: 970,
      },
      {
        orderNumber: 'RG-20261109-0002',
        customerName: 'Farzana Khan',
        customerPhone: '01822000002',
        customerEmail: 'farzana@example.com',
        addressLine: 'GEC Circle',
        city: 'Chattogram',
        district: 'Chattogram',
        status: OrderStatus.CONFIRMED,
        paymentMethod: PaymentMethod.BKASH,
        paymentStatus: PaymentStatus.PAID,
        items: [
          {
            productId: productIds[0],
            productName: 'Glow Bridal Set',
            productSku: 'RG-ST-021',
            unitPrice: 2890,
            quantity: 1,
            lineTotal: 2890,
          },
        ],
        subtotal: 2890,
        shippingFee: 0,
        discount: 0,
        total: 2890,
      },
      {
        orderNumber: 'RG-20261108-0003',
        customerName: 'Sadia T.',
        customerPhone: '01933000003',
        addressLine: 'New Market',
        city: 'Rajshahi',
        district: 'Rajshahi',
        status: OrderStatus.SHIPPED,
        paymentMethod: PaymentMethod.COD,
        paymentStatus: PaymentStatus.UNPAID,
        items: [
          {
            productId: productIds[2] ?? productIds[0],
            productName: 'Filigree Veil Necklace',
            productSku: 'RG-NK-014',
            unitPrice: 1450,
            quantity: 1,
            lineTotal: 1450,
          },
          {
            productId: productIds[4] ?? productIds[0],
            productName: 'Lattice Petal Ring',
            productSku: 'RG-RG-003',
            unitPrice: 650,
            quantity: 2,
            lineTotal: 1300,
          },
        ],
        subtotal: 2750,
        shippingFee: 100,
        discount: 50,
        total: 2800,
      },
    ];

    for (const order of sample) {
      await prisma.order.create({
        data: {
          ...order,
          items: { create: order.items },
        },
      });
    }
  }

  console.log('Seed complete');
  console.log(`Admin → ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
