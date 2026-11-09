"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/format";

gsap.registerPlugin(ScrollTrigger);

export function StaggerGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const items = el.querySelectorAll<HTMLElement>("[data-stagger-item]");

    if (reduceMotion || items.length === 0) return;

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y: 56 });
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 0.95,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 82%",
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={cn(className)}>
      {children}
    </div>
  );
}
