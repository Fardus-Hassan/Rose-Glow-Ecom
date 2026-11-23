"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/format";

function FlagBd({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      focusable="false"
    >
      <circle cx="12" cy="12" r="12" fill="#006a4e" />
      <circle cx="10.5" cy="12" r="5.2" fill="#f42a41" />
    </svg>
  );
}

function FlagGb({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      focusable="false"
    >
      <circle cx="12" cy="12" r="12" fill="#012169" />
      <path d="M0 0 L24 24 M24 0 L0 24" stroke="#fff" strokeWidth="3.2" />
      <path d="M0 0 L24 24 M24 0 L0 24" stroke="#C8102E" strokeWidth="1.6" />
      <path d="M12 0 V24 M0 12 H24" stroke="#fff" strokeWidth="5" />
      <path d="M12 0 V24 M0 12 H24" stroke="#C8102E" strokeWidth="2.6" />
    </svg>
  );
}

const locales = [
  { code: "bn" as const, label: "বাংলা", Flag: FlagBd },
  { code: "en" as const, label: "English", Flag: FlagGb },
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const current = locales.find((item) => item.code === locale) ?? locales[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex items-center gap-1.5 transition",
          size === "sm" ? "gap-1.5" : "gap-2",
          light
            ? "text-[#f3eee8]/85 hover:text-[#f3eee8]"
            : "text-[#f3eee8]/75 hover:text-[#f3eee8]",
        )}
      >
        <current.Flag
          className={cn(
            "shrink-0 overflow-hidden rounded-full ring-1",
            size === "sm" ? "h-5 w-5" : "h-6 w-6",
            light ? "ring-white/25" : "ring-white/20",
          )}
        />
        <span
          className={cn(
            "font-medium leading-none",
            size === "sm" ? "text-[11px]" : "text-[13px]",
          )}
        >
          {current.label}
        </span>
        <svg
          viewBox="0 0 12 12"
          className={cn(
            "shrink-0 transition-transform duration-200",
            size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3",
            open && "rotate-180",
            light ? "text-[#f3eee8]/55" : "text-[#f3eee8]/45",
          )}
          aria-hidden
          focusable="false"
        >
          <path
            d="M2.5 4.5 L6 8 L9.5 4.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label="Language"
          className={cn(
            "absolute left-0 top-[calc(100%+0.4rem)] z-[70] min-w-[8.5rem] overflow-hidden border py-1 shadow-[0_12px_40px_rgba(0,0,0,0.14)]",
            light
              ? "border-white/10 bg-[#121110] text-[#f3eee8]"
              : "border-white/10 bg-[#121110] text-[#f3eee8]",
          )}
        >
          {locales.map(({ code, label, Flag }) => {
            const active = locale === code;
            return (
              <button
                key={code}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  setOpen(false);
                  if (code !== locale) {
                    router.replace(pathname, { locale: code });
                  }
                }}
                className={cn(
                  "flex w-full items-center gap-2.5 px-3 py-2 text-left text-[12px] transition",
                  active
                    ? light
                      ? "bg-white/10 text-[#f3eee8]"
                      : "bg-white/10 text-[#f3eee8]"
                    : light
                      ? "text-[#f3eee8]/7 hover:bg-white/8 hover:text-[#f3eee8]"
                      : "text-[#f3eee8]/7 hover:bg-white/8 hover:text-[#f3eee8]",
                )}
              >
                <Flag className="h-5 w-5 shrink-0 rounded-full ring-1 ring-black/10" />
                <span className="font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
