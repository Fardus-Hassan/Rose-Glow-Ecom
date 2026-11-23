"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/format";

gsap.registerPlugin(ScrollTrigger);

type ParallaxProps = {
  children: ReactNode;
  className?: string;
  /** Vertical travel in px (positive = moves slower / up-feel). */
  speed?: number;
  /** Scale drift while scrolling (1 = none). */
  scale?: number;
};

/**
 * Soft scroll parallax — works with Lenis via ScrollTrigger.update.
 * Respects prefers-reduced-motion; lighter travel on small screens.
 */
export function Parallax({
  children,
  className,
  speed = 48,
  scale = 1,
}: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const y = mobile ? speed * 0.45 : speed;
    const endScale = scale === 1 ? 1 : mobile ? 1 + (scale - 1) * 0.5 : scale;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: -y * 0.35, scale: scale === 1 ? 1 : Math.min(scale, 1.04) },
        {
          y: y * 0.65,
          scale: endScale,
          ease: "none",
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: "top bottom",
            end: "bottom top",
            scrub: mobile ? 0.55 : 0.85,
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [speed, scale]);

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
