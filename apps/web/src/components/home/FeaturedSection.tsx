"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/data/products";
import { Reveal } from "@/components/motion/Reveal";
import { StaggerParallax } from "@/components/motion/StaggerParallax";
import { ProductCard } from "@/components/products/ProductCard";

/**
 * Runway grid — staggered heights, restless parallax, gold header.
 */
export function FeaturedSection({ products }: { products: Product[] }) {
  const t = useTranslations("Home");
  const list = products.slice(0, 8);

  return (
    <section className="relative overflow-hidden bg-[color:var(--rg-paper)] py-20 md:py-32">
      <div
        className="rg-editorial-grid pointer-events-none absolute inset-0 opacity-80"
        aria-hidden
      />

      <div className="container-rg relative">
        <Reveal>
          <div className="mb-14 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:var(--rg-accent)]">
                {t("featuredCta")}
              </p>
              <h2 className="mt-4 font-display text-[clamp(2.4rem,6vw,4.75rem)] leading-[1.02] tracking-[-0.03em] text-[color:var(--rg-pearl)]">
                {t("featuredTitle")}
              </h2>
              <div className="rg-home-gold-rule mt-5 w-16" />
              <p className="mt-5 max-w-md text-[15px] leading-7 text-[color:var(--rg-muted)] md:text-base">
                {t("featuredSub")}
              </p>
            </div>
            <Link
              href="/products"
              className="rg-cta shrink-0 self-start md:self-auto"
            >
              {t("featuredCta")}
            </Link>
          </div>
        </Reveal>

        <StaggerParallax
          className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 md:grid-cols-4 md:gap-x-7 md:gap-y-0"
          yOffsets={[48, -56, 28, -40, 44, -24, 36, -48]}
        >
          {list.map((product, index) => (
            <div
              key={product.slug}
              data-stagger-item
              className={
                index % 2 === 0
                  ? "md:mt-20"
                  : index % 3 === 0
                    ? "md:mt-8"
                    : "md:mt-2"
              }
            >
              <ProductCard product={product} priority={index < 2} />
            </div>
          ))}
        </StaggerParallax>
      </div>
    </section>
  );
}
