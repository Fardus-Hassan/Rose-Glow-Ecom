"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";

/**
 * Restless gold marquee — trust as motion, not a static strip.
 */
export function PromiseBar() {
  const t = useTranslations("Home");
  const trackRef = useRef<HTMLDivElement>(null);

  const items = [
    t("promiseCodTitle"),
    t("promiseFinishTitle"),
    t("promiseDeliveryTitle"),
    t("heroCorner"),
  ];

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.to(track, {
        xPercent: -50,
        duration: 28,
        ease: "none",
        repeat: -1,
      });
    }, track);

    return () => ctx.revert();
  }, []);

  const row = (
    <>
      {items.map((label) => (
        <span
          key={label}
          className="inline-flex items-center gap-8 text-[11px] font-semibold uppercase tracking-[0.28em] text-[color:var(--rg-accent)]"
        >
          <span className="h-1 w-1 rounded-full bg-[color:var(--rg-accent)]" />
          {label}
        </span>
      ))}
    </>
  );

  return (
    <section className="relative overflow-hidden border-y border-[color:var(--rg-line)] bg-[color:var(--rg-paper-deep)] py-4 md:py-5">
      <div ref={trackRef} className="rg-home-marquee">
        <div className="flex shrink-0 items-center gap-12 px-6">{row}</div>
        <div className="flex shrink-0 items-center gap-12 px-6" aria-hidden>
          {row}
        </div>
      </div>
    </section>
  );
}
