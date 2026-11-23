"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/format";

gsap.registerPlugin(ScrollTrigger);

/**
 * Children with [data-stagger-item] get staggered enter + optional y-offset parallax.
 */
export function StaggerParallax({
  children,
  className,
  yOffsets = [28, -36, 12, -22, 18],
}: {
  children: ReactNode;
  className?: string;
  yOffsets?: number[];
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = root.querySelectorAll<HTMLElement>("[data-stagger-item]");
    if (!items.length) return;

    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const ctx = gsap.context(() => {
      items.forEach((item, i) => {
        const offset = yOffsets[i % yOffsets.length] * (mobile ? 0.35 : 1);

        gsap.fromTo(
          item,
          { opacity: 0, y: 40 + Math.abs(offset) * 0.25 },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            delay: i * 0.08,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 92%",
              toggleActions: "play none none none",
            },
          },
        );

        if (Math.abs(offset) > 4) {
          gsap.to(item, {
            y: offset,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "bottom top",
              scrub: mobile ? 0.5 : 0.8,
            },
          });
        }
      });
    }, root);

    return () => ctx.revert();
  }, [yOffsets]);

  return (
    <div ref={rootRef} className={cn(className)}>
      {children}
    </div>
  );
}
