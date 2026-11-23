"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Link } from "@/i18n/navigation";
import type { HeroContent } from "@/lib/catalog";
import { SmartImage } from "@/components/media/SmartImage";
import { Parallax } from "@/components/motion/Parallax";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/format";

gsap.registerPlugin(ScrollTrigger);

/**
 * God-dark + gold cinematic hero — full-bleed media, brand-first, restless motion.
 */
export function Hero({
  locale,
  content,
}: {
  locale: string;
  content: HeroContent;
}) {
  const t = useTranslations("Home");
  const rootRef = useRef<HTMLElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [videoReady, setVideoReady] = useState(false);

  const useVideo = content.mode === "video";
  const headline =
    locale === "bn" ? content.headlineBn : content.headlineEn;
  const body = locale === "bn" ? content.bodyBn : content.bodyEn;
  const cta = locale === "bn" ? content.ctaBn : content.ctaEn;
  const brand = content.brand || "Rose Glow";

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    setVideoReady(false);
  }, [useVideo, content.mode, content.video, content.image]);

  useEffect(() => {
    if (!useVideo || isDesktop === null || !content.video) return;

    const active = isDesktop ? desktopVideoRef.current : mobileVideoRef.current;
    const idle = isDesktop ? mobileVideoRef.current : desktopVideoRef.current;
    const asset = isDesktop ? content.video.desktop : content.video.mobile;
    const src = mediaUrl(asset.src);
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (idle) {
      idle.pause();
      idle.removeAttribute("src");
      idle.load();
    }

    if (!active) return;

    setVideoReady(false);

    if (active.getAttribute("src") !== src) {
      active.setAttribute("src", src);
    }
    active.load();

    if (reduceMotion) {
      active.pause();
      setVideoReady(true);
      return;
    }

    let cancelled = false;

    const reveal = () => {
      if (!cancelled) setVideoReady(true);
    };

    const play = async () => {
      try {
        if (cancelled) return;
        await active.play();
        reveal();
      } catch {
        reveal();
      }
    };

    const onCanPlay = () => void play();

    if (active.readyState >= 3) {
      void play();
    } else {
      active.addEventListener("canplay", onCanPlay, { once: true });
    }

    return () => {
      cancelled = true;
      active.removeEventListener("canplay", onCanPlay);
    };
  }, [useVideo, isDesktop, content.video]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-hero-brand]", {
        y: 40,
        opacity: 0,
        duration: 1.1,
      })
        .from(
          "[data-hero-rule]",
          { scaleX: 0, opacity: 0, duration: 0.8, transformOrigin: "left center" },
          "-=0.55",
        )
        .from(
          "[data-hero-title]",
          { y: 48, opacity: 0, duration: 1.05 },
          "-=0.45",
        )
        .from(
          "[data-hero-sub]",
          { y: 24, opacity: 0, duration: 0.85 },
          "-=0.55",
        )
        .from(
          "[data-hero-cta]",
          { y: 18, opacity: 0, duration: 0.7 },
          "-=0.4",
        );

      gsap.to("[data-hero-ambient]", {
        xPercent: 8,
        yPercent: -6,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }, root);

    return () => ctx.revert();
  }, []);

  const previewDesktop = content.image.desktop;
  const previewMobile = content.image.mobile;

  const mediaInner = (
    <>
      {useVideo && content.video ? (
        <>
          <SmartImage
            src={previewDesktop}
            alt=""
            fill
            priority
            variant="detail"
            sizesPreset="hero"
            className={cn(
              "hidden bg-[color:var(--rg-paper-deep)] object-cover object-center transition-opacity duration-500 md:block",
              videoReady ? "opacity-0" : "opacity-100",
            )}
          />
          <SmartImage
            src={previewMobile}
            alt=""
            fill
            priority
            variant="card"
            sizesPreset="hero"
            className={cn(
              "bg-[color:var(--rg-paper-deep)] object-cover object-center transition-opacity duration-500 md:hidden",
              videoReady ? "opacity-0" : "opacity-100",
            )}
          />
          <video
            ref={desktopVideoRef}
            className={cn(
              "absolute inset-0 hidden h-full w-full object-cover object-center transition-opacity duration-700 md:block",
              videoReady ? "opacity-100" : "opacity-0",
            )}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          />
          <video
            ref={mobileVideoRef}
            className={cn(
              "absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-700 md:hidden",
              videoReady ? "opacity-100" : "opacity-0",
            )}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          />
        </>
      ) : (
        <>
          <SmartImage
            src={content.image.desktop}
            alt=""
            fill
            priority
            variant="detail"
            sizesPreset="hero"
            className="hidden bg-[color:var(--rg-paper-deep)] object-cover object-center md:block"
          />
          <SmartImage
            src={content.image.mobile}
            alt=""
            fill
            priority
            variant="card"
            sizesPreset="hero"
            className="bg-[color:var(--rg-paper-deep)] object-cover object-center md:hidden"
          />
        </>
      )}
    </>
  );

  return (
    <section
      ref={rootRef}
      className="relative isolate min-h-[100svh] overflow-hidden bg-[color:var(--rg-paper)] text-[color:var(--rg-ink)]"
    >
      {/* Full-bleed media plane */}
      <div
        data-hero-media
        className="absolute inset-0"
        aria-hidden
      >
        <Parallax speed={70} scale={1.12} className="absolute inset-[-8%]">
          <div className="absolute inset-0">{mediaInner}</div>
        </Parallax>
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--rg-paper)] via-[color:var(--rg-paper)]/55 to-[color:var(--rg-paper)]/25" />
        <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--rg-paper)]/90 via-[color:var(--rg-paper)]/35 to-transparent" />
      </div>

      {/* Ambient gold wash */}
      <div
        data-hero-ambient
        className="pointer-events-none absolute -left-1/4 top-[-10%] h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle,rgba(212,175,55,0.16),transparent_68%)] blur-2xl"
        aria-hidden
      />

      <div className="container-rg relative flex min-h-[100svh] flex-col justify-end pb-16 pt-28 md:justify-center md:pb-24 md:pt-32">
        <div className="max-w-2xl md:max-w-3xl">
          <p
            data-hero-brand
            className="font-brand text-[clamp(2.8rem,9vw,6.5rem)] leading-[0.92] text-[color:var(--rg-pearl)]"
          >
            {brand}
          </p>

          <div
            data-hero-rule
            className="rg-home-gold-rule mt-6 w-24 origin-left md:mt-8 md:w-36"
          />

          <h1
            data-hero-title
            className="mt-6 max-w-xl font-display text-[clamp(1.65rem,4.2vw,3rem)] leading-[1.15] tracking-[-0.02em] text-[color:var(--rg-pearl)]/92 md:mt-8"
          >
            {headline}
          </h1>

          <p
            data-hero-sub
            className="mt-4 max-w-md text-[15px] leading-7 text-white md:mt-5 md:text-base md:leading-8"
          >
            {body}
          </p>

          <div data-hero-cta className="mt-8 flex flex-wrap items-center gap-3 md:mt-10">
            <Link href="/products" className="rg-cta-solid min-h-12 px-8">
              {cta}
            </Link>
            <Link href="/products" className="rg-cta min-h-12 px-7">
              {t("heroSecondary")}
            </Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-7 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="h-12 w-px bg-gradient-to-b from-[color:var(--rg-accent)] to-transparent" />
        <span className="text-[9px] uppercase tracking-[0.32em] text-[color:var(--rg-accent)]/70">
          {t("heroCorner")}
        </span>
      </div>
    </section>
  );
}
