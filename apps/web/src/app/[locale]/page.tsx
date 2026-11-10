import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { PromiseBar } from "@/components/home/PromiseBar";
import { Spotlight } from "@/components/home/Spotlight";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { CollectionsStrip } from "@/components/home/CollectionsStrip";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { AtelierBand } from "@/components/home/AtelierBand";
import {
  fetchHeroContent,
  fetchProducts,
  fetchReviews,
} from "@/lib/catalog";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  return buildPageMetadata({
    path: "/",
    locale,
    fallbackTitle: t("title"),
    fallbackDescription: t("description"),
  });
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [products, reviews, hero] = await Promise.all([
    fetchProducts({ pageSize: 24 }),
    fetchReviews({ pageSize: 8 }),
    fetchHeroContent(),
  ]);

  return (
    <>
      <Hero locale={locale} content={hero} />
      <PromiseBar />
      <Spotlight products={products} />
      <FeaturedSection products={products} />
      <CollectionsStrip />
      <ReviewsSection reviews={reviews} />
      <AtelierBand />
    </>
  );
}
