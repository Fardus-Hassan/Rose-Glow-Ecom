"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";

gsap.registerPlugin(ScrollTrigger);

/**
 * Giant gold ambient type + centered manifesto — restless scroll drift.
 */
export function StoryBand() {
  const t = useTranslations("Home");
  const nav = useTranslations("Nav");
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-story-glow]",
        { opacity: 0.2, scale: 0.85 },
        {
          opacity: 0.55,
          scale: 1.15,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top 80%",
            end: "bottom 20%",
            scrub: true,
          },
        },
      );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative overflow-hidden bg-[color:var(--rg-paper)] py-28 md:py-40"
    >
      <div
        data-story-glow
        className="pointer-events-none absolute left-1/2 top-1/2 h-[55vw] w-[55vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.18),transparent_70%)]"
        aria-hidden
      />

      <Parallax
        speed={90}
        className="pointer-events-none absolute inset-x-0 top-[6%] text-center"
      >
        <p className="select-none font-display text-[clamp(4rem,18vw,14rem)] leading-[0.85] tracking-[-0.04em] text-[color:var(--rg-accent)] opacity-[0.12]">
          {t("featuredTitle")}
        </p>
      </Parallax>
      <Parallax
        speed={-50}
        className="pointer-events-none absolute inset-x-0 bottom-[4%] text-center"
      >
        <p className="select-none font-display text-[clamp(3rem,14vw,10rem)] leading-[0.85] tracking-[-0.04em] text-[color:var(--rg-pearl)] opacity-[0.06]">
          {nav("atelierNote")}
        </p>
      </Parallax>

      <div className="container-rg relative z-10 flex flex-col items-center text-center">
        <Reveal>
          <div className="rg-home-gold-rule mx-auto mb-8 w-16" />
          <p className="mx-auto max-w-2xl font-display text-[clamp(1.35rem,3vw,2rem)] leading-relaxed text-white">
            {t("atelierSub")}
          </p>
        </Reveal>

        <Reveal delay={0.12}>
          <Link href="/about" className="rg-cta mt-12 min-h-12 px-10">
            {nav("about")}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
