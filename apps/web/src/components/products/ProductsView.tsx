"use client";

import { useEffect, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { type Product, type ProductCategory } from "@/data/products";
import {
  fetchProductsPage,
  type ProductsPage,
} from "@/lib/catalog";
import { ProductCard } from "./ProductCard";
import { StaggerGrid } from "@/components/motion/StaggerGrid";
import { ProductGridSkeleton } from "@/components/skeletons/StorefrontSkeletons";
import { Pagination } from "@/components/ui/Pagination";
import { SHOP_PAGE_SIZE } from "@/lib/shop";
import { formatBdt, cn } from "@/lib/format";
import { useCatalog } from "@/store/catalog";

type SortKey = "featured" | "price-asc" | "price-desc" | "newest";

export function ProductsView({
  initial,
  initialCategory,
}: {
  initial: ProductsPage;
  initialCategory?: string;
}) {
  const t = useTranslations("Products");
  const tc = useTranslations("Categories");
  const locale = useLocale();
  const router = useRouter();
  const { ready, categories } = useCatalog();
  const [, startTransition] = useTransition();
  const [category, setCategory] = useState<ProductCategory | "all">(
    categories.includes(initialCategory as ProductCategory)
      ? (initialCategory as ProductCategory)
      : "all",
  );
  const [sort, setSort] = useState<SortKey>("featured");
  const [page, setPage] = useState(initial.page || 1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductsPage>(initial);

  const priceBounds = {
    min: initial.facets?.minPrice ?? result.facets?.minPrice ?? 0,
    max: initial.facets?.maxPrice ?? result.facets?.maxPrice ?? 0,
  };

  const [minPrice, setMinPrice] = useState(priceBounds.min);
  const [maxPrice, setMaxPrice] = useState(priceBounds.max);
  const bounds = priceBounds;

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

  const changeSort = (next: SortKey) => {
    setSort(next);
    setPage(1);
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const next = await fetchProductsPage({
          page,
          pageSize: SHOP_PAGE_SIZE,
          category: category === "all" ? undefined : category,
          sort,
          minPrice,
          maxPrice,
        });
        if (cancelled) return;
        setResult(next);
        if (next.page !== page) setPage(next.page);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [category, sort, minPrice, maxPrice, page]);

  const goToPage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const priceDirty = minPrice !== bounds.min || maxPrice !== bounds.max;

  const resetPrice = () => {
    setMinPrice(bounds.min);
    setMaxPrice(bounds.max);
  };

  const onMinChange = (value: number) => {
    setMinPrice(Math.min(value, maxPrice));
    setPage(1);
  };

  const onMaxChange = (value: number) => {
    setMaxPrice(Math.max(value, minPrice));
    setPage(1);
  };

  const span = Math.max(bounds.max - bounds.min, 1);
  const leftPct = ((minPrice - bounds.min) / span) * 100;
  const rightPct = ((bounds.max - maxPrice) / span) * 100;
  const products = result.items;

  return (
    <div>
      <div className="mb-8 flex flex-col gap-5 border-b border-[#1c1a19]/10 pb-6 md:mb-10 md:pb-7">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="-mx-5 flex gap-1 overflow-x-auto px-5 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-8 sm:px-8 md:mx-0 md:px-0 lg:gap-2 [&::-webkit-scrollbar]:hidden">
            {!ready ? (
              Array.from({ length: 6 }).map((_, i) => (
                <span
                  key={i}
                  className="inline-block h-9 w-20 shrink-0 animate-pulse rounded-sm bg-[#1c1a19]/10"
                />
              ))
            ) : (
              <>
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
              </>
            )}
          </div>

          <label className="flex shrink-0 items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-[#1c1a19]/45">
            {t("sort")}
            <select
              value={sort}
              onChange={(event) => changeSort(event.target.value as SortKey)}
              className="min-h-10 border border-[#1c1a19]/15 bg-transparent px-3 text-[11px] tracking-[0.08em] text-[#1c1a19] outline-none focus:border-[#c9a08a]"
            >
              <option value="featured">{t("sortFeatured")}</option>
              <option value="newest">{t("sortNewest")}</option>
              <option value="price-asc">{t("sortPriceAsc")}</option>
              <option value="price-desc">{t("sortPriceDesc")}</option>
            </select>
          </label>
        </div>

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
                min={bounds.min}
                max={bounds.max}
                step={10}
                value={minPrice}
                onChange={(e) => onMinChange(Number(e.target.value))}
                aria-label={t("minPrice")}
                className="price-range-input pointer-events-none absolute inset-0 w-full appearance-none bg-transparent [&::-moz-range-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:pointer-events-auto"
              />
              <input
                type="range"
                min={bounds.min}
                max={bounds.max}
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
                  bounds.min,
                  1000,
                  t("under", { amount: formatBdt(1000, locale) }),
                ],
                [1000, 2000, t("midRange")],
                [
                  2000,
                  bounds.max,
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
                    setPage(1);
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
        {loading && products.length === 0 ? (
          <span className="inline-block h-3 w-28 animate-pulse rounded-sm bg-[#1c1a19]/10" />
        ) : (
          t("results", { count: result.total })
        )}
      </p>

      {loading && products.length === 0 ? (
        <ProductGridSkeleton count={SHOP_PAGE_SIZE} />
      ) : products.length === 0 ? (
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
          <div
            className={cn(
              "transition-opacity duration-200",
              loading && "pointer-events-none opacity-45",
            )}
          >
            <StaggerGrid
              key={`${category}-${sort}-${minPrice}-${maxPrice}-${page}`}
              className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:grid-cols-4"
            >
              {products.map((product: Product, index: number) => (
                <ProductCard
                  key={product.slug}
                  product={product}
                  priority={index < 4}
                />
              ))}
            </StaggerGrid>
          </div>
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            onChange={goToPage}
          />
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
