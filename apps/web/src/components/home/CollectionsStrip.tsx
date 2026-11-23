"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getCoverMedia } from "@/data/products";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { CollectionsStripSkeleton } from "@/components/skeletons/ChromeSkeletons";
import { useCatalog } from "@/store/catalog";

/**
 * Overlapping category runway — giant gold labels, deep image wells.
 */
export function CollectionsStrip() {
  const t = useTranslations("Home");
  const tc = useTranslations("Categories");
  const { ready, categories, products } = useCatalog();

  if (!ready) return <CollectionsStripSkeleton />;

  const items = categories.slice(0, 3).map((category) => {
    const sample = products.find((p) => p.category === category);
    return {
      category,
      cover: sample ? getCoverMedia(sample)?.src : undefined,
    };
  });

  return (
    <section className="relative overflow-hidden bg-[color:var(--rg-paper-deep)] py-20 md:py-32">
      <div className="container-rg relative">
        <Reveal>
          <div className="mb-14 max-w-2xl md:mb-20">
            <h2 className="font-display text-[clamp(2.4rem,6vw,4.75rem)] leading-[1.02] tracking-[-0.03em] text-[color:var(--rg-pearl)]">
              {t("categoriesTitle")}
            </h2>
            <div className="rg-home-gold-rule mt-5 w-16" />
            <p className="mt-5 text-[15px] leading-7 text-[color:var(--rg-muted)] md:text-base">
              {t("categoriesSub")}
            </p>
          </div>
        </Reveal>

        <div className="flex flex-col gap-4 md:gap-5">
          {items.map(({ category, cover }, i) => (
            <Reveal key={category} delay={i * 0.1}>
              <Link
                href={`/products?category=${category}`}
                className="group relative block min-h-[42vw] overflow-hidden md:min-h-[28vh] lg:min-h-[34vh]"
              >
                <div className="absolute inset-0 bg-[color:var(--rg-soft)]">
                  {cover ? (
                    <Parallax
                      speed={28 + i * 10}
                      scale={1.1}
                      className="absolute inset-[-12%]"
                    >
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="100vw"
                        className="object-cover object-center opacity-70 transition duration-700 group-hover:opacity-90 group-hover:scale-[1.03]"
                      />
                    </Parallax>
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--rg-paper)]/90 via-[color:var(--rg-paper)]/35 to-transparent" />
                </div>

                <div className="relative flex h-full min-h-[42vw] items-center px-6 py-10 md:min-h-[28vh] md:px-12 lg:min-h-[34vh]">
                  <p className="font-display text-[clamp(2.2rem,8vw,5.5rem)] leading-none tracking-[-0.03em] text-[color:var(--rg-pearl)] transition group-hover:text-[color:var(--rg-accent)]">
                    {tc(category)}
                  </p>
                  <span className="ml-auto hidden text-[10px] uppercase tracking-[0.28em] text-[color:var(--rg-accent)] md:inline">
                    {t("explore")} →
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {categories.length > 3 ? (
          <div className="mt-12 flex justify-start">
            <Link href="/products" className="rg-cta">
              {t("explore")}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
