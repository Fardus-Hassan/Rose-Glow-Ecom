import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { localize } from "@/data/products";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";
import { ProductDetails } from "@/components/product/ProductDetails";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductCard } from "@/components/products/ProductCard";
import { StaggerGrid } from "@/components/motion/StaggerGrid";
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
    fetchReviews({ productSlug: slug, pageSize: 50 }),
  ]);
  const t = await getTranslations("Product");
  const tc = await getTranslations("Categories");

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : 0;

  return (
    <div className="bg-[#f0ebe4] pb-28 md:pb-24">
      <MetaViewContent
        contentId={product.sku || product.slug}
        contentName={localize(product.name, locale)}
        value={product.price}
      />
      <div className="container-rg pt-24 md:pt-28">
        <nav className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-[#1c1a19]/40">
          <Link href="/" className="transition hover:text-[#1c1a19]">
            {t("home")}
          </Link>
          <span className="text-[#c9a08a]/50">/</span>
          <Link href="/products" className="transition hover:text-[#1c1a19]">
            {t("shop")}
          </Link>
          <span className="text-[#c9a08a]/50">/</span>
          <Link
            href={`/products?category=${product.category}`}
            className="transition hover:text-[#1c1a19]"
          >
            {tc(product.category)}
          </Link>
          <span className="text-[#c9a08a]/50">/</span>
          <span className="text-[#1c1a19]/70">
            {localize(product.name, locale)}
          </span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-start lg:gap-10 xl:gap-14">
          <div className="lg:sticky lg:top-28">
            <ProductGallery media={product.media} discount={discount} />
          </div>
          <ProductInfo product={product} />
        </div>
      </div>

      <div className="mt-12 md:mt-16">
        <ProductDetails product={product} />
      </div>

      <div className="mt-14 md:mt-20">
        <ProductReviews product={product} reviews={reviews} />
      </div>

      {related.length > 0 ? (
        <section className="container-rg pt-10 md:pt-16">
          <div className="mb-8 md:mb-10">
            <h2 className="font-display text-3xl text-[#1c1a19] md:text-4xl">
              {t("related")}
            </h2>
            <div className="mt-4 h-px w-12 bg-gradient-to-r from-[#c9a08a] to-transparent" />
          </div>
          <StaggerGrid className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-4 md:gap-x-6 md:gap-y-10">
            {related.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </StaggerGrid>
        </section>
      ) : null}
    </div>
  );
}
