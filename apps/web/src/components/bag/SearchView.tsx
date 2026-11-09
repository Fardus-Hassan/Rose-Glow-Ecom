"use client";

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { products } from "@/data/products";
import { ProductCard } from "@/components/products/ProductCard";
import { StaggerGrid } from "@/components/motion/StaggerGrid";
import { Pagination, SHOP_PAGE_SIZE } from "@/components/ui/Pagination";

export function SearchView({ initialQuery = "" }: { initialQuery?: string }) {
  const t = useTranslations("Search");
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const deferred = useDeferredValue(query.trim().toLowerCase());

  const results = useMemo(() => {
    if (!deferred) return [];
    return products.filter((product) => {
      const haystack = [
        product.name.en,
        product.name.bn,
        product.description.en,
        product.description.bn,
        product.category,
        product.sku,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(deferred);
    });
  }, [deferred]);

  const totalPages = Math.max(1, Math.ceil(results.length / SHOP_PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [deferred]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const paged = useMemo(() => {
    const start = (page - 1) * SHOP_PAGE_SIZE;
    return results.slice(start, start + SHOP_PAGE_SIZE);
  }, [results, page]);

  const goToPage = (next: number) => {
    setPage(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div>
      <form
        className="relative"
        onSubmit={(event) => {
          event.preventDefault();
          const next = query.trim();
          router.replace(next ? `/search?q=${encodeURIComponent(next)}` : "/search");
        }}
      >
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("placeholder")}
          className="min-h-14 w-full border-b border-[#1c1a19]/15 bg-transparent pr-24 text-lg text-[#1c1a19] outline-none placeholder:text-[#1c1a19]/35 focus:border-[#c9a08a] md:min-h-16 md:text-xl"
          autoFocus
        />
        <button
          type="submit"
          className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-[0.2em] text-[#1c1a19]/55 transition hover:text-[#1c1a19]"
        >
          {t("submit")}
        </button>
      </form>

      <div className="mt-10 md:mt-12">
        {!deferred ? (
          <p className="text-sm text-[#1c1a19]/45">{t("hint")}</p>
        ) : results.length === 0 ? (
          <p className="text-sm text-[#1c1a19]/55">{t("empty")}</p>
        ) : (
          <>
            <p className="mb-6 text-[11px] uppercase tracking-[0.2em] text-[#1c1a19]/45">
              {t("results", { count: results.length })}
            </p>
            <StaggerGrid
              key={`${deferred}-${page}`}
              className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:grid-cols-4"
            >
              {paged.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </StaggerGrid>
            <Pagination page={page} totalPages={totalPages} onChange={goToPage} />
          </>
        )}
      </div>
    </div>
  );
}
