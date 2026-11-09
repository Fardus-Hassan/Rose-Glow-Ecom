"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { categories, getCoverMedia, products } from "@/data/products";
import { Reveal } from "@/components/motion/Reveal";
import { Slider } from "@/components/ui/Slider";

export function CollectionsStrip() {
  const t = useTranslations("Home");
  const tc = useTranslations("Categories");

  const items = categories.map((category) => {
    const sample = products.find((p) => p.category === category);
    return {
      category,
      cover: sample ? getCoverMedia(sample)?.src : undefined,
    };
  });

  return (
    <section className="bg-[#0e0d0c] py-14 text-[#f4efe8] md:py-20">
      <div className="container-rg">
        <Reveal>
          <div className="mb-6 max-w-xl md:mb-8">
            <h2 className="font-display text-4xl md:text-5xl">
              {t("categoriesTitle")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#f4efe8]/55">
              {t("categoriesSub")}
            </p>
          </div>
        </Reveal>

        <Slider
          dark
          labelPrev={t("sliderPrev")}
          labelNext={t("sliderNext")}
          slideClassName="basis-[72%] sm:basis-[48%] md:basis-[32%] lg:basis-[22%]"
        >
          {items.map(({ category, cover }) => (
            <Link
              key={category}
              href={`/products?category=${category}`}
              className="group relative block aspect-[3/4] overflow-hidden"
            >
              {cover ? (
                <Image
                  src={cover}
                  alt=""
                  fill
                  sizes="(max-width:768px) 72vw, 22vw"
                  className="object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-90"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-display text-2xl">{tc(category)}</p>
                <p className="mt-2 text-[10px] uppercase tracking-[0.22em] text-[#c9a08a] transition group-hover:tracking-[0.26em]">
                  {t("explore")} →
                </p>
              </div>
            </Link>
          ))}
        </Slider>
      </div>
    </section>
  );
}
