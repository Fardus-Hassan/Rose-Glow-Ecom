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
import { StaggerParallax } from "@/components/motion/StaggerParallax";
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

  const filters = (
    <>
      <div>
        <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[color:var(--rg-accent)]">
          {t("filters")}
        </p>
        <div className="flex flex-col gap-0.5">
          {!ready ? (
            Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className="mb-2 inline-block h-8 w-28 animate-pulse rounded-sm bg-[color:var(--rg-pearl)]/10"
              />
            ))
          ) : (
            <>
              <FilterLink
                active={category === "all"}
                onClick={() => selectCategory("all")}
                label={t("allCategories")}
              />
              {categories.map((item) => (
                <FilterLink
                  key={item}
                  active={category === item}
                  onClick={() => selectCategory(item)}
                  label={tc(item)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      <div className="mt-10 border-t border-[color:var(--rg-line)] pt-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[color:var(--rg-accent)]">
            {t("priceRange")}
          </p>
          {priceDirty ? (
            <button
              type="button"
              onClick={resetPrice}
              className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--rg-accent)]/70 transition hover:text-[color:var(--rg-accent)]"
            >
              {t("resetPrice")}
            </button>
          ) : null}
        </div>

        <div className="relative h-6 px-1.5">
          <div className="absolute inset-x-1.5 top-1/2 h-px -translate-y-1/2 bg-[color:var(--rg-pearl)]/15" />
          <div
            className="absolute top-1/2 h-px -translate-y-1/2 bg-[color:var(--rg-accent)]"
            style={{
              left: `calc(${leftPct}% + 0.125rem)`,
              right: `calc(${rightPct}% + 0.125rem)`,
            }}
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

        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[color:var(--rg-pearl)]">
          <span className="tabular-nums">{formatBdt(minPrice, locale)}</span>
          <span className="text-[color:var(--rg-muted)]">—</span>
          <span className="tabular-nums">{formatBdt(maxPrice, locale)}</span>
        </div>

        <div className="mt-5 flex flex-col gap-2">
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
            const nextMin = Math.min(Math.max(lo, bounds.min), bounds.max);
            const nextMax = Math.max(Math.min(hi, bounds.max), bounds.min);
            const isActive = minPrice === nextMin && maxPrice === nextMax;
            return (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setMinPrice(nextMin);
                  setMaxPrice(nextMax);
                  setPage(1);
                }}
                className={cn(
                  "border px-3 py-2.5 text-left text-[10px] uppercase tracking-[0.14em] transition",
                  isActive
                    ? "border-[color:var(--rg-accent)] bg-[color:var(--rg-accent)] text-[color:var(--rg-cta-ink)]"
                    : "border-[color:var(--rg-line)] text-[color:var(--rg-pearl)] hover:border-[color:var(--rg-accent)]/55",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  return (
    <div className="container-rg">
      {/* Mobile category runway */}
      <div className="mb-8 border-b border-[color:var(--rg-line)] pb-6 lg:hidden">
        <div className="-mx-5 flex gap-1 overflow-x-auto px-5 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-8 sm:px-8 [&::-webkit-scrollbar]:hidden">
          {!ready ? (
            Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                className="inline-block h-9 w-20 shrink-0 animate-pulse rounded-sm bg-[color:var(--rg-pearl)]/10"
              />
            ))
          ) : (
            <>
              <MobileChip
                active={category === "all"}
                onClick={() => selectCategory("all")}
                label={t("allCategories")}
              />
              {categories.map((item) => (
                <MobileChip
                  key={item}
                  active={category === item}
                  onClick={() => selectCategory(item)}
                  label={tc(item)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Asymmetric shop: sticky filter rail + sticky sort bar + runway.
          Aside must stretch with the grid row (no self-start) so sticky has room to travel. */}
      <div className="grid gap-10 lg:grid-cols-[minmax(180px,220px)_minmax(0,1fr)] lg:items-start lg:gap-14 xl:gap-20">
        <aside className="sticky top-[7.25rem] z-20 hidden lg:block">
          <div className="max-h-[calc(100vh-7.75rem)] overflow-y-auto overscroll-contain py-1 pr-1">
            {filters}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-8 flex flex-col gap-4 border-b border-[color:var(--rg-line)] pb-5 sm:flex-row sm:items-end sm:justify-between md:mb-10">
            <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--rg-muted)]">
              {loading && products.length === 0 ? (
                <span className="inline-block h-3 w-28 animate-pulse rounded-sm bg-[color:var(--rg-pearl)]/10" />
              ) : (
                t("results", { count: result.total })
              )}
            </p>

            <label className="flex shrink-0 items-center gap-3 text-[10px] uppercase tracking-[0.22em] text-[color:var(--rg-muted)]">
              {t("sort")}
              <select
                value={sort}
                onChange={(event) => changeSort(event.target.value as SortKey)}
                className="min-h-10 border border-[color:var(--rg-line)] bg-transparent px-3 text-[11px] tracking-[0.08em] text-[color:var(--rg-pearl)] outline-none focus:border-[color:var(--rg-accent)]"
              >
                <option value="featured">{t("sortFeatured")}</option>
                <option value="newest">{t("sortNewest")}</option>
                <option value="price-asc">{t("sortPriceAsc")}</option>
                <option value="price-desc">{t("sortPriceDesc")}</option>
              </select>
            </label>
          </div>

          {/* Mobile price strip */}
          <div className="mb-8 border-b border-[color:var(--rg-line)] pb-6 lg:hidden">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--rg-muted)]">
                {t("priceRange")}
              </p>
              {priceDirty ? (
                <button
                  type="button"
                  onClick={resetPrice}
                  className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--rg-accent)]"
                >
                  {t("resetPrice")}
                </button>
              ) : null}
            </div>
            <div className="relative h-6 px-1.5">
              <div className="absolute inset-x-1.5 top-1/2 h-px -translate-y-1/2 bg-[color:var(--rg-pearl)]/15" />
              <div
                className="absolute top-1/2 h-px -translate-y-1/2 bg-[color:var(--rg-accent)]"
                style={{
                  left: `calc(${leftPct}% + 0.125rem)`,
                  right: `calc(${rightPct}% + 0.125rem)`,
                }}
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
            <div className="mt-2 flex justify-between text-sm tabular-nums text-[color:var(--rg-pearl)]">
              <span>{formatBdt(minPrice, locale)}</span>
              <span>{formatBdt(maxPrice, locale)}</span>
            </div>
          </div>

          {loading && products.length === 0 ? (
            <ProductGridSkeleton count={SHOP_PAGE_SIZE} />
          ) : products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-sm text-[color:var(--rg-muted)]">{t("empty")}</p>
              {priceDirty ? (
                <button
                  type="button"
                  onClick={resetPrice}
                  className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[color:var(--rg-accent)] underline-offset-4 hover:underline"
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
                <StaggerParallax
                  key={`${category}-${sort}-${minPrice}-${maxPrice}-${page}`}
                  className="grid grid-cols-2 gap-x-3 gap-y-12 sm:gap-x-5 md:grid-cols-3 md:gap-x-7 md:gap-y-0"
                  yOffsets={[40, -48, 24, -36, 32, -20]}
                >
                  {products.map((product: Product, index: number) => (
                    <div
                      key={product.slug}
                      data-stagger-item
                      className={
                        index % 3 === 0
                          ? "md:mt-16"
                          : index % 2 === 0
                            ? "md:mt-6"
                            : "md:mt-0"
                      }
                    >
                      <ProductCard
                        product={product}
                        priority={index < 4}
                      />
                    </div>
                  ))}
                </StaggerParallax>
              </div>
              <Pagination
                page={result.page}
                totalPages={result.totalPages}
                onChange={goToPage}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterLink({
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
        "group relative py-2.5 text-left text-[13px] uppercase tracking-[0.16em] transition",
        active
          ? "text-[color:var(--rg-pearl)]"
          : "text-[color:var(--rg-muted)] hover:text-[color:var(--rg-pearl)]",
      )}
    >
      <span className="inline-flex items-center gap-3">
        <span
          className={cn(
            "h-px w-4 bg-[color:var(--rg-accent)] transition",
            active ? "opacity-100" : "opacity-0 group-hover:opacity-40",
          )}
        />
        {label}
      </span>
    </button>
  );
}

function MobileChip({
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
        "relative shrink-0 px-3 py-2.5 text-[11px] uppercase tracking-[0.18em] transition",
        active
          ? "text-[color:var(--rg-pearl)]"
          : "text-[color:var(--rg-muted)] hover:text-[color:var(--rg-pearl)]",
      )}
    >
      {label}
      <span
        className={cn(
          "absolute inset-x-3 bottom-1 h-px bg-[color:var(--rg-accent)] transition",
          active ? "opacity-100" : "opacity-0",
        )}
      />
    </button>
  );
}
