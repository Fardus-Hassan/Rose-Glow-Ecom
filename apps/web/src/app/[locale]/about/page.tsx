import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { localize } from "@/data/products";
import { fetchCmsPage } from "@/lib/catalog";
import { buildPageMetadata } from "@/lib/seo";
import { mediaUrl } from "@/lib/media";

export const dynamic = "force-dynamic";

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
  const lead = page ? localize(page.body, locale) : t("lead");

  return (
    <div className="pb-16 pt-28 md:pb-24 md:pt-36">
      <div className="container-rg max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.05] tracking-[-0.03em] text-[#1c1a19]">
          {title}
        </h1>
        <div className="mt-5 h-px w-14 bg-gradient-to-r from-[#c9a08a] to-transparent" />
        <p className="mt-8 text-base leading-8 text-[#1c1a19]/65 md:text-lg md:leading-9">
          {lead}
        </p>
      </div>

      <div className="container-rg mt-12 md:mt-16">
        <div className="relative aspect-[16/9] overflow-hidden md:aspect-[21/9]">
          <Image
            src={mediaUrl("/home/atelier-gold-spread.jpg")}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
        </div>
      </div>

      <div className="container-rg mt-14 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-8">
        {(
          [
            [t("pillar1Title"), t("pillar1Body")],
            [t("pillar2Title"), t("pillar2Body")],
            [t("pillar3Title"), t("pillar3Body")],
          ] as const
        ).map(([pillarTitle, body]) => (
          <div key={pillarTitle} className="border-t border-[#1c1a19]/10 pt-6">
            <h2 className="font-display text-2xl text-[#1c1a19]">
              {pillarTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#1c1a19]/55">{body}</p>
          </div>
        ))}
      </div>

      <div className="container-rg mt-14 md:mt-20">
        <Link
          href="/products"
          className="inline-flex min-h-12 items-center justify-center bg-[#1c1a19] px-8 text-[11px] uppercase tracking-[0.2em] text-[#f4efe8] transition hover:bg-black"
        >
          {t("cta")}
        </Link>
      </div>
    </div>
  );
}
