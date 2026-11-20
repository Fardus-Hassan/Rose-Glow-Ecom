"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  chosenOffer,
  defaultOptionId,
  localize,
  type Product,
} from "@/data/products";
import { formatBdt, cn } from "@/lib/format";
import { IconGem, IconHeart, IconShield, IconStar, IconTruck } from "@/components/icons";
import { useRouter } from "@/i18n/navigation";
import { useBag } from "@/store/bag";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { RichText } from "@/components/ui/RichText";
import { ProductContactActions } from "@/components/product/ProductContactActions";
import { VariantChoices } from "@/components/product/VariantChoices";
import { trackAddToCart } from "@/lib/meta-pixel";
import { isRichTextEmpty } from "@/lib/rich-text";

export function ProductInfo({
  product,
  optionId: optionIdProp,
  onOptionId,
}: {
  product: Product;
  optionId?: string;
  onOptionId?: (id: string) => void;
}) {
  const t = useTranslations("Product");
  const tc = useTranslations("Categories");
  const locale = useLocale();
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted } = useBag();
  const [qty, setQty] = useState(1);
  const [optionId, setOptionId] = useState(
    optionIdProp || defaultOptionId(product),
  );
  const [added, setAdded] = useState(false);
  const selectedId = optionIdProp || optionId;
  const offer = chosenOffer(product, selectedId);
  const canBuy = offer.inStock;
  const wishlisted = isWishlisted(product.slug);
  const choose = (id: string) => {
    setOptionId(id);
    onOptionId?.(id);
  };

  const compare = offer.compareAtPrice;
  const discount =
    compare && compare > offer.price
      ? Math.round(((compare - offer.price) / compare) * 100)
      : 0;

  const fireAddToCart = () => {
    trackAddToCart({
      contentId: offer.sku || product.sku || product.slug,
      contentName: localize(offer.label, locale),
      value: offer.price * qty,
      quantity: qty,
    });
  };

  const handleAdd = () => {
    if (!canBuy) return;
    addToCart(product.slug, qty, offer.optionId);
    fireAddToCart();
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  const handleBuyNow = () => {
    if (!canBuy) return;
    addToCart(product.slug, qty, offer.optionId);
    fireAddToCart();
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
          {formatBdt(offer.price, locale)}
        </span>
        {compare ? (
          <span className="text-sm text-[#1c1a19]/40 line-through">
            {formatBdt(compare, locale)}
          </span>
        ) : null}
        {discount > 0 ? (
          <span className="border border-[#c9a08a]/55 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#a67c68]">
            {t("off", { percent: discount })}
          </span>
        ) : null}
      </div>
      <VariantChoices
        options={product.options || []}
        selectedId={offer.optionId}
        onSelect={choose}
      />

      {product.rating > 0 || product.soldCount > 0 ? (
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
        {product.rating > 0 ? (
          <>
            <div className="flex items-center gap-1 text-[#c9a08a]">
              {Array.from({ length: 5 }).map((_, i) => (
                <IconStar
                  key={i}
                  className={`h-3.5 w-3.5 ${i < Math.round(product.rating) ? "opacity-100" : "opacity-25"}`}
                />
              ))}
            </div>
            <span className="text-xs text-[#1c1a19]/50">
              {product.reviewCount > 0
                ? t("rating", {
                    rating: product.rating.toFixed(1),
                    count: product.reviewCount,
                  })
                : product.rating.toFixed(1)}
            </span>
          </>
        ) : null}
        {product.soldCount > 0 ? (
          <>
            {product.rating > 0 ? (
              <span className="text-[#1c1a19]/25">·</span>
            ) : null}
            <span className="text-xs text-[#1c1a19]/50">
              {t("purchased", { count: product.soldCount })}
            </span>
          </>
        ) : null}
      </div>
      ) : null}

      <RichText
        html={
          product.shortDescription &&
          !isRichTextEmpty(localize(product.shortDescription, locale))
            ? localize(product.shortDescription, locale)
            : localize(product.description, locale)
        }
        className="mt-5 max-w-xl text-[15px] leading-7 text-[#1c1a19]/58 md:text-base md:leading-8"
      />

      <div className="mt-6 grid grid-cols-3 gap-1.5 bg-[#f6efe8] px-2 py-4 ring-1 ring-[#c9a08a]/55 sm:gap-2 sm:px-3">
        {(
          [
            [IconShield, t("trustMaterial")],
            [IconTruck, t("trustShipping")],
            [IconGem, t("trustReturn")],
          ] as const
        ).map(([Icon, label]) => (
          <div
            key={label}
            className="flex flex-col items-center gap-1.5 text-center sm:gap-2"
          >
            <span className="flex h-8 w-8 items-center justify-center bg-[#c9a08a]/20 text-[#8d5e48] ring-1 ring-[#c9a08a]/55">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <p className="max-w-[6.5rem] text-[9px] font-medium leading-snug text-[#1c1a19]/85 sm:text-[10px]">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#1c1a19]/45">
          {t("quantity")}
        </p>
        <div className="inline-flex items-center border border-[#1c1a19]/15">
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center text-lg text-[#1c1a19]/70 transition hover:bg-[#1c1a19]/05"
            onClick={() => setQty((v) => Math.max(1, v - 1))}
            aria-label={t("decrease")}
          >
            −
          </button>
          <span className="min-w-10 text-center text-sm">{qty}</span>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center text-lg text-[#1c1a19]/70 transition hover:bg-[#1c1a19]/05"
            onClick={() => setQty((v) => v + 1)}
            aria-label={t("increase")}
          >
            +
          </button>
        </div>
        <p
          className={cn(
            "text-[11px] uppercase tracking-[0.16em]",
            canBuy ? "text-[#1c1a19]/45" : "text-red-700/70",
          )}
        >
          {canBuy ? t("inStock") : t("outOfStock")}
        </p>
      </div>

      <div className="mt-6 flex gap-2 sm:gap-3">
        <button
          type="button"
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 bg-[#1c1a19] px-3 text-[10px] uppercase tracking-[0.14em] text-[#f4efe8] transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-40 sm:px-6 sm:text-[11px] sm:tracking-[0.2em]"
          disabled={!canBuy}
          onClick={handleAdd}
        >
          {added ? "✓" : t("addToCart")}
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!canBuy}
          className="rg-beat inline-flex min-h-12 flex-1 items-center justify-center border border-[#c9a08a] bg-[#f6efe8] px-3 text-[10px] uppercase tracking-[0.14em] text-[#1c1a19] transition-colors hover:border-[#1c1a19] hover:bg-[#1c1a19] hover:text-[#f4efe8] disabled:cursor-not-allowed disabled:opacity-40 sm:px-6 sm:text-[11px] sm:tracking-[0.2em]"
        >
          {t("buyNow")}
        </button>
      </div>

      <ProductContactActions
        className="mt-5"
        productName={localize(product.name, locale)}
      />

      <div className="mt-4 hidden flex-col gap-4 sm:flex">
        <div className="flex gap-6 text-[11px] uppercase tracking-[0.18em] text-[#1c1a19]/45">
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
        <div className="flex flex-col items-center text-center">
          <p className="mb-2.5 text-[10px] uppercase tracking-[0.2em] text-[#1c1a19]/4">
            {t("follow")}
          </p>
          <SocialLinks tone="dark" className="justify-center" />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center border-t border-[#1c1a19]/10 pt-5 text-center sm:hidden">
        <p className="mb-2.5 text-[10px] uppercase tracking-[0.2em] text-[#1c1a19]/4">
          {t("follow")}
        </p>
        <SocialLinks tone="dark" className="justify-center" />
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
            disabled={!canBuy}
          >
            {added ? "✓" : t("addToCart")}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!canBuy}
            className="rg-beat inline-flex h-12 flex-1 items-center justify-center border border-[#c9a08a] bg-[#f6efe8] text-[11px] uppercase tracking-[0.18em] text-[#1c1a19] disabled:opacity-40"
          >
            {t("buyNow")}
          </button>
        </div>
      </div>
    </div>
  );
}
