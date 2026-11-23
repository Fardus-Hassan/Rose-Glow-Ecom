"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { localize } from "@/data/products";
import type { Review } from "@/data/reviews";
import { IconStar } from "@/components/icons";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { Slider } from "@/components/ui/Slider";

/**
 * Quote theater — gold stars, deep panels, parallax header.
 */
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

  if (!reviews.length) return null;

  return (
    <section className="relative overflow-hidden bg-[color:var(--rg-paper)] py-20 md:py-32">
      <Parallax
        speed={40}
        className="pointer-events-none absolute -right-10 top-10 select-none font-display text-[clamp(6rem,22vw,16rem)] leading-none text-[color:var(--rg-accent)] opacity-[0.07]"
      >
        ”
      </Parallax>

      <div className="container-rg relative">
        <Reveal>
          <div className="mb-12 max-w-2xl md:mb-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:var(--rg-accent)]">
              {t("reviewsEyebrow")}
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.02] tracking-[-0.03em] text-[color:var(--rg-pearl)]">
              {t("reviewsTitle")}
            </h2>
            <div className="rg-home-gold-rule mt-5 w-16" />
            <p className="mt-5 text-[15px] leading-7 text-white">
              {t("reviewsSub")}
            </p>
          </div>
        </Reveal>

        <Slider
          labelPrev={t("sliderPrev")}
          labelNext={t("sliderNext")}
          slideClassName="basis-[88%] sm:basis-[58%] md:basis-[42%] lg:basis-[34%]"
        >
          {reviews.map((review) => {
            const photos = review.images ?? [];

            return (
              <article
                key={review.id}
                className="flex h-full min-h-[260px] flex-col border border-[color:var(--rg-line)] bg-[color:var(--rg-paper-deep)]/80 p-6 md:min-h-[280px] md:p-8"
              >
                <div className="mb-5 flex gap-1 text-[color:var(--rg-accent)]">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <IconStar key={i} className="h-3.5 w-3.5" />
                  ))}
                </div>

                <p className="flex-1 font-display text-lg leading-8 text-white md:text-xl md:leading-9">
                  “{localize(review.quote, locale)}”
                </p>

                {photos.length > 0 ? (
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {photos.map((src) => (
                      <li key={src}>
                        <button
                          type="button"
                          onClick={() => setLightbox(src)}
                          className="relative block h-[4.5rem] w-[3.75rem] overflow-hidden bg-[color:var(--rg-soft)] ring-1 ring-[color:var(--rg-line)] transition hover:ring-[color:var(--rg-accent)] sm:h-20 sm:w-16"
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

                <div className="mt-6 border-t border-[color:var(--rg-line)] pt-4">
                  <p className="text-sm font-medium text-[color:var(--rg-pearl)]">
                    {localize(review.name, locale)}
                  </p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-[0.18em] text-[color:var(--rg-muted)]">
                    {localize(review.place, locale)}
                  </p>
                </div>
              </article>
            );
          })}
        </Slider>
      </div>

      {lightbox ? (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 p-6"
          role="dialog"
          aria-modal
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            className="absolute right-5 top-5 text-[11px] uppercase tracking-[0.2em] text-[color:var(--rg-pearl)]"
            onClick={() => setLightbox(null)}
          >
            {t("closePhoto")}
          </button>
          <div className="relative h-[70vh] w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
            <Image src={lightbox} alt="" fill className="object-contain" sizes="512px" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
