"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/format";

type SliderProps = {
  children: React.ReactNode;
  className?: string;
  /** Tailwind basis classes for each slide, e.g. "basis-[85%] md:basis-[32%]" */
  slideClassName?: string;
  dark?: boolean;
  labelPrev?: string;
  labelNext?: string;
  /** Auto-advance interval in ms. Set 0 to disable. Default 3000 (loops). */
  autoPlayMs?: number;
};

export function Slider({
  children,
  className,
  slideClassName = "basis-[85%] sm:basis-[55%] md:basis-[40%] lg:basis-[31%]",
  dark = false,
  labelPrev = "Previous",
  labelNext = "Next",
  autoPlayMs = 3000,
}: SliderProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < max - 8);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update, children]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.25, rootMargin: "0px" },
    );
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const scrollByDir = useCallback((dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 8) return;

    const slides = Array.from(el.children) as HTMLElement[];
    if (!slides.length) return;

    const gapRaw = getComputedStyle(el).columnGap || getComputedStyle(el).gap || "0";
    const gap = Number.parseFloat(gapRaw) || 0;
    const step = (slides[0]?.offsetWidth || 0) + gap;
    if (step <= 0) return;

    // Snap to nearest slide index, then move exactly one slide
    const currentIndex = Math.round(el.scrollLeft / step);
    const lastIndex = Math.max(0, slides.length - 1);

    if (dir === 1 && el.scrollLeft >= max - 8) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    if (dir === -1 && el.scrollLeft <= 8) {
      el.scrollTo({ left: max, behavior: "smooth" });
      return;
    }

    const nextIndex = Math.min(lastIndex, Math.max(0, currentIndex + dir));
    el.scrollTo({
      left: Math.min(max, nextIndex * step),
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const onVisibility = () => setTabVisible(!document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (!autoPlayMs || autoPlayMs <= 0) return;
    if (paused || !inView || !tabVisible) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const id = window.setInterval(() => {
      scrollByDir(1);
    }, autoPlayMs);

    return () => window.clearInterval(id);
  }, [autoPlayMs, paused, inView, tabVisible, scrollByDir, children]);

  const items = Array.isArray(children) ? children : [children];

  return (
    <div
      ref={rootRef}
      className={cn("relative", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div className="mb-5 flex justify-end gap-2">
        <button
          type="button"
          aria-label={labelPrev}
          disabled={!canPrev && !autoPlayMs}
          onClick={() => scrollByDir(-1)}
          className={cn(
            "flex h-10 w-10 items-center justify-center border transition",
            dark
              ? "border-white/25 text-[#f4efe8] hover:border-[#c9a08a] disabled:opacity-30"
              : "border-[#1c1a19]/20 text-[#1c1a19] hover:border-[#c9a08a] disabled:opacity-30",
          )}
        >
          ←
        </button>
        <button
          type="button"
          aria-label={labelNext}
          disabled={!canNext && !autoPlayMs}
          onClick={() => scrollByDir(1)}
          className={cn(
            "flex h-10 w-10 items-center justify-center border transition",
            dark
              ? "border-white/25 text-[#f4efe8] hover:border-[#c9a08a] disabled:opacity-30"
              : "border-[#1c1a19]/20 text-[#1c1a19] hover:border-[#c9a08a] disabled:opacity-30",
          )}
        >
          →
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-6 [&::-webkit-scrollbar]:hidden"
      >
        {items.map((child, index) => (
          <div
            key={index}
            className={cn("shrink-0 snap-start", slideClassName)}
          >
            {child}
          </div>
        ))}
      </div>
    </div>
  );
}
