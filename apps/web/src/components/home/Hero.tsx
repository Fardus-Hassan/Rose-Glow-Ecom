"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import gsap from "gsap";
import { Link } from "@/i18n/navigation";

const HERO_DESKTOP = {
  src: "https://videos.pexels.com/video-files/11353206/11353206-hd_1920_1080_25fps.mp4",
  poster:
    "https://images.pexels.com/videos/11353206/pexels-photo-11353206.jpeg?auto=compress&cs=tinysrgb&w=2400",
} as const;

const HERO_MOBILE = {
  src: "https://videos.pexels.com/video-files/7626566/7626566-hd_1080_1920_25fps.mp4",
  poster:
    "https://images.pexels.com/videos/7626566/pexels-photo-7626566.jpeg?auto=compress&cs=tinysrgb&w=1200",
} as const;

/**
 * Direction: Editorial Noir
 * Full-bleed cinematic hero with separate looping videos for mobile + desktop.
 */
export function Hero() {
  const t = useTranslations("Home");
  const rootRef = useRef<HTMLElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const mobileVideoRef = useRef<HTMLVideoElement>(null);
  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (isDesktop === null) return;

    const active = isDesktop ? desktopVideoRef.current : mobileVideoRef.current;
    const idle = isDesktop ? mobileVideoRef.current : desktopVideoRef.current;
    const asset = isDesktop ? HERO_DESKTOP : HERO_MOBILE;
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
      active.load();
    }

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
  }, [isDesktop]);

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

  const poster =
    isDesktop === false ? HERO_MOBILE.poster : HERO_DESKTOP.poster;

  return (
    <section
      ref={rootRef}
      className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-[#0e0d0c] text-[#f4efe8] md:items-center"
    >
      <div className="absolute inset-0 -z-20 overflow-hidden">
        <video
          ref={desktopVideoRef}
          className="absolute inset-0 hidden h-full w-full object-cover object-center md:block"
          muted
          loop
          playsInline
          preload="none"
          poster={HERO_DESKTOP.poster}
          aria-hidden
        />

        <video
          ref={mobileVideoRef}
          className="absolute inset-0 h-full w-full object-cover object-[center_20%] md:hidden"
          muted
          loop
          playsInline
          preload="none"
          poster={HERO_MOBILE.poster}
          aria-hidden
        />

        <Image
          src={poster}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_30%] opacity-0 motion-reduce:opacity-100"
        />
      </div>

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0e0d0c]/78 via-[#0e0d0c]/35 to-[#0e0d0c]/15" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0e0d0c]/90 via-transparent to-[#0e0d0c]/30" />
      <div className="absolute -left-24 top-1/4 -z-10 h-72 w-72 rounded-full bg-[#c9a08a]/12 blur-[100px]" />

      <div className="container-rg relative pb-16 pt-28 md:pb-24">
        <div className="max-w-3xl">
          <p
            data-hero-brand
            className="font-display text-[clamp(3.2rem,10vw,7.5rem)] leading-[0.92] tracking-[-0.03em] text-[#f4efe8]"
          >
            Rose Glow
          </p>

          <div
            data-hero-rule
            className="mt-6 h-px w-16 bg-gradient-to-r from-[#c9a08a] to-transparent md:mt-8 md:w-24"
          />

          <h1
            data-hero-copy
            className="mt-6 max-w-lg font-display text-[clamp(1.6rem,3.5vw,2.35rem)] font-normal leading-snug text-[#f4efe8]/92 md:mt-8"
          >
            {t("heroHeadline")}
          </h1>

          <p
            data-hero-copy
            className="mt-4 max-w-md text-[15px] leading-7 text-[#f4efe8]/62 md:text-base"
          >
            {t("heroSub")}
          </p>

          <div data-hero-copy className="mt-10 flex flex-wrap items-center gap-6">
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 border border-[#c9a08a]/55 bg-[#c9a08a]/10 px-7 py-3.5 text-[12px] uppercase tracking-[0.22em] text-[#f4efe8] backdrop-blur-sm transition hover:border-[#c9a08a] hover:bg-[#c9a08a]/20"
            >
              {t("heroCta")}
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/products"
              className="text-[12px] uppercase tracking-[0.2em] text-[#f4efe8]/55 underline-offset-8 transition hover:text-[#f4efe8] hover:underline"
            >
              {t("heroSecondary")}
            </Link>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-6 right-5 hidden text-[10px] uppercase tracking-[0.28em] text-[#f4efe8]/35 md:block md:right-8 lg:right-10 xl:right-12">
        Est. atelier · Dhaka
      </div>
    </section>
  );
}
