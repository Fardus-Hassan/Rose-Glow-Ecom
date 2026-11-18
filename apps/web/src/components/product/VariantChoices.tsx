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

  return (
    <div className="mt-5">
      <p className="mb-2.5 text-[10px] uppercase tracking-[0.2em] text-[#1c1a19]/45">
        {locale === "bn" ? "অপশন" : "Option"}
      </p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selected = option.id === selectedId;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(option.id)}
              disabled={option.stock <= 0}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 border px-2.5 py-1.5 text-[11px] uppercase tracking-[0.14em] transition disabled:cursor-not-allowed disabled:opacity-40",
                selected
                  ? "border-[#1c1a19] bg-[#1c1a19] text-[#f4efe8]"
                  : "border-[#1c1a19]/15 text-[#1c1a19]/70 hover:border-[#1c1a19]/40",
              )}
            >
              {option.image ? (
                <span className="relative h-9 w-7 shrink-0 overflow-hidden bg-[#e2dacf]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={option.image}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </span>
              ) : null}
              <span className="flex flex-col items-start gap-0.5 normal-case tracking-normal">
                <span className="text-[11px] uppercase tracking-[0.14em]">
                  {localize(option.name, locale)}
                </span>
                {option.stock <= 0 ? (
                  <span className="text-[9px] uppercase tracking-[0.12em] opacity-70">
                    {locale === "bn" ? "স্টক নেই" : "Sold out"}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
