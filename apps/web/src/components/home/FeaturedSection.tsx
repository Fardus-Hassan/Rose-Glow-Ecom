"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/data/products";
import { Reveal } from "@/components/motion/Reveal";
import { Slider } from "@/components/ui/Slider";
import { ProductCard } from "@/components/products/ProductCard";

export function FeaturedSection({ products }: { products: Product[] }) {
  const t = useTranslations("Home");

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
          {products.map((product, index) => (
            <ProductCard
              key={product.slug}
              product={product}
              priority={index < 2}
            />
          ))}
        </Slider>
      </div>
    </section>
  );
}
