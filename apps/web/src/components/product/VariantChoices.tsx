"use client";

import { useLocale } from "next-intl";
import { localize, type ProductOption } from "@/data/products";
import { cn } from "@/lib/format";

export function VariantChoices({
  options,
  selectedId,
  onSelect,
}: {
  options: ProductOption[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  const locale = useLocale();
  if (!options.length) return null;

  const pictured = options.some((option) => option.image);
  const label = locale === "bn" ? "বেছে নিন" : "Choose";

  if (!pictured) {
    return (
      <div className="mt-5">
        <p className="mb-2.5 text-[10px] uppercase tracking-[0.22em] text-[color:var(--rg-muted)]">
          {label}
        </p>
        <div className="flex flex-wrap gap-2">
          {options.map((option) => {
            const selected = option.id === selectedId;
            const soldOut = option.stock <= 0;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelect(option.id)}
                disabled={soldOut}
                className={cn(
                  "min-h-10 border px-3.5 font-display text-[1.05rem] leading-none tracking-wide transition disabled:cursor-not-allowed disabled:opacity-40",
                  selected
                    ? "border-[color:var(--rg-accent)] bg-[color:var(--rg-accent)] text-[color:var(--rg-cta-ink)]"
                    : "border-[color:var(--rg-line)] text-[color:var(--rg-pearl)] hover:border-[color:var(--rg-accent)]/60",
                )}
              >
                {localize(option.name, locale)}
                {soldOut ? (
                  <span className="ml-2 align-middle text-[9px] uppercase tracking-[0.14em] opacity-60">
                    {locale === "bn" ? "স্টক নেই" : "Sold out"}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5">
      <p className="mb-2.5 text-[10px] uppercase tracking-[0.22em] text-[color:var(--rg-muted)]">
        {label}
      </p>
      <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {options.map((option) => {
          const selected = option.id === selectedId;
          const soldOut = option.stock <= 0;
          const name = localize(option.name, locale);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              disabled={soldOut}
              aria-pressed={selected}
              className="w-[4.4rem] shrink-0 text-left disabled:cursor-not-allowed sm:w-[4.9rem]"
            >
              <span
                className={cn(
                  "relative block aspect-[4/5] overflow-hidden bg-[color:var(--rg-paper-deep)] transition duration-300",
                  selected
                    ? "ring-1 ring-[color:var(--rg-accent)] ring-offset-2 ring-offset-[color:var(--rg-paper)]"
                    : "ring-1 ring-[color:var(--rg-line)] hover:ring-[color:var(--rg-accent)]/55",
                  soldOut && "opacity-45",
                )}
              >
                {option.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={option.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center px-1 text-center font-display text-xl text-[color:var(--rg-pearl)]/70">
                    {name.slice(0, 1)}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "mt-2 block truncate text-[11px] tracking-[0.04em]",
                  selected
                    ? "text-[color:var(--rg-pearl)]"
                    : "text-[color:var(--rg-muted)]",
                  soldOut && "line-through",
                )}
              >
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
