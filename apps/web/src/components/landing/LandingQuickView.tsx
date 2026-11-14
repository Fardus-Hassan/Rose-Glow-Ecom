"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { localize, type Product } from "@/data/products";
import { formatBdt, cn } from "@/lib/format";

export function LandingQuickView({
  product,
  inBag = false,
  onClose,
  onAdd,
  onRemove,
}: {
  product: Product;
  inBag?: boolean;
  onClose: () => void;
  onAdd: (slug: string) => void;
  onRemove: (slug: string) => void;
}) {
  const t = useTranslations("LandingPearl");
  const tc = useTranslations("Categories");
  const locale = useLocale();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const media = product.media;

  useEffect(() => {
    setActive(0);
    trackRef.current?.scrollTo({ left: 0 });
  }, [product.slug]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const lenis = (
      window as Window & { __rgLenis?: { stop: () => void; start: () => void } }
    ).__rgLenis;
    lenis?.stop();
    return () => {
      document.body.style.overflow = prev;
      lenis?.start();
    };
  }, []);

  const go = (dir: -1 | 1) => {
    if (media.length < 2) return;
    setActive((current) => {
      const next = (current + dir + media.length) % media.length;
      const el = trackRef.current;
      if (el) {
        el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
      }
      return next;
    });
  };

  useEffect(() => {
    if (media.length < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (media[active]?.type === "video") return;

    const id = window.setInterval(() => {
      setActive((current) => {
        const next = (current + 1) % media.length;
        const el = trackRef.current;
        if (el) {
          el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
        }
        return next;
      });
    }, 3000);

    return () => window.clearInterval(id);
  }, [media, active, paused]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && media.length > 1) {
        setActive((current) => {
          const next = (current + 1) % media.length;
          const el = trackRef.current;
          if (el) el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
          return next;
        });
      }
      if (e.key === "ArrowLeft" && media.length > 1) {
        setActive((current) => {
          const next = (current - 1 + media.length) % media.length;
          const el = trackRef.current;
          if (el) el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
          return next;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [media.length, onClose]);

  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
    if (index !== active && index >= 0 && index < media.length) {
      setActive(index);
    }
  };

  const jumpTo = (index: number) => {
    setActive(index);
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="absolute inset-0 bg-[#0e0d0c]/55 rg-fade-in"
        aria-label={t("closePreview")}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        data-lenis-prevent
        className="relative z-10 flex max-h-[92dvh] w-full flex-col border border-[#1c1a19]/10 bg-[#f0ebe4] rg-scale-in sm:max-h-[90vh] sm:max-w-lg"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#1c1a19]/08 px-5 py-4 sm:px-7">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[#c9a08a]">
              {tc(product.category)}
            </p>
            <h3 className="mt-1 font-display text-2xl text-[#1c1a19]">
              {localize(product.name, locale)}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 pt-1 text-[10px] uppercase tracking-[0.18em] text-[#1c1a19]/45"
          >
            {t("closePreview")}
          </button>
        </div>

        <div
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 [-webkit-overflow-scrolling:touch]"
        >
          <div
            className="relative bg-[#e2dacf]"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            onFocusCapture={() => setPaused(true)}
            onBlurCapture={(event) => {
              if (
                !event.currentTarget.contains(
                  event.relatedTarget as Node | null,
                )
              ) {
                setPaused(false);
              }
            }}
          >
            <div
              ref={trackRef}
              data-lenis-prevent
              onScroll={onTrackScroll}
              className="flex aspect-[4/5] snap-x snap-mandatory overflow-x-auto scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {media.map((item, index) => (
                <div
                  key={`${item.src}-${index}`}
                  className="relative h-full w-full shrink-0 snap-center"
                >
                  {item.type === "image" ? (
                    <Image
                      src={item.src}
                      alt={
                        item.alt
                          ? localize(item.alt, locale)
                          : localize(product.name, locale)
                      }
                      fill
                      sizes="(max-width: 640px) 100vw, 512px"
                      className="object-contain"
                      priority={index === 0}
                    />
                  ) : (
                    <video
                      className="h-full w-full object-contain"
                      controls
                      playsInline
                      autoPlay={active === index}
                      poster={item.poster}
                      preload="metadata"
                    >
                      <source src={item.src} type="video/mp4" />
                    </video>
                  )}
                  {item.type === "video" ? (
                    <span className="pointer-events-none absolute left-3 top-3 bg-[#0e0d0c]/80 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[#f4efe8]">
                      {t("video")}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            {media.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/25 bg-[#0e0d0c]/55 text-lg text-[#f4efe8]"
                  aria-label={t("sliderPrev")}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/25 bg-[#0e0d0c]/55 text-lg text-[#f4efe8]"
                  aria-label={t("sliderNext")}
                >
                  →
                </button>
                <p className="pointer-events-none absolute bottom-3 right-3 bg-[#0e0d0c]/55 px-2 py-1 text-[10px] tracking-[0.12em] text-[#f4efe8]">
                  {active + 1}/{media.length}
                </p>
              </>
            ) : null}
          </div>

          {media.length > 1 ? (
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {media.map((item, index) => {
                  const thumb =
                    item.type === "image" ? item.src : item.poster || item.src;
                  return (
                    <button
                      key={`thumb-${item.src}-${index}`}
                      type="button"
                      onClick={() => jumpTo(index)}
                      className={cn(
                        "relative h-14 w-12 shrink-0 overflow-hidden bg-[#e2dacf]",
                        active === index
                          ? "ring-1 ring-[#c9a08a]"
                          : "opacity-60 ring-1 ring-[#1c1a19]/10",
                      )}
                      aria-label={
                        item.type === "video" ? t("video") : t("image")
                      }
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={thumb}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      {item.type === "video" ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-[#0e0d0c]/35 text-[9px] text-[#f4efe8]">
                          ▶
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <div className="flex shrink-0 gap-1.5">
                {media.map((item, index) => (
                  <button
                    key={`dot-${item.src}-${index}`}
                    type="button"
                    onClick={() => jumpTo(index)}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition",
                      active === index ? "bg-[#1c1a19]" : "bg-[#1c1a19]/25",
                    )}
                    aria-label={`Media ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <p className="mt-5 text-lg text-[#1c1a19]">
            {formatBdt(product.price, locale)}
            {product.compareAtPrice ? (
              <span className="ml-2 text-sm text-[#1c1a19]/4 line-through">
                {formatBdt(product.compareAtPrice, locale)}
              </span>
            ) : null}
          </p>
          <p className="mt-3 text-sm leading-7 text-[#1c1a19]/58">
            {localize(product.description, locale)}
          </p>
        </div>

        <div className="flex shrink-0 flex-row gap-2 border-t border-[#1c1a19]/08 bg-[#f0ebe4] p-4 sm:p-5 sm:px-7">
          <button
            type="button"
            onClick={() => {
              if (inBag) onRemove(product.slug);
              else onAdd(product.slug);
              onClose();
            }}
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center px-3 text-[10px] uppercase tracking-[0.16em] sm:min-h-12 sm:px-5 sm:text-[11px] sm:tracking-[0.18em]",
              inBag
                ? "border border-[#1c1a19]/25 text-[#1c1a19]"
                : "bg-[#1c1a19] text-[#f4efe8]",
            )}
          >
            {inBag ? t("remove") : t("addToo")}
          </button>
          <Link
            href={`/product/${product.slug}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center border border-[#1c1a19]/2 px-3 text-[10px] uppercase tracking-[0.16em] text-[#1c1a19] sm:min-h-12 sm:px-5 sm:text-[11px] sm:tracking-[0.18em]"
          >
            {t("fullDetails")}
          </Link>
        </div>
      </div>
    </div>
  );
}
