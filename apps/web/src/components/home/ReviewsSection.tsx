"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { localize } from "@/data/products";
import type { Review } from "@/data/reviews";
import { IconStar } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { Slider } from "@/components/ui/Slider";

export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const t = useTranslations("Home");
  const locale = useLocale();
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const lenis = (
      window as Window & { __rgLenis?: { stop: () => void; start: () => void } }
    ).__rgLenis;
    lenis?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
      lenis?.start();
    };
  }, [lightbox]);

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
          slideClassName="basis-[88%] sm:basis-[58%] md:basis-[42%] lg:basis-[31%]"
        >
          {reviews.map((review) => {
            const photos = review.images ?? [];

            return (
              <article
                key={review.id}
                className="flex h-full min-h-[240px] flex-col border border-[#1c1a19]/10 bg-[#e7e0d6] p-5 md:min-h-[260px] md:p-7"
              >
                <div className="mb-4 flex gap-1 text-[#c9a08a]">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <IconStar key={i} className="h-3.5 w-3.5" />
                  ))}
                </div>

                <p className="flex-1 text-sm leading-7 text-[#1c1a19]/75 md:text-[15px]">
                  “{localize(review.quote, locale)}”
                </p>

                {photos.length > 0 ? (
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {photos.map((src) => (
                      <li key={src}>
                        <button
                          type="button"
                          onClick={() => setLightbox(src)}
                          className="relative block h-[4.5rem] w-[3.75rem] overflow-hidden bg-[#e2dacf] ring-1 ring-[#1c1a19]/10 transition hover:ring-[#c9a08a] sm:h-20 sm:w-16"
                          aria-label={t("customerPhoto")}
                        >
                          <Image
                            src={src}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover transition duration-300 hover:scale-[1.04]"
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}

                <div className="mt-5 border-t border-[#1c1a19]/08 pt-4">
                  <p className="text-sm font-medium text-[#1c1a19]">
                    {localize(review.name, locale)}
                  </p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.16em] text-[#1c1a19]/45">
                    {localize(review.place, locale)}
                  </p>
                </div>
              </article>
            );
          })}
        </Slider>
      </div>

      {lightbox ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-[#0e0d0c]/65 backdrop-blur-[2px] rg-fade-in"
            aria-label={t("closePhoto")}
            onClick={() => setLightbox(null)}
          />
          <div className="relative z-10 max-h-[85vh] w-full max-w-lg rg-scale-in">
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-[10px] uppercase tracking-[0.18em] text-[#f4efe8]/85"
            >
              {t("closePhoto")}
            </button>
            <div className="relative aspect-[4/5] overflow-hidden bg-[#1c1a19]">
              <Image
                src={lightbox}
                alt=""
                fill
                sizes="512px"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
