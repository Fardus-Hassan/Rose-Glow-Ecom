import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localize } from "@/data/products";
import { EditorialPageHeader } from "@/components/layout/EditorialPageHeader";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { fetchCmsPage } from "@/lib/catalog";
import { stripHtml } from "@/lib/rich-text";
import { buildPageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

const ABOUT_IMAGE =
  "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=1600&q=80";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  const page = await fetchCmsPage("about");
  const fallbackTitle = page
    ? localize(page.seoTitle, locale) || localize(page.title, locale)
    : `${t("title")} · Rose Glow`;
  const fallbackDescription = page
    ? localize(page.seoDescription, locale) || localize(page.body, locale)
    : t("lead");

  return buildPageMetadata({
    path: "/about",
    locale,
    fallbackTitle,
    fallbackDescription,
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");
  const page = await fetchCmsPage("about");
  const title = page ? localize(page.title, locale) : t("title");
  const lead = page
    ? stripHtml(localize(page.body, locale))
    : t("lead");

  return (
    <div className="relative overflow-hidden bg-[color:var(--rg-paper)] pb-16 pt-28 md:pb-24 md:pt-36">
      <div
        className="rg-editorial-grid pointer-events-none absolute inset-0 opacity-45"
        aria-hidden
      />

      <div className="container-rg relative">
        <EditorialPageHeader eyebrow={t("eyebrow")} title={title} lead={lead} />
      </div>

      <div className="container-rg relative mt-12 md:mt-16">
        <Reveal>
          <div className="relative">
            <div className="absolute -inset-x-3 -bottom-4 top-8 -z-10 bg-[color:var(--rg-blush)] md:-inset-x-6" />
            <div className="relative aspect-[16/10] overflow-hidden bg-white md:aspect-[21/9]">
              <Parallax speed={36} scale={1.06} className="absolute inset-[-8%]">
                <Image
                  src={ABOUT_IMAGE}
                  alt=""
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                  priority
                />
              </Parallax>
            </div>
          </div>
        </Reveal>
      </div>

      <div className="container-rg relative mt-14 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-8">
        {(
          [
            [t("pillar1Title"), t("pillar1Body")],
            [t("pillar2Title"), t("pillar2Body")],
            [t("pillar3Title"), t("pillar3Body")],
          ] as const
        ).map(([pillarTitle, body], i) => (
          <Reveal key={pillarTitle} delay={i * 0.08}>
            <div className="border-t border-[color:var(--rg-line)] pt-6">
              <h2 className="font-display text-2xl text-[color:var(--rg-charcoal)] md:text-3xl">
                {pillarTitle}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--rg-muted)]">
                {body}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="container-rg relative mt-14 md:mt-20">
        <Link href="/products" className="rg-cta">
          {t("cta")}
        </Link>
      </div>
    </div>
  );
}
