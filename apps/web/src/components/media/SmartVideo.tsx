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
  playsInline = true,
  ...rest
}: SmartVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);
  const [active, setActive] = useState(!lazy);
  const resolvedSrc = mediaUrl(src);
  const resolvedPoster = poster ? mediaUrl(poster) : undefined;

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
    void video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => undefined);
    });
  }, [active, autoPlay, resolvedSrc]);

  return (
    <video
      ref={ref}
      className={cn("bg-[#e2dacf]", className)}
      poster={resolvedPoster}
      controls={controls}
      muted={muted}
      loop={loop}
      playsInline={playsInline}
      preload={active ? "metadata" : "none"}
      {...(active ? { src: resolvedSrc } : {})}
      {...rest}
    />
  );
}
