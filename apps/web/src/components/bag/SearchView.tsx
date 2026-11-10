"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { ProductCard } from "@/components/products/ProductCard";
import { StaggerGrid } from "@/components/motion/StaggerGrid";
import { ProductGridSkeleton } from "@/components/skeletons/StorefrontSkeletons";
import { Pagination } from "@/components/ui/Pagination";
import { SHOP_PAGE_SIZE } from "@/lib/shop";
import {
  fetchProductsPage,
  type ProductsPage,
} from "@/lib/catalog";

export function SearchView({ initialQuery = "" }: { initialQuery?: string }) {
  const t = useTranslations("Search");
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProductsPage | null>(null);
  const deferred = useDeferredValue(query.trim());

  useEffect(() => {
    setPage(1);
  }, [deferred]);

  useEffect(() => {
    if (!deferred) {
      setResult(null);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        const next = await fetchProductsPage({
          page,
          pageSize: SHOP_PAGE_SIZE,
          q: deferred,
        });
        if (!cancelled) setResult(next);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [deferred, page]);

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
          router.replace(
            next ? `/search?q=${encodeURIComponent(next)}` : "/search",
          );
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
        ) : loading && !result ? (
          <ProductGridSkeleton count={8} />
        ) : !result || result.total === 0 ? (
          <p className="text-sm text-[#1c1a19]/55">{t("empty")}</p>
        ) : (
          <>
            <p className="mb-6 text-[11px] uppercase tracking-[0.2em] text-[#1c1a19]/45">
              {t("results", { count: result.total })}
            </p>
            <StaggerGrid
              key={`${deferred}-${page}`}
              className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 md:gap-x-6 md:gap-y-10 lg:grid-cols-4"
            >
              {result.items.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </StaggerGrid>
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              onChange={goToPage}
            />
          </>
        )}
      </div>
    </div>
  );
}
