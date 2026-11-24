"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  chosenOffer,
  defaultOptionId,
  galleryForOffer,
  localize,
  type Product,
} from "@/data/products";
import { formatBdt, cn } from "@/lib/format";
import { stripHtml } from "@/lib/rich-text";
import { VariantChoices } from "@/components/product/VariantChoices";
import { MobileGalleryZoom } from "@/components/product/MobileGalleryZoom";
import { StruckPrice } from "@/components/ui/StruckPrice";
import { useCategoryLabel } from "@/store/catalog";

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
  onAdd: (slug: string, optionId?: string) => void;
  onRemove: (slug: string) => void;
}) {
  const t = useTranslations("LandingPearl");
  const tProduct = useTranslations("Product");
  const categoryLabel = useCategoryLabel();
  const locale = useLocale();
  const [optionId, setOptionId] = useState(defaultOptionId(product));
  const offer = chosenOffer(product, optionId);
  const media = useMemo(
    () => galleryForOffer(product, offer.media),
    [product, offer.media],
  );
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ x: 0, y: 0, moved: false });
  const zoomOpenRef = useRef(false);
  zoomOpenRef.current = zoomOpen;

  useEffect(() => {
    setOptionId(defaultOptionId(product));
    setActive(0);
    setZoomOpen(false);
    trackRef.current?.scrollTo({ left: 0 });
  }, [product.slug]);

  useEffect(() => {
    setActive(0);
    trackRef.current?.scrollTo({ left: 0 });
  }, [offer.optionId]);

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
    if (media.length < 2 || paused || zoomOpen) return;
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
  }, [media, active, paused, zoomOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (zoomOpenRef.current) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && media.length > 1) go(1);
      if (e.key === "ArrowLeft" && media.length > 1) go(-1);
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

  const compare = offer.compareAtPrice;

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
        className="rg-stage relative z-10 flex max-h-[92dvh] w-full flex-col border border-[color:var(--rg-line)] rg-scale-in sm:max-h-[90vh] sm:max-w-lg"
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[color:var(--rg-line)] px-5 py-4 sm:px-7">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--rg-accent)]">
              {categoryLabel(product.category, product.categoryName)}
            </p>
            <h3 className="mt-1 font-display text-2xl text-[color:var(--rg-pearl)]">
              {localize(product.name, locale)}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 pt-1 text-[10px] uppercase tracking-[0.18em] text-[color:var(--rg-muted)]"
          >
            {t("closePreview")}
          </button>
        </div>

        <div
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 [-webkit-overflow-scrolling:touch]"
        >
          <div
            className="relative bg-[color:var(--rg-paper-deep)]"
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
                  className={cn(
                    "relative h-full w-full shrink-0 snap-center",
                    item.type === "image" && "cursor-zoom-in",
                  )}
                  onPointerDown={(event) => {
                    dragRef.current = {
                      x: event.clientX,
                      y: event.clientY,
                      moved: false,
                    };
                  }}
                  onPointerMove={(event) => {
                    const dx = Math.abs(event.clientX - dragRef.current.x);
                    const dy = Math.abs(event.clientY - dragRef.current.y);
                    if (dx > 8 || dy > 8) dragRef.current.moved = true;
                  }}
                  onClick={() => {
                    if (item.type !== "image" || dragRef.current.moved) return;
                    setPaused(true);
                    setActive(index);
                    setZoomOpen(true);
                  }}
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
                    <span className="pointer-events-none absolute left-3 top-3 bg-[#0e0d0c]/80 px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-[color:var(--rg-pearl)]">
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
                  className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/25 bg-[#0e0d0c]/55 text-lg text-[color:var(--rg-pearl)]"
                  aria-label={t("sliderPrev")}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-white/25 bg-[#0e0d0c]/55 text-lg text-[color:var(--rg-pearl)]"
                  aria-label={t("sliderNext")}
                >
                  →
                </button>
                <p className="pointer-events-none absolute bottom-3 right-3 bg-[#0e0d0c]/55 px-2 py-1 text-[10px] tracking-[0.12em] text-[color:var(--rg-pearl)]">
                  {active + 1}/{media.length}
                </p>
              </>
            ) : null}
            {media[active]?.type === "image" ? (
              <span className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-sm bg-[#0e0d0c]/55 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#f3eee8]/90">
                {tProduct("tapToZoom")}
              </span>
            ) : null}
          </div>

          {media.length > 1 ? (
            <div className="mt-3">
              <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {media.map((item, index) => {
                  const thumb =
                    item.type === "video" ? item.poster || item.src : item.src;
                  return (
                    <button
                      key={`thumb-${item.src}-${index}`}
                      type="button"
                      onClick={() => jumpTo(index)}
                      className={cn(
                        "relative aspect-[4/5] w-14 shrink-0 overflow-hidden bg-[color:var(--rg-paper-deep)] transition",
                        active === index
                          ? "ring-1 ring-[color:var(--rg-accent)]"
                          : "opacity-65 ring-1 ring-[color:var(--rg-line)]",
                      )}
                    >
                      {thumb ? (
                        <Image
                          src={thumb}
                          alt=""
                          fill
                          sizes="56px"
                          className="object-contain"
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 flex shrink-0 gap-1.5">
                {media.map((item, index) => (
                  <button
                    key={`dot-${item.src}-${index}`}
                    type="button"
                    onClick={() => jumpTo(index)}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full transition",
                      active === index ? "bg-[color:var(--rg-accent)]" : "bg-[color:var(--rg-pearl)]/25",
                    )}
                    aria-label={`Media ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : null}

          <p className="mt-5 flex flex-wrap items-end gap-3">
            <span className="font-display text-[clamp(1.7rem,2.4vw,2.1rem)] leading-none text-[#f3d78a]">
              {formatBdt(offer.price, locale)}
            </span>
            {compare ? (
              <StruckPrice className="mb-0.5">{formatBdt(compare, locale)}</StruckPrice>
            ) : null}
          </p>
          <VariantChoices
            options={product.options || []}
            selectedId={offer.optionId}
            onSelect={setOptionId}
          />
          <p className="mt-3 text-sm leading-7 text-white">
            {stripHtml(localize(product.description, locale))}
          </p>
        </div>

        <div className="flex shrink-0 flex-row gap-2 border-t border-[color:var(--rg-line)] bg-[color:var(--rg-paper)] p-4 sm:p-5 sm:px-7">
          <button
            type="button"
            disabled={!inBag && !offer.inStock}
            onClick={() => {
              if (inBag) onRemove(product.slug);
              else onAdd(product.slug, offer.optionId);
              onClose();
            }}
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center px-3 text-[10px] uppercase tracking-[0.16em] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-12 sm:px-5 sm:text-[11px] sm:tracking-[0.18em]",
              inBag
                ? "border border-[color:var(--rg-line)] text-[color:var(--rg-pearl)]"
                : "bg-[color:var(--rg-accent)] text-[color:var(--rg-cta-ink)]",
            )}
          >
            {inBag ? t("remove") : t("addToo")}
          </button>
          <Link
            href={`/product/${product.slug}`}
            className="inline-flex min-h-11 flex-1 items-center justify-center border border-[color:var(--rg-line)] px-3 text-[10px] uppercase tracking-[0.16em] text-[color:var(--rg-pearl)] sm:min-h-12 sm:px-5 sm:text-[11px] sm:tracking-[0.18em]"
          >
            {t("fullDetails")}
          </Link>
        </div>
      </div>

      {zoomOpen && media[active]?.type === "image" ? (
        <MobileGalleryZoom
          media={media}
          index={active}
          onClose={() => {
            setZoomOpen(false);
            setPaused(false);
          }}
          onIndexChange={(next) => jumpTo(next)}
        />
      ) : null}
    </div>
  );
}
