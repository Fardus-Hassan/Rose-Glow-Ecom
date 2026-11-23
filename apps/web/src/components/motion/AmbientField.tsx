"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/format";

/**
 * Soft floating orbs + grain — velvet presence without neon soup.
 * Respects prefers-reduced-motion.
 */
export function AmbientField({
  className,
  tone = "noir",
}: {
  className?: string;
  tone?: "blush" | "noir";
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const orbs = root.querySelectorAll<HTMLElement>("[data-orb]");
    const ctx = gsap.context(() => {
      orbs.forEach((orb, i) => {
        gsap.to(orb, {
          x: i % 2 === 0 ? 36 : -28,
          y: i % 2 === 0 ? -28 : 40,
          scale: 1.08 + i * 0.03,
          duration: 7 + i * 1.4,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: i * 0.35,
        });
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const blush = tone === "blush";

  return (
    <div
      ref={rootRef}
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div
        data-orb
        className={cn(
          "absolute -left-16 top-10 h-40 w-40 rounded-full blur-3xl opacity-70 md:h-72 md:w-72 md:opacity-100",
          blush ? "bg-[#d4789a]/14" : "bg-[#d4a574]/12",
        )}
      />
      <div
        data-orb
        className={cn(
          "absolute -right-10 top-1/3 h-36 w-36 rounded-full blur-3xl opacity-60 md:h-64 md:w-64 md:opacity-100",
          blush ? "bg-[#d4a574]/12" : "bg-[#d4789a]/10",
        )}
      />
      <div
        data-orb
        className={cn(
          "absolute bottom-0 left-1/3 hidden h-52 w-52 rounded-full blur-3xl md:block md:h-60 md:w-60",
          blush ? "bg-[#d4789a]/10" : "bg-[#d4a574]/08",
        )}
      />
      <div className="rg-grain absolute inset-0 opacity-[0.18] md:opacity-[0.28]" />
    </div>
  );
}
