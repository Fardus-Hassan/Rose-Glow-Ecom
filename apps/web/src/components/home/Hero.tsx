"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { Link } from "@/i18n/navigation";
import type { HeroContent } from "@/lib/catalog";
import { SmartImage } from "@/components/media/SmartImage";
import { mediaUrl } from "@/lib/media";

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
    if (!useVideo || isDesktop === null || !content.video) return;

    const active = isDesktop ? desktopVideoRef.current : mobileVideoRef.current;
    const idle = isDesktop ? mobileVideoRef.current : desktopVideoRef.current;
    const asset = isDesktop ? content.video.desktop : content.video.mobile;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (idle) {
      idle.pause();
      idle.removeAttribute("src");
      idle.load();
    }

    if (!active) return;

    if (active.getAttribute("src") !== asset.src) {
      active.setAttribute("src", asset.src);
    }
    active.load();

    if (reduceMotion) {
      active.pause();
      return;
    }

    let cancelled = false;

    const play = async () => {
      try {
        if (!cancelled) await active.play();
      } catch {
        // Autoplay may be blocked; poster remains visible.
      }
    };

    if (active.readyState >= 2) {
      void play();
    } else {
      active.addEventListener("loadeddata", () => void play(), { once: true });
    }

    return () => {
      cancelled = true;
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
        )
        .from(
          "[data-hero-media]",
          { scale: 1.06, opacity: 0.65, duration: 1.4, ease: "power2.out" },
          0,
        );
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-[#0e0d0c] text-[#f4efe8] md:items-center"
    >
      <div className="absolute inset-0 -z-20 overflow-hidden">
        {useVideo && content.video ? (
          <>
            <video
              ref={desktopVideoRef}
              className="absolute inset-0 hidden h-full w-full object-cover object-center md:block"
              muted
              loop
              playsInline
              preload="none"
              poster={mediaUrl(content.video.desktop.poster)}
              aria-hidden
            />
            <video
              ref={mobileVideoRef}
              className="absolute inset-0 h-full w-full object-cover object-[center_20%] md:hidden"
              muted
              loop
              playsInline
              preload="none"
              poster={mediaUrl(content.video.mobile.poster)}
              aria-hidden
            />
            <SmartImage
              data-hero-media
              src={content.video.desktop.poster}
              alt=""
              fill
              priority
              variant="detail"
              sizesPreset="hero"
              className="hidden object-cover object-[center_30%] opacity-0 motion-reduce:opacity-100 md:block"
            />
            <SmartImage
              data-hero-media
              src={content.video.mobile.poster}
              alt=""
              fill
              priority
              variant="card"
              sizesPreset="hero"
              className="object-cover object-[center_25%] opacity-0 motion-reduce:opacity-100 md:hidden"
            />
          </>
        ) : (
          <>
            <SmartImage
              data-hero-media
              src={content.image.desktop}
              alt=""
              fill
              priority
              variant="detail"
              sizesPreset="hero"
              className="hidden object-cover object-[center_30%] md:block"
            />
            <SmartImage
              data-hero-media
              src={content.image.mobile}
              alt=""
              fill
              priority
              variant="card"
              sizesPreset="hero"
              className="object-cover object-[center_35%] md:hidden"
            />
          </>
        )}
      </div>

      {content.overlayMobile ? (
        <div className="pointer-events-none absolute inset-0 -z-10 md:hidden">
          <div className="absolute inset-0 bg-[#0e0d0c]/35" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e0d0c] via-[#0e0d0c]/78 to-[#0e0d0c]/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0d0c] via-[#0e0d0c]/55 to-[#0e0d0c]/40" />
          <div className="absolute inset-y-0 left-0 w-full max-w-3xl bg-gradient-to-r from-[#0e0d0c]/55 to-transparent" />
          <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-[#c9a08a]/10 blur-[100px]" />
        </div>
      ) : null}
      {content.overlayDesktop ? (
        <div className="pointer-events-none absolute inset-0 -z-10 hidden md:block">
          <div className="absolute inset-0 bg-[#0e0d0c]/25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0e0d0c] via-[#0e0d0c]/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0d0c] via-[#0e0d0c]/25 to-[#0e0d0c]/30" />
          <div className="absolute inset-y-0 left-0 w-full max-w-4xl bg-gradient-to-r from-[#0e0d0c]/55 to-transparent" />
          <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-[#c9a08a]/10 blur-[100px]" />
        </div>
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
        Est. atelier · Dhaka
      </div>
    </section>
  );
}
