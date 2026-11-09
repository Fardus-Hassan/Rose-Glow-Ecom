"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/format";

function FlagBd({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 16"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="24" height="16" fill="#006a4e" />
      <circle cx="10.5" cy="8" r="4.2" fill="#f42a41" />
    </svg>
  );
}

function FlagGb({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 16"
      className={className}
      aria-hidden
      focusable="false"
    >
      <rect width="24" height="16" fill="#012169" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#fff" strokeWidth="3.2" />
      <path d="M0 0 L24 16 M24 0 L0 16" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M12 0 V16 M0 8 H24" stroke="#fff" strokeWidth="5" />
      <path d="M12 0 V16 M0 8 H24" stroke="#C8102E" strokeWidth="2.6" />
    </svg>
  );
}

const locales = [
  { code: "bn" as const, label: "বাং", Flag: FlagBd },
  { code: "en" as const, label: "EN", Flag: FlagGb },
];

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

  return (
    <div
      role="group"
      aria-label="Language"
      className={cn(
        "inline-flex items-center rounded-[2px] p-0.5 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        light
          ? "border border-white/20 bg-white/[0.06]"
          : "border border-[#1c1a19]/15 bg-[#e7e0d6]/55",
        size === "sm" ? "gap-0.5" : "gap-0.5",
      )}
    >
      {locales.map(({ code, label, Flag }) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => router.replace(pathname, { locale: code })}
            aria-current={active ? "true" : undefined}
            aria-label={code === "bn" ? "Bangla" : "English"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-[1px] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              size === "sm" ? "px-1.5 py-1" : "px-2 py-1.5",
              active
                ? light
                  ? "bg-[#f4efe8] text-[#1c1a19] shadow-[0_1px_0_rgba(0,0,0,0.08)]"
                  : "bg-[#1c1a19] text-[#f4efe8]"
                : light
                  ? "text-[#f4efe8]/55 hover:text-[#f4efe8]"
                  : "text-[#1c1a19]/45 hover:text-[#1c1a19]",
            )}
          >
            <Flag
              className={cn(
                "shrink-0 overflow-hidden rounded-[1px] ring-1",
                size === "sm" ? "h-2.5 w-[15px]" : "h-3 w-[18px]",
                light && active
                  ? "ring-[#1c1a19]/15"
                  : light
                    ? "ring-white/25"
                    : active
                      ? "ring-white/20"
                      : "ring-[#1c1a19]/15",
              )}
            />
            <span
              className={cn(
                "font-medium uppercase tracking-[0.12em]",
                size === "sm" ? "text-[9px]" : "text-[10px]",
              )}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
