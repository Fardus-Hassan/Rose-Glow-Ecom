"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { localize, type ProductMedia } from "@/data/products";
import { cn } from "@/lib/format";
import { mediaVariant } from "@/lib/media";
import { SmartImage } from "@/components/media/SmartImage";
import { SmartVideo } from "@/components/media/SmartVideo";
import { MobileGalleryZoom } from "@/components/product/MobileGalleryZoom";

const ZOOM_SCALE = 2;

export function ProductGallery({
  media,
  discount = 0,
  focusSrc,
}: {
  media: ProductMedia[];
  discount?: number;
  focusSrc?: string;
}) {
  const locale = useLocale();
  const t = useTranslations("Product");
  const [active, setActive] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [hoverPaused, setHoverPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [ratio, setRatio] = useState(4 / 5);
  const [mobileZoomOpen, setMobileZoomOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const shouldPlayVideo = useRef(false);
  const preloaded = useRef<Set<string>>(new Set());
  const swipeRef = useRef({ x: 0, y: 0, swiped: false });
  const ratiosRef = useRef<Record<number, number>>({});
  const activeRef = useRef(0);
  const slidingRef = useRef(false);
  const firstSlide = useRef(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  activeRef.current = active;
  const current = media[active];
  const autoplayOn =
    inView && tabVisible && !hoverPaused && !zooming;

  const mediaRef = useRef(media);
  mediaRef.current = media;
  useEffect(() => {
    if (!focusSrc) return;
    const index = mediaRef.current.findIndex((item) => item.src === focusSrc);
    if (index >= 0) setActive(index);
  }, [focusSrc]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting && entry.intersectionRatio >= 0.4);
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => {
      setTabVisible(document.visibilityState === "visible");
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  useEffect(() => {
    rootRef.current?.querySelectorAll("video").forEach((video) => {
      const slide = video.closest("[data-slide]");
      const index = Number(slide?.getAttribute("data-slide"));
      if (!inView || !tabVisible || index !== active) video.pause();
    });
  }, [inView, tabVisible, active]);

  useEffect(() => {
    const delay = firstSlide.current || reduceMotion ? 0 : 520;
    firstSlide.current = false;
    slidingRef.current = delay > 0;
    const id = window.setTimeout(() => {
      slidingRef.current = false;
      const known = ratiosRef.current[active];
      if (known) setRatio(known);
    }, delay);
    return () => window.clearTimeout(id);
  }, [active, reduceMotion]);

  useEffect(() => {
    setZooming(false);
    if (zoomRef.current) {
      zoomRef.current.style.transform = "scale(1)";
      zoomRef.current.style.transformOrigin = "center center";
    }
  }, [active]);

  useEffect(() => {
    if (media.length < 2) return;
    if (!autoplayOn) return;
    if (current?.type === "video") return;
    if (reduceMotion) return;

    // Restart the timer whenever the active slide changes
    // (manual arrow/thumb click or previous auto-advance).
    const id = window.setTimeout(() => {
      setActive((prev) => (prev + 1) % media.length);
    }, 4200);

    return () => window.clearTimeout(id);
  }, [active, media.length, autoplayOn, current?.type, reduceMotion]);

  const selectMedia = (index: number) => {
    const next = media[index];
    shouldPlayVideo.current = next?.type === "video";
    setActive(index);
  };

  const go = (dir: -1 | 1) => {
    const next = (active + dir + media.length) % media.length;
    selectMedia(next);
  };

  const applyNaturalRatio = (index: number, width: number, height: number) => {
    if (width <= 0 || height <= 0) return;
    const next = width / height;
    ratiosRef.current[index] = next;
    if (index === activeRef.current && !slidingRef.current) setRatio(next);
  };

  const preloadFull = (item: ProductMedia | undefined) => {
    if (!item || item.type !== "image") return;
    const src = mediaVariant(item.src, "full", item.variants);
    if (!src || preloaded.current.has(src)) return;
    preloaded.current.add(src);
    const img = new window.Image();
    img.decoding = "async";
    img.src = src;
  };

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (current?.type !== "image") return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const node = zoomRef.current;
    if (!node) return;

    node.style.transformOrigin = `${x}% ${y}%`;
    node.style.transform = `scale(${ZOOM_SCALE})`;
    setZooming(true);
  };

  const onLeave = () => {
    const node = zoomRef.current;
    if (!node) return;
    node.style.transform = "scale(1)";
    setZooming(false);
  };

  const openMobileZoom = () => {
    if (current?.type !== "image") return;
    // Desktop (wide + fine pointer) keeps hover-zoom; phones/tablets get lightbox.
    const fineDesktop =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      window.matchMedia("(min-width: 768px)").matches;
    if (fineDesktop) return;
    if (swipeRef.current.swiped) return;
    preloadFull(current);
    setMobileZoomOpen(true);
    setHoverPaused(true);
  };

  if (!current) return null;

  const zoomSrc =
    current.type === "image"
      ? mediaVariant(current.src, "full", current.variants)
      : "";

  const thumbs =
    media.length > 1 ? (
      <div className="order-2 -mx-1 flex gap-2 overflow-x-auto px-1 [-ms-overflow-style:none] [scrollbar-width:none] md:order-1 md:mx-0 md:flex-col md:overflow-y-auto md:overflow-x-visible md:px-0 md:max-h-[min(72vh,720px)] [&::-webkit-scrollbar]:hidden">
        {media.map((item, index) => {
          const thumb =
            item.type === "image" ? item.src : item.poster || item.src;
          return (
            <button
              key={`${item.src}-${index}`}
              type="button"
              onClick={() => selectMedia(index)}
              onMouseEnter={() => preloadFull(item)}
              className={cn(
                "relative flex aspect-[4/5] w-14 shrink-0 items-center justify-center overflow-hidden bg-[color:var(--rg-mat)] transition md:w-full",
                active === index
                  ? "ring-1 ring-[color:var(--rg-accent)]"
                  : "opacity-55 ring-1 ring-[color:var(--rg-line)] hover:opacity-100",
              )}
              aria-label={item.type === "video" ? t("video") : t("image")}
              aria-current={active === index ? "true" : undefined}
            >
              <SmartImage
                src={thumb}
                alt=""
                fill
                variant="thumb"
                variants={item.variants}
                blurDataURL={item.blurDataUrl}
                sizesPreset="thumb"
                className="object-contain"
              />
              {item.type === "video" ? (
                <span className="absolute inset-0 flex items-center justify-center bg-[color:var(--rg-paper)]/45">
                  <span className="ml-0.5 h-0 w-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-[color:var(--rg-pearl)]" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    ) : null;

  return (
    <div
      ref={rootRef}
      className={cn(
        "flex flex-col gap-3",
        media.length > 1 &&
          "md:grid md:grid-cols-[68px_minmax(0,1fr)] md:gap-3 lg:grid-cols-[72px_minmax(0,1fr)] lg:gap-4",
      )}
    >
      {thumbs}

      <div
        ref={stageRef}
        role={current.type === "image" ? "button" : undefined}
        tabIndex={current.type === "image" ? 0 : undefined}
        aria-label={current.type === "image" ? t("tapToZoom") : undefined}
        className={cn(
          "relative order-1 flex w-full max-w-full items-center justify-center overflow-hidden bg-[color:var(--rg-mat)] md:order-2",
          current.type === "image" && "cursor-zoom-in",
        )}
        style={{
          aspectRatio: ratio,
          maxHeight: "min(72vh, 720px)",
          width: "100%",
          maxWidth: `min(100%, calc(min(72vh, 720px) * ${ratio}))`,
          marginInline: "auto",
        }}
        onClick={openMobileZoom}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openMobileZoom();
          }
        }}
        onMouseEnter={() => {
          preloadFull(current);
        }}
        onTouchStart={(event) => {
          const touch = event.touches[0];
          if (!touch) return;
          swipeRef.current = { x: touch.clientX, y: touch.clientY, swiped: false };
        }}
        onTouchEnd={(event) => {
          const touch = event.changedTouches[0];
          if (!touch || media.length < 2) return;
          const dx = touch.clientX - swipeRef.current.x;
          const dy = touch.clientY - swipeRef.current.y;
          if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
          swipeRef.current.swiped = true;
          go(dx < 0 ? 1 : -1);
        }}
        onMouseMove={onMove}
        onMouseLeave={() => {
          onLeave();
          if (!mobileZoomOpen) setHoverPaused(false);
        }}
      >
        <div
          className={cn(
            "absolute inset-0 flex will-change-transform",
            !reduceMotion &&
              "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          )}
          style={{ transform: `translate3d(${-active * 100}%, 0, 0)` }}
        >
          {media.map((item, index) => (
            <div
              key={`${item.src}-${index}`}
              data-slide={index}
              className="relative h-full min-w-full shrink-0 basis-full"
            >
              {item.type === "image" ? (
                <SmartImage
                  src={item.src}
                  alt={item.alt ? localize(item.alt, locale) : t("image")}
                  fill
                  variant="detail"
                  variants={item.variants}
                  blurDataURL={item.blurDataUrl}
                  sizesPreset="gallery"
                  priority={index === 0}
                  className="object-contain object-center"
                  onLoadingComplete={(img) => {
                    applyNaturalRatio(index, img.naturalWidth, img.naturalHeight);
                  }}
                />
              ) : (
                <SmartVideo
                  src={item.src}
                  poster={item.poster}
                  className="h-full w-full object-contain object-center"
                  controls
                  loop
                  playsInline
                  preferUnmuted
                  autoPlay={index === active && inView && tabVisible}
                  lazy={index !== active}
                  onLoadedMetadata={(event) => {
                    const video = event.currentTarget;
                    applyNaturalRatio(index, video.videoWidth, video.videoHeight);
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {current.type === "image" ? (
          <div
            ref={zoomRef}
            aria-hidden={!zooming}
            className={cn(
              "absolute inset-0 z-[1] transition-[transform,opacity] duration-200 ease-out will-change-transform",
              zooming ? "opacity-100" : "pointer-events-none opacity-0",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoomSrc}
              alt=""
              decoding="async"
              className="h-full w-full object-contain object-center"
            />
          </div>
        ) : null}

        {discount > 0 && current.type === "image" ? (
          <span className="pointer-events-none absolute left-0 top-5 z-10 bg-[color:var(--rg-accent)] px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-[color:var(--rg-cta-ink)]">
            −{discount}%
          </span>
        ) : null}

        {current.type === "video" ? (
          <span className="pointer-events-none absolute left-0 top-5 z-10 bg-[color:var(--rg-paper)]/90 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-[color:var(--rg-accent)]">
            {t("video")}
          </span>
        ) : null}

        {media.length > 1 ? (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(-1);
              }}
              className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/20 bg-[#0e0d0c]/45 text-[#f3eee8] backdrop-blur-sm transition hover:bg-[#0e0d0c]/70"
              aria-label={t("prevMedia")}
            >
              ←
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                go(1);
              }}
              className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/20 bg-[#0e0d0c]/45 text-[#f3eee8] backdrop-blur-sm transition hover:bg-[#0e0d0c]/70"
              aria-label={t("nextMedia")}
            >
              →
            </button>
          </>
        ) : null}

        {current.type === "image" ? (
          <>
            <span
              className={cn(
                "pointer-events-none absolute bottom-3 right-3 z-10 hidden text-[10px] uppercase tracking-[0.18em] text-[#f3eee8]/80 md:inline",
                zooming ? "opacity-100" : "opacity-0",
              )}
            >
              {t("zoomHint")}
            </span>
            <span className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-sm bg-[#0e0d0c]/55 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#f3eee8]/90 md:hidden">
              {t("tapToZoom")}
            </span>
          </>
        ) : null}
      </div>

      {mobileZoomOpen && current.type === "image" ? (
        <MobileGalleryZoom
          media={media}
          index={active}
          onClose={() => {
            setMobileZoomOpen(false);
            setHoverPaused(false);
          }}
          onIndexChange={(next) => {
            selectMedia(next);
          }}
        />
      ) : null}
    </div>
  );
}
