import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localize } from "@/data/products";
import { ProductShowcase } from "@/components/product/ProductShowcase";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductCard } from "@/components/products/ProductCard";
import { StaggerParallax } from "@/components/motion/StaggerParallax";
import { Reveal } from "@/components/motion/Reveal";
import { MetaViewContent } from "@/components/analytics/MetaViewContent";
import { Link } from "@/i18n/navigation";
import {
  fetchProductBySlug,
  fetchRelatedProducts,
  fetchReviews,
} from "@/lib/catalog";
import { buildPageMetadata } from "@/lib/seo";
import { stripHtml } from "@/lib/rich-text";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const product = await fetchProductBySlug(slug);
  if (!product) return {};

  return buildPageMetadata({
    path: `/product/${slug}`,
    locale,
    fallbackTitle: `${localize(product.name, locale)} · Rose Glow`,
    fallbackDescription: stripHtml(localize(product.description, locale)),
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const product = await fetchProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    fetchRelatedProducts(slug, 4),
    fetchReviews({ productSlug: slug, pageSize: 100 }),
  ]);
  const t = await getTranslations("Product");
  const tc = await getTranslations("Categories");

  return (
    <div className="rg-stage relative pb-24 md:pb-28">
      <div
        className="rg-editorial-grid pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
      />
      <MetaViewContent
        contentId={product.sku || product.slug}
        contentName={localize(product.name, locale)}
        value={product.price}
      />

      <div className="container-rg relative pt-24 md:pt-28">
        <nav className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--rg-muted)] md:mb-8">
          <Link
            href="/"
            className="transition hover:text-[color:var(--rg-accent)]"
          >
            {t("home")}
          </Link>
          <span className="text-[color:var(--rg-accent)]/40">/</span>
          <Link
            href="/products"
            className="transition hover:text-[color:var(--rg-accent)]"
          >
            {t("shop")}
          </Link>
          <span className="text-[color:var(--rg-accent)]/40">/</span>
          <Link
            href={`/products?category=${product.category}`}
            className="transition hover:text-[color:var(--rg-accent)]"
          >
            {tc(product.category)}
          </Link>
        </nav>

        <ProductShowcase product={product} />
      </div>

      <div className="relative mt-14 md:mt-20">
        <ProductDetails product={product} />
      </div>

      {reviews.length > 0 ? (
        <div className="relative mt-14 md:mt-20">
          <ProductReviews product={product} reviews={reviews} />
        </div>
      ) : null}

      {related.length > 0 ? (
        <section className="relative mt-16 border-t border-[color:var(--rg-line)] pt-14 md:mt-24 md:pt-20">
          <div className="container-rg">
            <Reveal>
              <div className="mb-10 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--rg-accent)]">
                    {t("shop")}
                  </p>
                  <h2 className="mt-2 font-display text-[clamp(1.9rem,4vw,3rem)] leading-[1.05] tracking-[-0.03em] text-[color:var(--rg-pearl)]">
                    {t("related")}
                  </h2>
                  <div className="rg-home-gold-rule mt-4 w-12" />
                </div>
                <Link href="/products" className="rg-cta shrink-0 self-start">
                  {t("shop")}
                </Link>
              </div>
            </Reveal>
            <StaggerParallax
              className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-4 md:gap-x-7 md:gap-y-0"
              yOffsets={[28, -36, 16, -24]}
            >
              {related.map((item, index) => (
                <div
                  key={item.slug}
                  data-stagger-item
                  className={index % 2 === 0 ? "md:mt-10" : "md:mt-0"}
                >
                  <ProductCard product={item} />
                </div>
              ))}
            </StaggerParallax>
          </div>
        </section>
      ) : null}
    </div>
  );
}
