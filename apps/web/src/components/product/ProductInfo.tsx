"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { localize, type Product } from "@/data/products";
import { formatBdt, cn } from "@/lib/format";
import { IconHeart, IconShield, IconStar, IconTruck } from "@/components/icons";
import { useRouter } from "@/i18n/navigation";
import { useBag } from "@/store/bag";

export function ProductInfo({ product }: { product: Product }) {
  const t = useTranslations("Product");
  const tc = useTranslations("Categories");
  const locale = useLocale();
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted } = useBag();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const wishlisted = isWishlisted(product.slug);

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : 0;

  const handleAdd = () => {
    if (!product.inStock) return;
    addToCart(product.slug, qty);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = () => {
    if (!product.inStock) return;
    addToCart(product.slug, qty);
    router.push("/checkout");
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: localize(product.name, locale),
          url,
        });
        return;
      }
    } catch {
      /* user cancelled */
    }
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-col lg:pt-1">
      <p className="text-[10px] uppercase tracking-[0.24em] text-[#c9a08a]">
        {tc(product.category)}
      </p>
      <h1 className="mt-3 font-display text-[clamp(1.9rem,4vw,2.85rem)] leading-[1.1] tracking-[-0.02em] text-[#1c1a19]">
        {localize(product.name, locale)}
      </h1>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="text-2xl text-[#1c1a19] md:text-[1.75rem]">
          {formatBdt(product.price, locale)}
        </span>
        {product.compareAtPrice ? (
          <span className="text-sm text-[#1c1a19]/40 line-through">
            {formatBdt(product.compareAtPrice, locale)}
          </span>
        ) : null}
        {discount > 0 ? (
          <span className="border border-[#c9a08a]/55 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#a67c68]">
            {t("off", { percent: discount })}
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        <div className="flex items-center gap-1 text-[#c9a08a]">
          {Array.from({ length: 5 }).map((_, i) => (
            <IconStar
              key={i}
              className={`h-3.5 w-3.5 ${i < Math.round(product.rating) ? "opacity-100" : "opacity-25"}`}
            />
          ))}
        </div>
        <span className="text-xs text-[#1c1a19]/50">
          {t("rating", {
            rating: product.rating.toFixed(1),
            count: product.reviewCount,
          })}
        </span>
        <span className="text-[#1c1a19]/25">·</span>
        <span className="text-xs text-[#1c1a19]/50">
          {t("purchased", { count: product.soldCount })}
        </span>
      </div>

      <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#1c1a19]/58 md:text-base md:leading-8">
        {localize(product.description, locale)}
      </p>

      <div className="mt-7 grid grid-cols-3 gap-2 border-y border-[#1c1a19]/10 py-4 sm:gap-3 sm:py-5">
        {(
          [
            [IconShield, t("trustMaterial")],
            [IconTruck, t("trustShipping")],
            [IconHeart, t("trustReturn")],
          ] as const
        ).map(([Icon, label]) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 text-center sm:flex-row sm:items-center sm:gap-3 sm:text-left"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center border border-[#c9a08a]/35 text-[#a67c68] sm:h-9 sm:w-9">
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
            <p className="text-[10px] leading-snug text-[#1c1a19]/65 sm:text-[11px]">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#1c1a19]/45">
          {t("quantity")}
        </p>
        <div className="inline-flex items-center border border-[#1c1a19]/15">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center text-lg text-[#1c1a19]/70 transition hover:bg-[#1c1a19]/05"
            onClick={() => setQty((v) => Math.max(1, v - 1))}
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="min-w-10 text-center text-sm">{qty}</span>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center text-lg text-[#1c1a19]/70 transition hover:bg-[#1c1a19]/05"
            onClick={() => setQty((v) => v + 1)}
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        <p
          className={cn(
            "text-[11px] uppercase tracking-[0.16em]",
            product.inStock ? "text-[#1c1a19]/45" : "text-red-700/70",
          )}
        >
          {product.inStock ? t("inStock") : t("outOfStock")}
        </p>
      </div>

      <div className="mt-6 hidden gap-3 sm:flex">
        <button
          type="button"
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 bg-[#1c1a19] px-6 text-[11px] uppercase tracking-[0.2em] text-[#f4efe8] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!product.inStock}
          onClick={handleAdd}
        >
          {added ? "✓" : t("addToCart")}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!product.inStock}
          className="inline-flex min-h-12 flex-1 items-center justify-center border border-[#1c1a19]/25 px-6 text-[11px] uppercase tracking-[0.2em] text-[#1c1a19] transition hover:border-[#1c1a19] hover:bg-[#1c1a19] hover:text-[#f4efe8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {t("buyNow")}
        </button>
      </div>

      <div className="mt-4 hidden gap-6 text-[11px] uppercase tracking-[0.18em] text-[#1c1a19]/45 sm:flex">
        <button
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          className={cn(
            "inline-flex items-center gap-2 transition hover:text-[#1c1a19]",
            wishlisted && "text-[#a67c68]",
          )}
        >
          <IconHeart className="h-4 w-4" />
          {t("wishlist")}
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="transition hover:text-[#1c1a19]"
        >
          {t("share")}
        </button>
      </div>

      {/* Mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1c1a19]/10 bg-[#f0ebe4]/95 p-3 backdrop-blur-md md:hidden">
        <div className="container-rg flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleWishlist(product.slug)}
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center border border-[#1c1a19]/15 text-[#1c1a19]",
              wishlisted && "border-[#c9a08a] text-[#a67c68]",
            )}
            aria-label={t("wishlist")}
          >
            <IconHeart className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="inline-flex h-12 flex-1 items-center justify-center bg-[#1c1a19] text-[11px] uppercase tracking-[0.18em] text-[#f4efe8] disabled:opacity-40"
            disabled={!product.inStock}
          >
            {added ? "✓" : t("addToCart")}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!product.inStock}
            className="inline-flex h-12 flex-1 items-center justify-center border border-[#1c1a19]/25 text-[11px] uppercase tracking-[0.18em] text-[#1c1a19] disabled:opacity-40"
          >
            {t("buyNow")}
          </button>
        </div>
      </div>
    </div>
  );
}
