"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/format";

export function LocaleSwitcher({ light = false }: { light?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em]",
        light ? "text-[#f4efe8]/45" : "text-[color:var(--rg-muted)]",
      )}
      role="group"
      aria-label="Language"
    >
      {(["bn", "en"] as const).map((code, index) => (
        <span key={code} className="inline-flex items-center gap-1.5">
          {index > 0 ? (
            <span className={light ? "text-[#f4efe8]/25" : "text-[color:var(--rg-line)]"}>
              /
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => router.replace(pathname, { locale: code })}
            className={cn(
              "transition",
              locale === code
                ? light
                  ? "text-[#f4efe8]"
                  : "text-[color:var(--rg-ink)]"
                : light
                  ? "hover:text-[#f4efe8]/80"
                  : "hover:text-[color:var(--rg-ink)]",
            )}
            aria-current={locale === code ? "true" : undefined}
          >
            {code}
          </button>
        </span>
      ))}
    </div>
  );
}
