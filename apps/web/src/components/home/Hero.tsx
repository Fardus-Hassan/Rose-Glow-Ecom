"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { Link } from "@/i18n/navigation";
import type { HeroContent } from "@/lib/catalog";
import { SmartImage } from "@/components/media/SmartImage";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/format";

function clampDepth(depth: number) {
  return Math.min(100, Math.max(0, depth)) / 100;
}

function rgba(alpha: number) {
  return `rgba(14, 13, 12, ${Math.min(1, Math.max(0, alpha)).toFixed(3)})`;
}

/** Depth 0 = lightest wash, 100 = deepest noir. ~50 matches the original look. */
function HeroOverlayScrim({
  depth,
  className,
}: {
  depth: number;
  className?: string;
}) {
  const t = clampDepth(depth);
  const flat = 0.06 + t * 0.52;
  const viaSide = 0.22 + t * 0.62;
  const edge = 0.04 + t * 0.28;
  const viaBottom = 0.16 + t * 0.52;
  const top = 0.1 + t * 0.38;
  const side = 0.16 + t * 0.52;
  const glow = 0.03 + t * 0.14;

  return (
    <div
      className={cn("pointer-events-none absolute inset-0 -z-10", className)}
      aria-hidden
    >
      <div className="absolute inset-0" style={{ background: rgba(flat) }} />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to right, ${rgba(viaSide)} 0%, ${rgba(viaSide * 0.72)} 48%, ${rgba(edge)} 100%)`,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top, ${rgba(viaBottom)} 0%, ${rgba(viaBottom * 0.45)} 42%, ${rgba(top)} 100%)`,
        }}
      />
      <div
        className="absolute inset-y-0 left-0 w-full max-w-4xl"
        style={{
          background: `linear-gradient(to right, ${rgba(side)} 0%, transparent 100%)`,
        }}
      />
      <div
        className="absolute -left-24 top-1/4 h-72 w-72 rounded-full blur-[100px]"
        style={{ background: `rgba(201, 160, 138, ${glow.toFixed(3)})` }}
      />
    </div>
  );
}

