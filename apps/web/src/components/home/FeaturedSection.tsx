"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getCoverMedia, localize, type Product } from "@/data/products";
import { formatBdt } from "@/lib/format";
import { Reveal } from "@/components/motion/Reveal";
import { Slider } from "@/components/ui/Slider";
import { SmartImage } from "@/components/media/SmartImage";

export function FeaturedSection({ products }: { products: Product[] }) {
  const t = useTranslations("Home");
  const tc = useTranslations("Categories");
  const locale = useLocale();
  const showcase = products;

  return (
    <section className="bg-[#f0ebe4] py-16 md:py-24">
      <div className="container-rg">
        <Reveal>
          <div className="mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <h2 className="font-display text-4xl text-[#1c1a19] md:text-5xl">
                {t("featuredTitle")}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#1c1a19]/55">
                {t("featuredSub")}
              </p>
            </div>
            <Link
              href="/products"
              className="text-[11px] uppercase tracking-[0.22em] text-[#1c1a19]/70 underline-offset-8 hover:text-[#1c1a19] hover:underline"
            >
              {t("featuredCta")} →
            </Link>
          </div>
        </Reveal>

        <Slider
          labelPrev={t("sliderPrev")}
          labelNext={t("sliderNext")}
          slideClassName="basis-[70%] sm:basis-[45%] md:basis-[32%] lg:basis-[24%]"
        >
          {showcase.map((product, index) => {
            const cover = getCoverMedia(product);
            const coverSrc =
              cover?.type === "video" ? cover.poster || cover.src : cover?.src;
            return (
              <article key={product.slug}>
                <Link href={`/product/${product.slug}`} className="group block">
                  <div
                    className="relative aspect-[4/5] overflow-hidden bg-[#ebe4dc]"
                    style={{ position: "relative" }}
                  >
                    {coverSrc ? (
                      <SmartImage
                        src={coverSrc}
                        alt={localize(product.name, locale)}
                        fill
                        variant="card"
                        variants={cover?.variants}
                        blurDataURL={cover?.blurDataUrl}
                        sizesPreset="card"
                        priority={index < 2}
                        className="object-cover transition duration-700 group-hover:scale-[1.04]"
                      />
                    ) : null}
                  </div>
                  <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[#1c1a19]/45">
                    {tc(product.category)}
                  </p>
                  <h3 className="mt-1 font-display text-xl text-[#1c1a19] md:text-2xl">
                    {localize(product.name, locale)}
                  </h3>
                  <p className="mt-2 text-sm text-[#1c1a19]/75">
                    {formatBdt(product.price, locale)}
                  </p>
                </Link>
              </article>
            );
          })}
        </Slider>
      </div>
    </section>
  );
}
