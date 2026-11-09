"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  categories,
  type Product,
  type ProductCategory,
} from "@/data/products";
import { ProductCard } from "./ProductCard";
import { StaggerGrid } from "@/components/motion/StaggerGrid";
import { Pagination, SHOP_PAGE_SIZE } from "@/components/ui/Pagination";
import { formatBdt, cn } from "@/lib/format";

type SortKey = "featured" | "price-asc" | "price-desc" | "newest";

export function ProductsView({
  products,
  initialCategory,
}: {
  products: Product[];
  initialCategory?: string;
}) {
  const t = useTranslations("Products");
  const tc = useTranslations("Categories");
  const locale = useLocale();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [category, setCategory] = useState<ProductCategory | "all">(
    categories.includes(initialCategory as ProductCategory)
      ? (initialCategory as ProductCategory)
      : "all",
  );
  const [sort, setSort] = useState<SortKey>("featured");
  const [page, setPage] = useState(1);

  const priceBounds = useMemo(() => {
    const prices = products.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { min, max };
  }, [products]);

  const [minPrice, setMinPrice] = useState(priceBounds.min);
  const [maxPrice, setMaxPrice] = useState(priceBounds.max);

  const selectCategory = (next: ProductCategory | "all") => {
    setCategory(next);
    setPage(1);
    startTransition(() => {
      router.replace(
        next === "all" ? "/products" : `/products?category=${next}`,
        { scroll: false },
      );
    });
  };

  const filtered = useMemo(() => {
    let list =
      category === "all"
        ? [...products]
        : products.filter((product) => product.category === category);

    list = list.filter(
      (product) => product.price >= minPrice && product.price <= maxPrice,
    );

    switch (sort) {
      case "price-asc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "newest":
        list.sort((a, b) => Number(b.newest) - Number(a.newest));
        break;
      default:
        list.sort((a, b) => Number(b.featured) - Number(a.featured));
    }

    return list;
  }, [category, maxPrice, minPrice, products, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / SHOP_PAGE_SIZE));
  const priceDirty =
    minPrice !== priceBounds.min || maxPrice !== priceBounds.max;

  useEffect(() => {
    setPage(1);
  }, [sort, minPrice, maxPrice]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * SHOP_PAGE_SIZE;
    return filtered.slice(start, start + SHOP_PAGE_SIZE);
  }, [filtered, page]);

  const goToPage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetPrice = () => {
    setMinPrice(priceBounds.min);
    setMaxPrice(priceBounds.max);
  };

  const onMinChange = (value: number) => {
    setMinPrice(Math.min(value, maxPrice));
  };

  const onMaxChange = (value: number) => {
    setMaxPrice(Math.max(value, minPrice));
  };

  const span = Math.max(priceBounds.max - priceBounds.min, 1);
  const leftPct = ((minPrice - priceBounds.min) / span) * 100;
  const rightPct = ((priceBounds.max - maxPrice) / span) * 100;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-5 border-b border-[#1c1a19]/10 pb-6 md:mb-10 md:pb-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="-mx-5 flex gap-1 overflow-x-auto px-5 sm:-mx-8 sm:px-8 md:mx-0 md:px-0 lg:gap-2">
            <FilterChip
              active={category === "all"}
              onClick={() => selectCategory("all")}
              label={t("allCategories")}
            />
            {categories.map((item) => (
              <FilterChip
                key={item}
                active={category === item}
                onClick={() => selectCategory(item)}
                label={tc(item)}
              />
            ))}
          </div>

          <label className="flex shrink-0 items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-[#1c1a19]/45">
            {t("sort")}
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="min-h-10 border border-[#1c1a19]/15 bg-transparent px-3 text-[11px] tracking-[0.08em] text-[#1c1a19] outline-none focus:border-[#c9a08a]"
            >
              <option value="featured">{t("sortFeatured")}</option>
              <option value="newest">{t("sortNewest")}</option>
              <option value="price-asc">{t("sortPriceAsc")}</option>
              <option value="price-desc">{t("sortPriceDesc")}</option>
            </select>
          </label>
        </div>

        {/* Price range */}
        <div className="flex flex-col gap-3 border-t border-[#1c1a19]/08 pt-5 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
          <div className="min-w-0 flex-1 sm:max-w-md">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[#1c1a19]/45">
                {t("priceRange")}
              </p>
              {priceDirty ? (
                <button
                  type="button"
                  onClick={resetPrice}
                  className="text-[10px] uppercase tracking-[0.16em] text-[#1c1a19]/4 transition hover:text-[#1c1a19]"
                >
                  {t("resetPrice")}
                </button>
              ) : null}
            </div>

            <div className="relative h-6">
              <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-[#1c1a19]/15" />
              <div
                className="absolute top-1/2 h-px -translate-y-1/2 bg-[#c9a08a]"
                style={{ left: `${leftPct}%`, right: `${rightPct}%` }}
              />
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={10}
                value={minPrice}
                onChange={(e) => onMinChange(Number(e.target.value))}
                aria-label={t("minPrice")}
                className="price-range-input pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto"
              />
              <input
                type="range"
                min={priceBounds.min}
                max={priceBounds.max}
                step={10}
                value={maxPrice}
                onChange={(e) => onMaxChange(Number(e.target.value))}
                aria-label={t("maxPrice")}
                className="price-range-input pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto"
              />
            </div>

            <div className="mt-2 flex items-center justify-between text-sm text-[#1c1a19]">
              <span>{formatBdt(minPrice, locale)}</span>
              <span className="text-[#1c1a19]/35">—</span>
              <span>{formatBdt(maxPrice, locale)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {(
              [
                [
                  priceBounds.min,
                  1000,
                  t("under", { amount: formatBdt(1000, locale) }),
                ],
                [1000, 2000, t("midRange")],
                [
                  2000,
                  priceBounds.max,
                  t("above", { amount: formatBdt(2000, locale) }),
                ],
              ] as const
            ).map(([lo, hi, label]) => {
              const isActive = minPrice === lo && maxPrice === hi;
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setMinPrice(lo);
                    setMaxPrice(hi);
                  }}
                  className={cn(
                    "border px-3 py-2 text-[10px] uppercase tracking-[0.14em] transition",
                    isActive
                      ? "border-[#1c1a19] bg-[#1c1a19] text-[#f4efe8]"
                      : "border-[#1c1a19]/25 bg-[#e7e0d6]/60 text-[#1c1a19] hover:border-[#1c1a19]/55",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <p className="mb-6 text-[10px] uppercase tracking-[0.22em] text-[#1c1a19]/40">
        {t("results", { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <div className="py-24 text-center">
          <p className="text-sm text-[#1c1a19]/50">{t("empty")}</p>
          {priceDirty ? (
            <button
              type="button"
              onClick={resetPrice}
              className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[#1c1a19] underline-offset-4 hover:underline"
            >
              {t("resetPrice")}
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <StaggerGrid
            key={`${category}-${sort}-${minPrice}-${maxPrice}-${page}`}
            className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:grid-cols-4"
          >
            {paged.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </StaggerGrid>
          <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
        </>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative shrink-0 px-3 py-2.5 text-[11px] uppercase tracking-[0.18em] transition md:px-4",
        active ? "text-[#1c1a19]" : "text-[#1c1a19]/45 hover:text-[#1c1a19]",
      )}
    >
      {label}
      <span
        className={cn(
          "absolute inset-x-3 bottom-1 h-px bg-[#c9a08a] transition md:inset-x-4",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </button>
  );
}
