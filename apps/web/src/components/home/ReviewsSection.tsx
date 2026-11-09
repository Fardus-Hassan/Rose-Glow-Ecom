"use client";

import { useLocale, useTranslations } from "next-intl";
import { reviews } from "@/data/reviews";
import { localize } from "@/data/products";
import { IconStar } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { Slider } from "@/components/ui/Slider";

export function ReviewsSection() {
  const t = useTranslations("Home");
  const locale = useLocale();

  return (
    <section className="bg-[#f0ebe4] py-16 md:py-24">
      <div className="container-rg">
        <Reveal>
          <div className="mb-6 max-w-xl md:mb-8">
            <p className="text-[11px] uppercase tracking-[0.28em] text-[#c9a08a]">
              {t("reviewsEyebrow")}
            </p>
            <h2 className="mt-3 font-display text-4xl text-[#1c1a19] md:text-5xl">
              {t("reviewsTitle")}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#1c1a19]/55">
              {t("reviewsSub")}
            </p>
          </div>
        </Reveal>

        <Slider
          labelPrev={t("sliderPrev")}
          labelNext={t("sliderNext")}
          slideClassName="basis-[88%] sm:basis-[60%] md:basis-[42%] lg:basis-[31%]"
        >
          {reviews.map((review) => (
            <article
              key={review.id}
              className="flex h-full min-h-[240px] flex-col border border-[#1c1a19]/10 bg-[#e7e0d6] p-6 md:min-h-[260px] md:p-7"
            >
              <div className="mb-4 flex gap-1 text-[#c9a08a]">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <IconStar key={i} className="h-3.5 w-3.5" />
                ))}
              </div>

              <p className="flex-1 text-sm leading-7 text-[#1c1a19]/75 md:text-[15px]">
                “{localize(review.quote, locale)}”
              </p>

              <div className="mt-6 border-t border-[#1c1a19]/08 pt-4">
                <p className="text-sm font-medium text-[#1c1a19]">
                  {localize(review.name, locale)}
                </p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-[#1c1a19]/45">
                  {localize(review.place, locale)}
                </p>
              </div>
            </article>
          ))}
        </Slider>
      </div>
    </section>
  );
}
