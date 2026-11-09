"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import {
  categories,
  type Product,
  type ProductCategory,
} from "@/data/products";
import { ProductCard } from "./ProductCard";
import { StaggerGrid } from "@/components/motion/StaggerGrid";
import { cn } from "@/lib/format";

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
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [category, setCategory] = useState<ProductCategory | "all">(
    categories.includes(initialCategory as ProductCategory)
      ? (initialCategory as ProductCategory)
      : "all",
  );
  const [sort, setSort] = useState<SortKey>("featured");

  const selectCategory = (next: ProductCategory | "all") => {
    setCategory(next);
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
  }, [category, products, sort]);

  return (
    <div>
      <div className="mb-8 flex flex-col gap-5 border-b border-[#1c1a19]/10 pb-6 md:mb-10 md:flex-row md:items-end md:justify-between md:pb-7">
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

      <p className="mb-6 text-[10px] uppercase tracking-[0.22em] text-[#1c1a19]/40">
        {t("results", { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <p className="py-24 text-center text-sm text-[#1c1a19]/50">
          {t("empty")}
        </p>
      ) : (
        <StaggerGrid
          key={`${category}-${sort}`}
          className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:grid-cols-4"
        >
          {filtered.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </StaggerGrid>
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
        active
          ? "text-[#1c1a19]"
          : "text-[#1c1a19]/45 hover:text-[#1c1a19]",
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
