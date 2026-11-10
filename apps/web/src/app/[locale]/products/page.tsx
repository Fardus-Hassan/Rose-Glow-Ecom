import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductsView } from "@/components/products/ProductsView";
import { fetchProductsPage } from "@/lib/catalog";
import { SHOP_PAGE_SIZE } from "@/lib/shop";
import { buildPageMetadata } from "@/lib/seo";
import { mediaUrl } from "@/lib/media";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Products" });
  return buildPageMetadata({
    path: "/products",
    locale,
    fallbackTitle: `${t("title")} · Rose Glow`,
    fallbackDescription: t("subtitle"),
  });
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Products");
  const initial = await fetchProductsPage({
    page: 1,
    pageSize: SHOP_PAGE_SIZE,
    category: category || undefined,
  });

  return (
    <div className="bg-[#f0ebe4] pb-20 md:pb-28">
      <section className="relative isolate overflow-hidden border-b border-white/10 bg-[#0e0d0c] text-[#f4efe8]">
        <div className="absolute inset-0 -z-20">
          <Image
            src={mediaUrl("/home/atelier-gold-spread.jpg")}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover object-[center_40%]"
          />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0e0d0c]/90 via-[#0e0d0c]/72 to-[#0e0d0c]/45" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0e0d0c]/80 via-transparent to-[#0e0d0c]/35" />

        <div className="container-rg relative pb-12 pt-28 md:pb-16 md:pt-32">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,4.25rem)] leading-[1.05] tracking-[-0.02em]">
            {t("title")}
          </h1>
          <div className="mt-5 h-px w-14 bg-gradient-to-r from-[#c9a08a] to-transparent" />
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#f4efe8]/70 md:text-base">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <div className="container-rg pt-10 md:pt-14">
        <ProductsView initial={initial} initialCategory={category} />
      </div>
    </div>
  );
}
