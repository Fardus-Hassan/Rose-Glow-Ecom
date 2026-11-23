"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/format";

function getPageItems(page: number, totalPages: number): Array<number | "…"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Always show first, last, current neighborhood — like 1 2 … 46
  if (page <= 3) {
    return [1, 2, 3, 4, "…", totalPages];
  }

  if (page >= totalPages - 2) {
    return [
      1,
      "…",
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [1, "…", page - 1, page, page + 1, "…", totalPages];
}

export function Pagination({
  page,
  totalPages,
  onChange,
  className,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  const t = useTranslations("Pagination");

  if (totalPages <= 1) return null;

  const items = getPageItems(page, totalPages);

  const navBtn =
    "flex h-10 w-10 items-center justify-center border border-[#d4af37] text-sm text-[#f3eee8] transition hover:bg-[#d4af37]/10 disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <nav
      aria-label={t("label")}
      className={cn(
        "mt-12 flex flex-col items-center gap-4 border-t border-[#f3eee8]/10 pt-8 md:mt-16 md:pt-10",
        className,
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.22em] text-[#f3eee8]/4">
        {t("status", { page, total: totalPages })}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className={navBtn}
          aria-label={t("prev")}
        >
          ‹
        </button>

        {items.map((item, index) =>
          item === "…" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-10 min-w-8 items-center justify-center px-1 text-[#f3eee8]/35"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "flex h-10 min-w-10 items-center justify-center px-2 text-[11px] transition",
                item === page
                  ? "border border-[#d4af37] bg-[#d4af37] text-[#0c0a0b]"
                  : "border border-[#d4af37] text-[#f3eee8] hover:bg-[#d4af37]/10",
              )}
            >
              {item}
            </button>
          ),
        )}

        <button
          type="button"
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
          className={navBtn}
          aria-label={t("next")}
        >
          ›
        </button>
      </div>
    </nav>
  );
}

