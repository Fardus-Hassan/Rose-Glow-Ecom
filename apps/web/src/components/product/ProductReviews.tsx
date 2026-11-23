"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { localize, type Product } from "@/data/products";
import type { Review } from "@/data/reviews";
import { IconStar } from "@/components/icons";
import { Pagination } from "@/components/ui/Pagination";
import { Reveal } from "@/components/motion/Reveal";

const REVIEW_PAGE_SIZE = 2;

export function ProductReviews({
  product,
  reviews,
}: {
  product: Product;
  reviews: Review[];
}) {
  const t = useTranslations("Product");
  const locale = useLocale();
  const filled = Math.round(product.rating);
  const [page, setPage] = useState(1);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(reviews.length / REVIEW_PAGE_SIZE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox]);

  const notes = useMemo(() => {
    const start = (page - 1) * REVIEW_PAGE_SIZE;
    return reviews.slice(start, start + REVIEW_PAGE_SIZE);
  }, [page, reviews]);

  const goToPage = (next: number) => {
    setPage(next);
    document
      .getElementById("product-reviews")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      id="product-reviews"
      className="scroll-mt-28 border-y border-[color:var(--rg-line)] bg-[color:var(--rg-paper-deep)] py-12 md:py-16"
    >
      <div className="container-rg">
        <div
          className={
            reviews.length
              ? "grid gap-10 lg:grid-cols-[minmax(200px,0.32fr)_minmax(0,1fr)] lg:items-start lg:gap-14"
              : ""
          }
        >
          <Reveal>
            <div className="lg:sticky lg:top-[7.25rem]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--rg-accent)]">
                {t("reviewsEyebrow")}
              </p>
              <h2 className="mt-2.5 font-display text-[clamp(1.75rem,3vw,2.5rem)] tracking-[-0.02em] text-[color:var(--rg-pearl)]">
                {t("reviewsTitle")}
              </h2>
              <div className="rg-home-gold-rule mt-4 w-12" />

              {product.rating > 0 ? (
                <>
                  <p className="mt-6 font-display text-5xl text-[color:var(--rg-pearl)] md:text-6xl">
                    {product.rating.toFixed(1)}
                  </p>
                  <div className="mt-2.5 flex items-center gap-1 text-[color:var(--rg-accent)]">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <IconStar
                        key={i}
                        className={`h-3.5 w-3.5 ${i < filled ? "opacity-100" : "opacity-25"}`}
                      />
                    ))}
                  </div>
                </>
              ) : null}
              {product.reviewCount > 0 ? (
                <p className="mt-3 text-sm text-[color:var(--rg-muted)]">
                  {t("reviewsSummary", { count: product.reviewCount })}
                </p>
              ) : (
                <p className="mt-3 text-sm text-[color:var(--rg-muted)]">
                  {t("reviewsEmpty")}
                </p>
              )}
              {product.soldCount > 0 ? (
                <p className="mt-1 text-xs text-[color:var(--rg-muted)]">
                  {t("purchased", { count: product.soldCount })}
                </p>
              ) : null}
            </div>
          </Reveal>

          {reviews.length > 0 ? (
            <div>
              <ul className="divide-y divide-[color:var(--rg-line)] border-y border-[color:var(--rg-line)]">
                {notes.map((review) => (
                  <li key={review.id} className="py-5 md:py-6">
                    <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <div className="flex items-center gap-0.5 text-[color:var(--rg-accent)]">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <IconStar key={i} className="h-3 w-3" />
                        ))}
                      </div>
                      <p className="text-sm text-[color:var(--rg-pearl)]">
                        {localize(review.name, locale)}
                      </p>
                      <span className="text-[color:var(--rg-muted)]">·</span>
                      <p className="text-[11px] uppercase tracking-[0.14em] text-[color:var(--rg-muted)]">
                        {localize(review.place, locale)}
                      </p>
                    </div>
                    <p className="max-w-2xl text-sm leading-7 text-[color:var(--rg-muted)] md:text-[15px]">
                      “{localize(review.quote, locale)}”
                    </p>

                    {review.images && review.images.length > 0 ? (
                      <ul className="mt-3.5 flex flex-wrap gap-2">
                        {review.images.map((src) => (
                          <li key={src}>
                            <button
                              type="button"
                              onClick={() => setLightbox(src)}
                              className="relative block h-20 w-16 overflow-hidden bg-[color:var(--rg-mat)] sm:h-24 sm:w-20"
                              aria-label={t("reviewPhoto")}
                            >
                              <Image
                                src={src}
                                alt=""
                                fill
                                sizes="80px"
                                className="object-cover transition duration-300 hover:scale-[1.04]"
                              />
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                ))}
              </ul>

              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={goToPage}
                className="mt-8 border-t-0 pt-0 md:mt-10 md:pt-0"
              />
            </div>
          ) : null}
        </div>
      </div>

      {lightbox ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-[color:var(--rg-paper)]/80 backdrop-blur-[2px] rg-fade-in"
            aria-label={t("closePhoto")}
            onClick={() => setLightbox(null)}
          />
          <div className="relative z-10 max-h-[85vh] w-full max-w-lg rg-scale-in">
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-[10px] uppercase tracking-[0.18em] text-[color:var(--rg-pearl)]"
            >
              {t("closePhoto")}
            </button>
            <div className="relative aspect-[4/5] overflow-hidden bg-[color:var(--rg-mat)]">
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
