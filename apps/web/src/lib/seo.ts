import type { Metadata } from "next";
import { fetchSeoMeta } from "./catalog";

export async function buildPageMetadata({
  path,
  locale,
  fallbackTitle,
  fallbackDescription,
}: {
  path: string;
  locale: string;
  fallbackTitle: string;
  fallbackDescription?: string;
}): Promise<Metadata> {
  const seo = await fetchSeoMeta(path, locale === "bn" ? "bn" : "en");
  const title = seo?.title || fallbackTitle;
  const description = seo?.description || fallbackDescription || fallbackTitle;

  return {
    title,
    description,
    keywords: seo?.keywords || undefined,
    alternates: seo?.canonicalUrl
      ? { canonical: seo.canonicalUrl }
      : undefined,
    openGraph: {
      title,
      description,
      images: seo?.ogImage ? [{ url: seo.ogImage }] : undefined,
    },
    robots: seo?.noIndex ? { index: false, follow: false } : undefined,
  };
}
