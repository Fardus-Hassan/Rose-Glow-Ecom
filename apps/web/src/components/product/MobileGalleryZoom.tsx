"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { localize, type ProductMedia } from "@/data/products";
import { mediaVariant } from "@/lib/media";
import { cn } from "@/lib/format";

type Props = {
  media: ProductMedia[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
};

type Point = { x: number; y: number };

function distance(a: Point, b: Point) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

export function MobileGalleryZoom({
  media,
  index,
  onClose,
  onIndexChange,
}: Props) {
  const t = useTranslations("Product");
  const locale = useLocale();
  const images = media.filter((item) => item.type === "image");
  const imageIndex = Math.max(
    0,
    images.findIndex((item) => item.src === media[index]?.src),
  );
  const current = images[imageIndex] || images[0];
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const scaleRef = useRef(1);
  const txRef = useRef(0);
  const tyRef = useRef(0);
  const dragRef = useRef<{
    mode: "pan" | "pinch" | "swipe";
    start?: Point;
    startTx?: number;
    startTy?: number;
    startScale?: number;
    startDist?: number;
    origin?: Point;
  } | null>(null);
  const lastTapRef = useRef(0);

  useEffect(() => {
    scaleRef.current = scale;
    txRef.current = tx;
    tyRef.current = ty;
  }, [scale, tx, ty]);

  useEffect(() => {
    setScale(1);
    setTx(0);
    setTy(0);
  }, [imageIndex]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, imageIndex]);

  if (!current) return null;

  const src = mediaVariant(current.src, "full", current.variants);
  const clampPan = (nextScale: number, nextTx: number, nextTy: number) => {
    const maxX = ((nextScale - 1) * window.innerWidth) / 2;
    const maxY = ((nextScale - 1) * window.innerHeight) / 2;
    return {
      tx: Math.max(-maxX, Math.min(maxX, nextTx)),
      ty: Math.max(-maxY, Math.min(maxY, nextTy)),
    };
  };

  const go = (dir: -1 | 1) => {
    if (images.length < 2 || scaleRef.current > 1.05) return;
    const next = (imageIndex + dir + images.length) % images.length;
    const mediaIdx = media.findIndex((item) => item.src === images[next].src);
    if (mediaIdx >= 0) onIndexChange(mediaIdx);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const a = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const b = { x: e.touches[1].clientX, y: e.touches[1].clientY };
      dragRef.current = {
        mode: "pinch",
        startDist: distance(a, b),
        startScale: scaleRef.current,
        origin: midpoint(a, b),
        startTx: txRef.current,
        startTy: tyRef.current,
      };
      return;
    }
    if (e.touches.length === 1) {
      dragRef.current = {
        mode: scaleRef.current > 1.05 ? "pan" : "swipe",
        start: { x: e.touches[0].clientX, y: e.touches[0].clientY },
        startTx: txRef.current,
        startTy: tyRef.current,
      };
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.mode === "pinch" && e.touches.length === 2 && drag.startDist) {
      e.preventDefault();
      const a = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      const b = { x: e.touches[1].clientX, y: e.touches[1].clientY };
      const nextScale = Math.min(
        4,
        Math.max(1, (drag.startScale || 1) * (distance(a, b) / drag.startDist)),
      );
      const pan = clampPan(
        nextScale,
        drag.startTx || 0,
        drag.startTy || 0,
      );
      setScale(nextScale);
      setTx(pan.tx);
      setTy(pan.ty);
      return;
    }

    if (e.touches.length !== 1 || !drag.start) return;
    const dx = e.touches[0].clientX - drag.start.x;
    const dy = e.touches[0].clientY - drag.start.y;

    if (drag.mode === "pan") {
      e.preventDefault();
      const pan = clampPan(
        scaleRef.current,
        (drag.startTx || 0) + dx,
        (drag.startTy || 0) + dy,
      );
      setTx(pan.tx);
      setTy(pan.ty);
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const drag = dragRef.current;
    if (!drag) return;

    if (drag.mode === "swipe" && drag.start && e.changedTouches[0]) {
      const dx = e.changedTouches[0].clientX - drag.start.x;
      const dy = e.changedTouches[0].clientY - drag.start.y;
      if (Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        go(dx < 0 ? 1 : -1);
      } else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) {
        onClose();
      }
    }

    if (scaleRef.current <= 1.05) {
      setScale(1);
      setTx(0);
      setTy(0);
    }
    dragRef.current = null;
  };

  const onDoubleTap = (e: React.MouseEvent | React.TouchEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      if (scaleRef.current > 1.05) {
        setScale(1);
        setTx(0);
        setTy(0);
      } else {
        setScale(2.4);
        setTx(0);
        setTy(0);
      }
      lastTapRef.current = 0;
      e.preventDefault();
      return;
    }
    lastTapRef.current = now;
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex flex-col bg-[#0e0d0c]/96 rg-fade-in md:hidden"
      role="dialog"
      aria-modal="true"
      aria-label={t("zoomTitle")}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <p className="text-[11px] uppercase tracking-[0.18em] text-[#f4efe8]/70">
          {imageIndex + 1} / {images.length}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-10 min-w-10 items-center justify-center text-[11px] uppercase tracking-[0.18em] text-[#f4efe8]"
          aria-label={t("closePhoto")}
        >
          {t("closePhoto")} ✕
        </button>
      </div>

      <div
        className="relative min-h-0 flex-1 touch-none overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onClick={onDoubleTap}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={
            current.alt ? localize(current.alt, locale) : t("image")
          }
          draggable={false}
          className="pointer-events-none absolute inset-0 m-auto max-h-full max-w-full object-contain transition-transform duration-150 ease-out select-none"
          style={{
            transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
          }}
        />
      </div>

      <div className="flex shrink-0 items-center justify-between gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={images.length < 2 || scale > 1.05}
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center border border-white/20 text-[#f4efe8]",
            (images.length < 2 || scale > 1.05) && "opacity-30",
          )}
          aria-label={t("prevMedia")}
        >
          ←
        </button>
        <p className="text-center text-[10px] uppercase tracking-[0.16em] text-[#f4efe8]/55">
          {t("zoomMobileHint")}
        </p>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={images.length < 2 || scale > 1.05}
          className={cn(
            "inline-flex h-11 w-11 items-center justify-center border border-white/20 text-[#f4efe8]",
            (images.length < 2 || scale > 1.05) && "opacity-30",
          )}
          aria-label={t("nextMedia")}
        >
          →
        </button>
      </div>
    </div>
  );
}
