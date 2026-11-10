import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProductLanding } from "@/components/landing/ProductLanding";
import { apiFetch } from "@/lib/api";
import { mapApiProduct, type ApiProduct } from "@/lib/catalog";
import { parseLandingConfig, type ProductLandingConfig } from "@/lib/landing";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

type LandingPayload = ApiProduct & {
  landingEnabled?: boolean;
  landingSlug?: string | null;
  landing?: ProductLandingConfig | unknown;
};

async function loadLanding(slug: string) {
  const row = await apiFetch<LandingPayload>(`/landings/${slug}`);
  if (!row?.slug || row.landingEnabled === false) return null;
  return {
    product: mapApiProduct(row),
    landing: parseLandingConfig(row.landing),
    relatedSlugs: parseLandingConfig(row.landing).relatedSlugs,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const data = await loadLanding(slug);
  const t = await getTranslations({ locale, namespace: "LandingPearl" });
  if (!data) {
    return buildPageMetadata({
      path: `/l/${slug}`,
      locale,
      fallbackTitle: t("metaTitle"),
      fallbackDescription: t("metaDescription"),
    });
  }
  const title =
    locale === "bn"
      ? data.landing.metaTitleBn ||
        data.landing.metaTitleEn ||
        data.product.name.bn
      : data.landing.metaTitleEn ||
        data.landing.metaTitleBn ||
        data.product.name.en;
  const description =
    locale === "bn"
      ? data.landing.metaDescriptionBn ||
        data.landing.metaDescriptionEn ||
        data.product.description.bn
      : data.landing.metaDescriptionEn ||
        data.landing.metaDescriptionBn ||
        data.product.description.en;
  return buildPageMetadata({
    path: `/l/${slug}`,
    locale,
    fallbackTitle: `${title} · Rose Glow`,
    fallbackDescription: description,
  });
}

export default async function ProductLandingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const data = await loadLanding(slug);
  if (!data) notFound();

  return (
    <div className="pb-20 lg:pb-0">
      <ProductLanding
        productSlug={data.product.slug}
        product={data.product}
        landing={data.landing}
        relatedSlugs={data.relatedSlugs}
      />
    </div>
  );
}
