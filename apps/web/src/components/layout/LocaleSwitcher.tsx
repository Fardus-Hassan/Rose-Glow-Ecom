"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/format";

function FlagBd({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 28"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="56" height="28" fill="#006a4e" />
      {/* Sit in the open (right) half when thumb is on the left */}
      <circle cx="38" cy="14" r="8.5" fill="#f42a41" />
    </svg>
  );
}

function FlagGb({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 56 28"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="56" height="28" fill="#012169" />
      <path d="M0 0 L56 28 M56 0 L0 28" stroke="#fff" strokeWidth="5.5" />
      <path d="M0 0 L56 28 M56 0 L0 28" stroke="#C8102E" strokeWidth="2.8" />
      <path d="M28 0 V28 M0 14 H56" stroke="#fff" strokeWidth="9" />
      <path d="M28 0 V28 M0 14 H56" stroke="#C8102E" strokeWidth="4.5" />
    </svg>
  );
}

export function LocaleSwitcher({
  light = false,
  size = "md",
}: {
  light?: boolean;
  size?: "sm" | "md";
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const isEn = locale === "en";
  const nextLocale = isEn ? "bn" : "en";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isEn}
      aria-label={isEn ? "Switch to Bangla" : "Switch to English"}
      onClick={() => router.replace(pathname, { locale: nextLocale })}
      className={cn(
        "relative inline-flex shrink-0 items-center overflow-hidden rounded-full",
        "shadow-[inset_0_1px_2px_rgba(0,0,0,0.28),inset_0_-1px_1px_rgba(255,255,255,0.22)]",
        size === "sm" ? "h-7 w-[3.25rem]" : "h-8 w-14",
        light ? "ring-1 ring-white/30" : "ring-1 ring-[#1c1a19]/10",
      )}
    >
      {/* Crossfade flags so the switch feels continuous */}
      <span className="pointer-events-none absolute inset-0">
        <span
          className={cn(
            "absolute inset-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isEn ? "opacity-0" : "opacity-100",
          )}
        >
          <FlagBd className="h-full w-full" />
        </span>
        <span
          className={cn(
            "absolute inset-0 transition-opacity duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            isEn ? "opacity-100" : "opacity-0",
          )}
        >
          <FlagGb className="h-full w-full" />
        </span>
        <span className="absolute inset-0 bg-black/[0.06]" />
      </span>

      <span
        className={cn(
          "pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-white",
          "shadow-[0_2px_6px_rgba(0,0,0,0.28),0_0_0_1px_rgba(0,0,0,0.05)]",
          "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform",
          size === "sm" ? "h-[1.35rem] w-[1.35rem]" : "h-6 w-6",
          isEn
            ? size === "sm"
              ? "translate-x-[1.7rem]"
              : "translate-x-[1.9rem]"
            : "translate-x-[0.2rem]",
        )}
      />
    </button>
  );
}