/**
 * Direction: Editorial Noir
 * Full-bleed hero — media + copy can come from CMS (admin content block).
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
  const [imageReady, setImageReady] = useState(false);

  const useVideo = content.mode === "video";
  const headline =
    locale === "bn" ? content.headlineBn : content.headlineEn;
  const body = locale === "bn" ? content.bodyBn : content.bodyEn;
  const cta = locale === "bn" ? content.ctaBn : content.ctaEn;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    setVideoReady(false);
    setImageReady(false);
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
      // Keep poster visible; mark ready so layout settles.
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
        // Autoplay blocked — keep the poster underlay, don't flash.
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

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-hero-brand]", {
        y: 40,
        opacity: 0,
        duration: 1.15,
      })
        .from(
          "[data-hero-rule]",
          { scaleX: 0, duration: 0.8, transformOrigin: "left center" },
          "-=0.55",
        )
        .from(
          "[data-hero-copy]",
          { y: 24, opacity: 0, duration: 0.9, stagger: 0.12 },
          "-=0.45",
        );
    }, root);

    return () => ctx.revert();
  }, []);

  const posterDesktop = content.video?.desktop.poster || content.image.desktop;
  const posterMobile = content.video?.mobile.poster || content.image.mobile;

  return (
    <section
      ref={rootRef}
      className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-[#0e0d0c] text-[#f4efe8] md:items-center"
    >
      <div className="absolute inset-0 -z-20 overflow-hidden bg-[#0e0d0c]">
        {useVideo && content.video ? (
          <>
            {/* Stable poster underlay — stays until video first frame is ready */}
            <SmartImage
              src={posterDesktop}
              alt=""
              fill
              priority
              variant="detail"
              sizesPreset="hero"
              className={cn(
                "hidden bg-[#0e0d0c] object-cover object-[center_30%] transition-opacity duration-500 md:block",
                videoReady ? "opacity-0" : "opacity-100",
              )}
            />
            <SmartImage
              src={posterMobile}
              alt=""
              fill
              priority
              variant="card"
              sizesPreset="hero"
              className={cn(
                "bg-[#0e0d0c] object-cover object-[center_25%] transition-opacity duration-500 md:hidden",
                videoReady ? "opacity-0" : "opacity-100",
              )}
            />
            <video
              ref={desktopVideoRef}
              className={cn(
                "absolute inset-0 hidden h-full w-full bg-[#0e0d0c] object-cover object-center transition-opacity duration-700 md:block",
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
                "absolute inset-0 h-full w-full bg-[#0e0d0c] object-cover object-[center_20%] transition-opacity duration-700 md:hidden",
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
              onLoad={() => setImageReady(true)}
              className={cn(
                "hidden bg-[#0e0d0c] object-cover object-[center_30%] transition-opacity duration-700 md:block",
                imageReady ? "opacity-100" : "opacity-0",
              )}
            />
            <SmartImage
              src={content.image.mobile}
              alt=""
              fill
              priority
              variant="card"
              sizesPreset="hero"
              onLoad={() => setImageReady(true)}
              className={cn(
                "bg-[#0e0d0c] object-cover object-[center_35%] transition-opacity duration-700 md:hidden",
                imageReady ? "opacity-100" : "opacity-0",
              )}
            />
          </>
        )}
      </div>

      {content.overlayMobile ? (
        <HeroOverlayScrim
          depth={content.overlayDepthMobile}
          className="md:hidden"
        />
      ) : null}
      {content.overlayDesktop ? (
        <HeroOverlayScrim
          depth={content.overlayDepthDesktop}
          className="hidden md:block"
        />
      ) : null}

      <div className="container-rg relative pb-16 pt-28 md:pb-24">
        <div className="relative max-w-3xl">
          <p
            data-hero-brand
            className="font-display text-[clamp(3.2rem,10vw,7.5rem)] leading-[0.92] tracking-[-0.03em] text-[#f4efe8] [text-shadow:0_2px_28px_rgba(14,13,12,0.55)]"
          >
            {content.brand || "Rose Glow"}
          </p>

          <div
            data-hero-rule
            className="mt-6 h-px w-16 bg-gradient-to-r from-[#c9a08a] to-transparent md:mt-8 md:w-24"
          />

          <h1
            data-hero-copy
            className="mt-6 max-w-lg font-display text-[clamp(1.6rem,3.5vw,2.35rem)] font-normal leading-snug text-[#f4efe8] [text-shadow:0_1px_18px_rgba(14,13,12,0.5)] md:mt-8"
          >
            {headline}
          </h1>

          <p
            data-hero-copy
            className="mt-4 max-w-md text-[15px] leading-7 text-[#f4efe8]/82 [text-shadow:0_1px_12px_rgba(14,13,12,0.45)] md:text-base"
          >
            {body}
          </p>

          <div data-hero-copy className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 border border-[#c9a08a]/70 bg-[#0e0d0c]/45 px-7 py-3.5 text-[12px] uppercase tracking-[0.22em] text-[#f4efe8] backdrop-blur-sm transition hover:border-[#c9a08a] hover:bg-[#0e0d0c]/65"
            >
              {cta}
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/products"
              className="text-[12px] uppercase tracking-[0.2em] text-[#f4efe8]/75 underline-offset-8 transition hover:text-[#f4efe8] hover:underline [text-shadow:0_1px_10px_rgba(14,13,12,0.4)]"
            >
              {t("heroSecondary")}
            </Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-5 hidden text-[10px] uppercase tracking-[0.28em] text-[#f4efe8]/45 md:block md:right-8 lg:right-10 xl:right-12">
        {t("heroCorner")}
      </div>
    </section>
  );
}
