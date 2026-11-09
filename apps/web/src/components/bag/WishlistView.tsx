"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getCoverMedia, getProductBySlug, localize } from "@/data/products";
import { formatBdt } from "@/lib/format";
import { useBag } from "@/store/bag";

export function WishlistView() {
  const t = useTranslations("Wishlist");
  const locale = useLocale();
  const { wishlist, toggleWishlist, addToCart } = useBag();

  const items = wishlist
    .map((slug) => getProductBySlug(slug))
    .filter(Boolean) as NonNullable<ReturnType<typeof getProductBySlug>>[];

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
    <ul className="divide-y divide-[#1c1a19]/10 border-y border-[#1c1a19]/10">
      {items.map((product) => {
        const cover = getCoverMedia(product);
        return (
          <li
            key={product.slug}
            className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:gap-6 sm:py-6"
          >
            <Link
              href={`/product/${product.slug}`}
              className="relative h-36 w-full shrink-0 overflow-hidden bg-[#e2dacf] sm:h-32 sm:w-28"
            >
              {cover ? (
                <Image
                  src={cover.src}
                  alt={localize(product.name, locale)}
                  fill
                  sizes="(max-width: 640px) 100vw, 112px"
                  className="object-cover"
                />
              ) : null}
            </Link>

            <div className="min-w-0 flex-1">
              <Link
                href={`/product/${product.slug}`}
                className="font-display text-2xl text-[#1c1a19] transition hover:text-[#a67c68]"
              >
                {localize(product.name, locale)}
              </Link>
              <p className="mt-1 text-sm text-[#1c1a19]/55">
                {formatBdt(product.price, locale)}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!product.inStock}
                onClick={() => {
                  addToCart(product.slug, 1);
                  toggleWishlist(product.slug);
                }}
                className="inline-flex min-h-11 items-center justify-center bg-[#1c1a19] px-5 text-[11px] uppercase tracking-[0.18em] text-[#f4efe8] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
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
        );
      })}
    </ul>
  );
}
