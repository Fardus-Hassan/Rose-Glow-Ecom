"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/format";

function FlagBd({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 20"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="36" height="20" fill="#006a4e" />
      <circle cx="15" cy="10" r="5.5" fill="#f42a41" />
    </svg>
  );
}

function FlagGb({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 36 20"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="36" height="20" fill="#012169" />
      <path d="M0 0 L36 20 M36 0 L0 20" stroke="#fff" strokeWidth="4.2" />
      <path d="M0 0 L36 20 M36 0 L0 20" stroke="#C8102E" strokeWidth="2.2" />
      <path d="M18 0 V20 M0 10 H36" stroke="#fff" strokeWidth="6.5" />
      <path d="M18 0 V20 M0 10 H36" stroke="#C8102E" strokeWidth="3.4" />
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

  const toggle = () => {
    router.replace(pathname, { locale: nextLocale });
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isEn}
      aria-label={isEn ? "Switch to Bangla" : "Switch to English"}
      onClick={toggle}
      className={cn(
        "relative inline-flex shrink-0 items-center overflow-hidden rounded-full transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "shadow-[inset_0_1px_2px_rgba(0,0,0,0.35),inset_0_-1px_1px_rgba(255,255,255,0.25)]",
        size === "sm" ? "h-6 w-11" : "h-7 w-[3.25rem]",
        light ? "ring-1 ring-white/25" : "ring-1 ring-[#1c1a19]/12",
      )}
    >
      <span className="pointer-events-none absolute inset-0">
        {isEn ? (
          <FlagGb className="h-full w-full" />
        ) : (
          <FlagBd className="h-full w-full" />
        )}
        <span className="absolute inset-0 bg-black/10" />
      </span>

      <span
        className={cn(
          "pointer-events-none absolute top-1/2 z-10 -translate-y-1/2 rounded-full bg-white transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "shadow-[0_1px_3px_rgba(0,0,0,0.35),0_0_0_1px_rgba(0,0,0,0.06)]",
          size === "sm" ? "h-5 w-5" : "h-6 w-6",
          isEn
            ? size === "sm"
              ? "translate-x-[1.35rem]"
              : "translate-x-[1.55rem]"
            : "translate-x-0.5",
        )}
      />
    </button>
  );
}
