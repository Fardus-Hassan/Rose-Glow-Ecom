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
      <div className="mt-6">
        <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#1c1a19]/45">
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
                  "min-h-11 border px-4 font-display text-[1.15rem] leading-none tracking-wide transition disabled:cursor-not-allowed disabled:opacity-40",
                  selected
                    ? "border-[#1c1a19] bg-[#e7e0d6] text-[#1c1a19]"
                    : "border-[#1c1a19]/15 text-[#1c1a19]/75 hover:border-[#c9a08a]",
                )}
              >
                {localize(option.name, locale)}
                {soldOut ? (
                  <span className="ml-2 align-middle text-[9px] uppercase tracking-[0.14em] text-[#1c1a19]/45">
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
    <div className="mt-6">
      <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#1c1a19]/45">
        {label}
      </p>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
              className="w-[4.6rem] shrink-0 text-left disabled:cursor-not-allowed sm:w-[5.15rem]"
            >
              <span
                className={cn(
                  "relative block aspect-[4/5] overflow-hidden bg-[#e2dacf] transition duration-300",
                  selected
                    ? "outline outline-2 outline-offset-2 outline-[#1c1a19]"
                    : "outline outline-1 outline-offset-0 outline-[#1c1a19]/12 hover:outline-[#c9a08a]",
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
                  <span className="flex h-full items-center justify-center px-1 text-center font-display text-xl text-[#1c1a19]/70">
                    {name.slice(0, 1)}
                  </span>
                )}
              </span>
              <span
                className={cn(
                  "mt-2.5 block truncate text-[11px] tracking-[0.04em]",
                  selected ? "text-[#1c1a19]" : "text-[#1c1a19]/50",
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
