import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductsView } from "@/components/products/ProductsView";
import { Reveal } from "@/components/motion/Reveal";
import { fetchProductsPage } from "@/lib/catalog";
import { SHOP_PAGE_SIZE } from "@/lib/shop";
import { buildPageMetadata } from "@/lib/seo";

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
    <div className="rg-stage relative pb-24 md:pb-32">
      <div
        className="rg-editorial-grid pointer-events-none absolute inset-0 opacity-80"
        aria-hidden
      />

      {/* Compact shop intro — tight band, products rise fast */}
      <section className="relative border-b border-[color:var(--rg-line)] pt-24 md:pt-28">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(212,175,55,0.07),transparent_50%)]"
          aria-hidden
        />
        <div className="container-rg relative pb-7 md:pb-8">
          <Reveal>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:var(--rg-accent)]">
                  {t("eyebrow")}
                </p>
                <h1 className="mt-2 font-display text-[clamp(2rem,4.5vw,3.25rem)] leading-[1.05] tracking-[-0.03em] text-[color:var(--rg-pearl)]">
                  {t("title")}
                </h1>
                <div className="rg-home-gold-rule mt-3 w-12 md:w-16" />
              </div>
              <p className="max-w-sm text-sm leading-6 text-[color:var(--rg-muted)] md:pb-1 md:text-right md:text-[15px] md:leading-7">
                {t("subtitle")}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="relative pt-8 md:pt-10">
        <ProductsView initial={initial} initialCategory={category} />
      </div>
    </div>
  );
}
