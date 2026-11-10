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
    "flex h-10 w-10 items-center justify-center border border-[#1c1a19]/15 text-sm text-[#1c1a19] transition hover:border-[#1c1a19] disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <nav
      aria-label={t("label")}
      className={cn(
        "mt-12 flex flex-col items-center gap-4 border-t border-[#1c1a19]/10 pt-8 md:mt-16 md:pt-10",
        className,
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.22em] text-[#1c1a19]/4">
        {t("status", { page, total: totalPages })}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => onChange(1)}
          disabled={page <= 1}
          className={navBtn}
          aria-label={t("first")}
        >
          «
        </button>
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
              className="flex h-10 min-w-8 items-center justify-center px-1 text-[#1c1a19]/35"
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
                  ? "bg-[#1c1a19] text-[#f4efe8]"
                  : "border border-[#1c1a19]/12 text-[#1c1a19]/55 hover:border-[#c9a08a] hover:text-[#1c1a19]",
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
        <button
          type="button"
          onClick={() => onChange(totalPages)}
          disabled={page >= totalPages}
          className={navBtn}
          aria-label={t("last")}
        >
          »
        </button>
      </div>
    </nav>
  );
}

