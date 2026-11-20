"use client";

import { useEffect, useRef, useState, type VideoHTMLAttributes } from "react";
import { mediaUrl } from "@/lib/media";
import { cn } from "@/lib/format";

type SmartVideoProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  "src" | "poster"
> & {
  src: string;
  poster?: string | null;
  /** Only attach/load src when near viewport (default true) */
  lazy?: boolean;
  /** Try to autoplay with sound; mute only if the browser blocks it */
  preferUnmuted?: boolean;
};

/**
 * Lazy, poster-first video for PDP / hero-adjacent slots.
 * Uses preload="metadata" and only mounts the network src when visible.
 */
export function SmartVideo({
  src,
  poster,
  lazy = true,
  className,
  autoPlay,
  controls,
  muted,
  loop,
  preferUnmuted = false,
  playsInline = true,
  ...rest
}: SmartVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(!lazy);
  const resolvedSrc = mediaUrl(src);
  const resolvedPoster = poster ? mediaUrl(poster) : undefined;
  const startMuted = preferUnmuted ? false : Boolean(muted);

  useEffect(() => {
    if (!lazy) return;
    const node = ref.current;
    if (!node) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setActive(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px 0px", threshold: 0.01 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [lazy]);

  useEffect(() => {
    if (!active || !autoPlay) return;
    const video = ref.current;
    if (!video) return;
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduce) return;

    video.muted = startMuted;
    void video.play().catch(() => {
      // Browsers often block unmuted autoplay — fall back, then restore on tap.
      video.muted = true;
      void video.play().catch(() => undefined);
    });
  }, [active, autoPlay, resolvedSrc, startMuted]);

  useEffect(() => {
    if (!preferUnmuted) return;
    const video = ref.current;
    if (!video) return;

    const unmute = () => {
      video.muted = false;
      void video.play().catch(() => undefined);
    };

    video.addEventListener("click", unmute);
    video.addEventListener("touchstart", unmute, { passive: true });
    return () => {
      video.removeEventListener("click", unmute);
      video.removeEventListener("touchstart", unmute);
    };
  }, [preferUnmuted, active, resolvedSrc]);

  return (
    <video
      ref={ref}
      className={cn("bg-[#e2dacf]", className)}
      poster={resolvedPoster}
      controls={controls}
      muted={startMuted}
      loop={loop}
      playsInline={playsInline}
      preload={active ? "metadata" : "none"}
      {...(active ? { src: resolvedSrc } : {})}
      {...rest}
    />
  );
}
