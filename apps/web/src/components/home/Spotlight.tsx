import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCoverMedia, localize, type Product } from "@/data/products";
import { formatBdt } from "@/lib/format";
import { stripHtml } from "@/lib/rich-text";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";

/**
 * Cinematic spotlight — full-bleed product stage, gold type, one CTA.
 */
export async function Spotlight({ products }: { products: Product[] }) {
  const t = await getTranslations("Home");
  const locale = await getLocale();
  const product = products.find((p) => p.featured) ?? products[0];
  if (!product) return null;
  const cover = getCoverMedia(product);
  const short = product.shortDescription
    ? stripHtml(localize(product.shortDescription, locale)).trim()
    : "";
  const blurb =
    short || stripHtml(localize(product.description, locale));

  return (
    <section className="relative isolate min-h-[88svh] overflow-hidden bg-[color:var(--rg-paper)] md:min-h-[92svh]">
      <div className="absolute inset-0">
        <Parallax speed={55} scale={1.1} className="absolute inset-[-10%]">
          {cover ? (
            <Image
              src={cover.src}
              alt={localize(product.name, locale)}
              fill
              sizes="100vw"
              className="object-cover object-center"
              priority={false}
            />
          ) : null}
        </Parallax>
        <div className="absolute inset-0 bg-[color:var(--rg-paper)]/55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--rg-paper)] via-[color:var(--rg-paper)]/40 to-transparent" />
      </div>

      <div className="container-rg relative flex min-h-[88svh] flex-col justify-end pb-16 pt-28 md:min-h-[92svh] md:pb-24 md:pt-32">
        <Reveal>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:var(--rg-accent)]">
            {t("spotlightEyebrow")}
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.4rem,7vw,5.5rem)] leading-[1.02] tracking-[-0.03em] text-[color:var(--rg-pearl)]">
            {localize(product.name, locale)}
          </h2>
          <div className="rg-home-gold-rule mt-6 w-20" />
          <p className="mt-6 max-w-lg text-[15px] leading-7 text-white md:text-base md:leading-8">
            {blurb}
          </p>
          <div className="mt-8 flex flex-wrap items-end gap-6 md:mt-10">
            <p className="font-display text-3xl text-[color:var(--rg-accent)] md:text-4xl">
              {formatBdt(product.price, locale)}
            </p>
            <Link
              href={`/product/${product.slug}`}
              className="rg-cta-solid min-h-12 px-8"
            >
              {t("spotlightCta")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
