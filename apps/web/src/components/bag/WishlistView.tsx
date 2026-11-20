"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { Product } from "@/data/products";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductGridSkeleton } from "@/components/skeletons/StorefrontSkeletons";
import { Skeleton } from "@/components/ui/Skeleton";
import { useBag } from "@/store/bag";
import { useCatalog } from "@/store/catalog";

export function WishlistView() {
  const t = useTranslations("Wishlist");
  const { wishlist, toggleWishlist, addToCart } = useBag();
  const { ready, getBySlug } = useCatalog();

  if (!ready) {
    return (
      <div>
        <Skeleton className="mb-8 h-9 w-40" />
        <ProductGridSkeleton count={4} />
      </div>
    );
  }

  const items = wishlist
    .map((slug) => getBySlug(slug))
    .filter(Boolean) as Product[];

  if (items.length === 0) {
    return (
      <div className="py-16 text-center md:py-24">
        <p className="font-display text-3xl text-[#1c1a19] md:text-4xl">
          {t("emptyTitle")}
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#1c1a19]/55">
          {t("emptySub")}
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex min-h-12 items-center justify-center bg-[#1c1a19] px-8 text-[11px] uppercase tracking-[0.2em] text-[#f4efe8] transition hover:bg-black"
        >
          {t("browse")}
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 md:gap-x-6 md:gap-y-12 lg:grid-cols-4">
      {items.map((product) => (
        <li key={product.slug} className="flex flex-col">
          <ProductCard product={product} />
          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              disabled={!product.inStock}
              onClick={() => {
                addToCart(product.slug, 1);
                toggleWishlist(product.slug);
              }}
              className="inline-flex min-h-10 items-center justify-center bg-[#1c1a19] px-3 text-[10px] uppercase tracking-[0.16em] text-[#f4efe8] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("moveToCart")}
            </button>
            <button
              type="button"
              onClick={() => toggleWishlist(product.slug)}
              className="text-[10px] uppercase tracking-[0.18em] text-[#1c1a19]/45 transition hover:text-[#1c1a19]"
            >
              {t("remove")}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
