"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import gsap from "gsap";
import { localize, type ProductMedia } from "@/data/products";
import { cn } from "@/lib/format";

export function ProductGallery({
  media,
  discount = 0,
}: {
  media: ProductMedia[];
  discount?: number;
}) {
  const locale = useLocale();
  const t = useTranslations("Product");
  const [active, setActive] = useState(0);
  const [zooming, setZooming] = useState(false);
  const [paused, setPaused] = useState(false);
  const [ratio, setRatio] = useState(4 / 5);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const shouldPlayVideo = useRef(false);
  const current = media[active];

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.fromTo(
      stage,
      { opacity: 0.35 },
      { opacity: 1, duration: 0.45, ease: "power2.out" },
    );
  }, [active]);

  useEffect(() => {
    setZooming(false);
    if (imageRef.current) {
      imageRef.current.style.transform = "scale(1)";
      imageRef.current.style.transformOrigin = "center center";
    }
  }, [active]);

  useEffect(() => {
    if (current?.type !== "video") return;
    if (!shouldPlayVideo.current) return;

    const video = videoRef.current;
    if (!video) return;

    shouldPlayVideo.current = false;
    video.currentTime = 0;
    const play = () => {
      void video.play().catch(() => {
        video.muted = true;
        void video.play().catch(() => undefined);
      });
    };

    if (video.readyState >= 2) play();
    else video.addEventListener("loadeddata", play, { once: true });

    return () => {
      video.removeEventListener("loadeddata", play);
      video.pause();
    };
  }, [active, current?.type]);

  useEffect(() => {
    if (media.length < 2) return;
    if (paused || zooming) return;
    if (current?.type === "video") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % media.length);
    }, 5000);

    return () => window.clearInterval(id);
  }, [media.length, paused, zooming, current?.type]);

  const playActiveVideo = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => undefined);
    });
  };

  const selectMedia = (index: number) => {
    const next = media[index];
    if (index === active && next?.type === "video") {
      playActiveVideo();
      return;
    }
    shouldPlayVideo.current = next?.type === "video";
    setActive(index);
  };

  const go = (dir: -1 | 1) => {
    const next = (active + dir + media.length) % media.length;
    selectMedia(next);
  };

  const applyNaturalRatio = (width: number, height: number) => {
    if (width > 0 && height > 0) setRatio(width / height);
  };

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (current?.type !== "image") return;
    if (window.matchMedia("(hover: none)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const node = imageRef.current;
    if (!node) return;

    node.style.transformOrigin = `${x}% ${y}%`;
    node.style.transform = "scale(1.85)";
    setZooming(true);
  };

  const onLeave = () => {
    const node = imageRef.current;
    if (!node) return;
    node.style.transform = "scale(1)";
    setZooming(false);
  };

  if (!current) return null;

  return (
    <div className="flex flex-col gap-3 md:grid md:grid-cols-[68px_minmax(0,1fr)] md:gap-3 lg:grid-cols-[72px_minmax(0,1fr)] lg:gap-4">
      <div className="order-2 -mx-5 flex gap-2 overflow-x-auto px-5 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-6 sm:px-6 md:order-1 md:mx-0 md:flex-col md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        {media.map((item, index) => {
          const thumb =
            item.type === "image" ? item.src : item.poster || item.src;
          return (
            <button
              key={`${item.src}-${index}`}
              type="button"
              onClick={() => selectMedia(index)}
              className={cn(
                "relative flex aspect-[4/5] w-14 shrink-0 items-center justify-center overflow-hidden bg-[#e2dacf] transition md:w-full",
                active === index
                  ? "ring-1 ring-[#c9a08a]"
                  : "opacity-65 ring-1 ring-[#1c1a19]/10 hover:opacity-100",
              )}
              aria-label={item.type === "video" ? t("video") : t("image")}
              aria-current={active === index ? "true" : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumb}
                alt=""
                className="h-full w-full object-contain"
              />
              {item.type === "video" ? (
                <span className="absolute inset-0 flex items-center justify-center bg-[#0e0d0c]/40">
                  <span className="ml-0.5 h-0 w-0 border-y-[5px] border-y-transparent border-l-[8px] border-l-[#f4efe8]" />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div
        ref={stageRef}
        className={cn(
          "relative order-1 flex w-full max-w-full items-center justify-center overflow-hidden bg-[#e2dacf] md:order-2",
          current.type === "image" && "cursor-zoom-in",
        )}
        style={{
          aspectRatio: ratio,
          maxHeight: "min(78vh, 820px)",
          width: "100%",
          maxWidth: `min(100%, calc(min(78vh, 820px) * ${ratio}))`,
          marginInline: "auto",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseMove={onMove}
        onMouseLeave={() => {
          onLeave();
          setPaused(false);
        }}
      >
        {current.type === "image" ? (
          <div
            ref={imageRef}
            className="absolute inset-0 transition-transform duration-200 ease-out will-change-transform"
          >
            <Image
              src={current.src}
              alt={current.alt ? localize(current.alt, locale) : t("image")}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 52vw"
              className="object-contain"
              onLoadingComplete={(img) => {
                applyNaturalRatio(img.naturalWidth, img.naturalHeight);
              }}
            />
          </div>
        ) : (
          <video
            key={current.src}
            ref={videoRef}
            className="h-full w-full object-contain"
            controls
            playsInline
            autoPlay
            poster={current.poster}
            preload="auto"
            onLoadedMetadata={(event) => {
              const video = event.currentTarget;
              applyNaturalRatio(video.videoWidth, video.videoHeight);
            }}
          >
            <source src={current.src} type="video/mp4" />
          </video>
        )}

        {discount > 0 && current.type === "image" ? (
          <span className="pointer-events-none absolute left-3 top-3 z-10 bg-[#0e0d0c]/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#f4efe8] backdrop-blur-sm">
            −{discount}%
          </span>
        ) : null}

        {current.type === "video" ? (
          <span className="pointer-events-none absolute left-3 top-3 z-10 bg-[#0e0d0c]/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-[#f4efe8] backdrop-blur-sm">
            {t("video")}
          </span>
        ) : null}

        {media.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/20 bg-[#0e0d0c]/45 text-[#f4efe8] backdrop-blur-sm transition hover:bg-[#0e0d0c]/70"
              aria-label="Previous media"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center border border-white/20 bg-[#0e0d0c]/45 text-[#f4efe8] backdrop-blur-sm transition hover:bg-[#0e0d0c]/70"
              aria-label="Next media"
            >
              →
            </button>
          </>
        ) : null}

        {current.type === "image" ? (
          <span
            className={cn(
              "pointer-events-none absolute bottom-3 right-3 z-10 hidden text-[10px] uppercase tracking-[0.18em] text-[#f4efe8]/80 md:inline",
              zooming ? "opacity-100" : "opacity-0",
            )}
          >
            {t("zoomHint")}
          </span>
        ) : null}
      </div>
    </div>
  );
}
