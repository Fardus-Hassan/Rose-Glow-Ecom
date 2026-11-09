"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { localize, type Product } from "@/data/products";
import { reviews } from "@/data/reviews";
import { IconStar } from "@/components/icons";
import { Pagination } from "@/components/ui/Pagination";

const REVIEW_PAGE_SIZE = 2;

export function ProductReviews({ product }: { product: Product }) {
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
  }, [page]);

  const goToPage = (next: number) => {
    setPage(next);
    document
      .getElementById("product-reviews")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="product-reviews" className="container-rg scroll-mt-28">
      <div className="mb-8 md:mb-10">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
          {t("reviewsEyebrow")}
        </p>
        <h2 className="mt-3 font-display text-3xl text-[#1c1a19] md:text-4xl">
          {t("reviewsTitle")}
        </h2>
        <div className="mt-4 h-px w-12 bg-gradient-to-r from-[#c9a08a] to-transparent" />
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(220px,0.35fr)_minmax(0,1fr)] lg:gap-14">
        <div className="border-t border-[#1c1a19]/10 pt-6 lg:border-t-0 lg:pt-0">
          <p className="font-display text-5xl text-[#1c1a19] md:text-6xl">
            {product.rating.toFixed(1)}
          </p>
          <div className="mt-3 flex items-center gap-1 text-[#c9a08a]">
            {Array.from({ length: 5 }).map((_, i) => (
              <IconStar
                key={i}
                className={`h-4 w-4 ${i < filled ? "opacity-100" : "opacity-25"}`}
              />
            ))}
          </div>
          <p className="mt-3 text-sm text-[#1c1a19]/55">
            {t("reviewsSummary", { count: product.reviewCount })}
          </p>
          <p className="mt-1 text-xs text-[#1c1a19]/4">
            {t("purchased", { count: product.soldCount })}
          </p>
        </div>

        <div>
          <ul className="divide-y divide-[#1c1a19]/10 border-y border-[#1c1a19]/10">
            {notes.map((review) => (
              <li key={review.id} className="py-6 md:py-7">
                <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <div className="flex items-center gap-0.5 text-[#c9a08a]">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <IconStar key={i} className="h-3 w-3" />
                    ))}
                  </div>
                  <p className="text-sm text-[#1c1a19]">
                    {localize(review.name, locale)}
                  </p>
                  <span className="text-[#1c1a19]/25">·</span>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#1c1a19]/4">
                    {localize(review.place, locale)}
                  </p>
                </div>
                <p className="max-w-2xl text-sm leading-7 text-[#1c1a19]/65 md:text-[15px] md:leading-8">
                  “{localize(review.quote, locale)}”
                </p>

                {review.images && review.images.length > 0 ? (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {review.images.map((src) => (
                      <li key={src}>
                        <button
                          type="button"
                          onClick={() => setLightbox(src)}
                          className="relative block h-20 w-16 overflow-hidden bg-[#e2dacf] sm:h-24 sm:w-20"
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
