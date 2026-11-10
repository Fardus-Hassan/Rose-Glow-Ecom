"use client";

import { cn } from "@/lib/format";

function getPageItems(page: number, totalPages: number): Array<number | "…"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (page <= 3) return [1, 2, 3, 4, "…", totalPages];
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

export function AdminPagination({
  page,
  totalPages,
  total,
  pageSize,
  onChange,
  className,
}: {
  page: number;
  totalPages: number;
  total?: number;
  pageSize?: number;
  onChange: (page: number) => void;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  const items = getPageItems(page, totalPages);
  const from =
    total != null && pageSize != null ? (page - 1) * pageSize + 1 : null;
  const to =
    total != null && pageSize != null
      ? Math.min(page * pageSize, total)
      : null;

  const navBtn =
    "flex h-9 w-9 items-center justify-center border border-ink/15 text-sm text-ink transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <nav
      aria-label="Pagination"
      className={cn(
        "mt-6 flex flex-col items-center justify-between gap-3 border-t border-ink/10 pt-5 sm:flex-row",
        className,
      )}
    >
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
        {from != null && to != null && total != null
          ? `${from}–${to} of ${total}`
          : `Page ${page} of ${totalPages}`}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(1)}
          disabled={page <= 1}
          className={navBtn}
          aria-label="First page"
        >
          «
        </button>
        <button
          type="button"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page <= 1}
          className={navBtn}
          aria-label="Previous page"
        >
          ‹
        </button>
        {items.map((item, index) =>
          item === "…" ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-9 min-w-7 items-center justify-center px-1 text-muted"
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
                "flex h-9 min-w-9 items-center justify-center px-2 text-[11px] transition",
                item === page
                  ? "bg-night text-cream"
                  : "border border-ink/12 text-muted hover:border-rose hover:text-ink",
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
          aria-label="Next page"
        >
          ›
        </button>
        <button
          type="button"
          onClick={() => onChange(totalPages)}
          disabled={page >= totalPages}
          className={navBtn}
          aria-label="Last page"
        >
          »
        </button>
      </div>
    </nav>
  );
}
