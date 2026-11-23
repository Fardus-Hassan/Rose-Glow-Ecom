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
import { IconHeart, IconStar } from "@/components/icons";
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

  const shortHtml =
    product.shortDescription &&
    !isRichTextEmpty(localize(product.shortDescription, locale))
      ? localize(product.shortDescription, locale)
      : null;

  return (
    <div className="flex flex-col">
      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--rg-accent)]">
        {tc(product.category)}
      </p>
      <h1 className="mt-2.5 font-display text-[clamp(1.85rem,3.8vw,2.75rem)] leading-[1.08] tracking-[-0.03em] text-[color:var(--rg-pearl)]">
        {localize(product.name, locale)}
      </h1>
      <div className="rg-home-gold-rule mt-3.5 w-12" />

      <div className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="font-display text-[clamp(1.55rem,2.8vw,2rem)] text-[color:var(--rg-accent)]">
          {formatBdt(offer.price, locale)}
        </span>
        {compare ? (
          <span className="text-sm text-[color:var(--rg-muted)] line-through">
            {formatBdt(compare, locale)}
          </span>
        ) : null}
        {discount > 0 ? (
          <span className="border border-[#d4af37] px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-[#d4af37]">
            {t("off", { percent: discount })}
          </span>
        ) : null}
      </div>

      {product.rating > 0 || product.soldCount > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          {product.rating > 0 ? (
            <>
              <div className="flex items-center gap-1 text-[color:var(--rg-accent)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <IconStar
                    key={i}
                    className={`h-3 w-3 ${i < Math.round(product.rating) ? "opacity-100" : "opacity-25"}`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-[color:var(--rg-muted)]">
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
                <span className="text-[color:var(--rg-muted)]">·</span>
              ) : null}
              <span className="text-[11px] text-[color:var(--rg-muted)]">
                {t("purchased", { count: product.soldCount })}
              </span>
            </>
          ) : null}
        </div>
      ) : null}

      <VariantChoices
        options={product.options || []}
        selectedId={offer.optionId}
        onSelect={choose}
      />

      {shortHtml ? (
        <RichText
          html={shortHtml}
          className="mt-5 max-w-md text-sm leading-7 text-[color:var(--rg-muted)] md:text-[15px]"
        />
      ) : null}

      {/* Purchase block */}
      <div className="mt-6 border border-[color:var(--rg-line)] bg-[color:var(--rg-paper-deep)]/60 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--rg-muted)]">
              {t("quantity")}
            </p>
            <div className="inline-flex items-center border border-[color:var(--rg-line)]">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center text-lg text-[color:var(--rg-pearl)]/70 transition hover:bg-[color:var(--rg-pearl)]/5"
                onClick={() => setQty((v) => Math.max(1, v - 1))}
                aria-label={t("decrease")}
              >
                −
              </button>
              <span className="min-w-9 text-center text-sm">{qty}</span>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center text-lg text-[color:var(--rg-pearl)]/70 transition hover:bg-[color:var(--rg-pearl)]/5"
                onClick={() => setQty((v) => v + 1)}
                aria-label={t("increase")}
              >
                +
              </button>
            </div>
          </div>
          <p
            className={cn(
              "text-[10px] uppercase tracking-[0.16em]",
              canBuy ? "text-[color:var(--rg-accent)]" : "text-red-400/80",
            )}
          >
            {canBuy ? t("inStock") : t("outOfStock")}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rg-cta-solid min-h-11 w-full px-2 text-[10px] leading-tight tracking-[0.06em] disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-[11px] sm:tracking-[0.2em]"
            disabled={!canBuy}
            onClick={handleAdd}
          >
            {added ? "✓" : t("addToCart")}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!canBuy}
            className="rg-cta min-h-11 w-full px-2 text-[10px] leading-tight tracking-[0.06em] disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-[11px] sm:tracking-[0.2em]"
          >
            {t("buyNow")}
          </button>
        </div>
      </div>

      <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-[color:var(--rg-muted)]">
        {t("trustMaterial")}
        <span className="mx-2 text-[color:var(--rg-accent)]/50">·</span>
        {t("trustShipping")}
        <span className="mx-2 text-[color:var(--rg-accent)]/50">·</span>
        {t("trustReturn")}
      </p>

      <ProductContactActions
        className="mt-5"
        productName={localize(product.name, locale)}
      />

      <div className="mt-5 hidden items-center justify-between gap-4 sm:flex">
        <div className="flex gap-5 text-[11px] uppercase tracking-[0.18em] text-[color:var(--rg-muted)]">
          <button
            type="button"
            onClick={() => toggleWishlist(product.slug)}
            className={cn(
              "inline-flex items-center gap-2 transition hover:text-[color:var(--rg-pearl)]",
              wishlisted && "text-[color:var(--rg-accent)]",
            )}
          >
            <IconHeart className="h-3.5 w-3.5" />
            {t("wishlist")}
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="transition hover:text-[color:var(--rg-pearl)]"
          >
            {t("share")}
          </button>
        </div>
        <SocialLinks tone="light" />
      </div>

      <div className="mt-5 flex flex-col border-t border-[color:var(--rg-line)] pt-4 sm:hidden">
        <p className="mb-2 text-[10px] uppercase tracking-[0.2em] text-[color:var(--rg-muted)]">
          {t("follow")}
        </p>
        <SocialLinks tone="light" />
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[color:var(--rg-line)] bg-[color:var(--rg-paper)]/95 p-3 backdrop-blur-md md:hidden">
        <div className="container-rg grid grid-cols-[3rem_minmax(0,1fr)_minmax(0,1fr)] items-center gap-2">
          <button
            type="button"
            onClick={() => toggleWishlist(product.slug)}
            className={cn(
              "flex h-12 w-12 items-center justify-center border border-[color:var(--rg-line)] text-[color:var(--rg-pearl)]",
              wishlisted &&
                "border-[color:var(--rg-accent)] text-[color:var(--rg-accent)]",
            )}
            aria-label={t("wishlist")}
          >
            <IconHeart className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="rg-cta-solid h-12 w-full min-w-0 px-1.5 text-[10px] leading-tight tracking-[0.04em] disabled:opacity-40"
            disabled={!canBuy}
          >
            {added ? "✓" : t("addToCart")}
          </button>
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!canBuy}
            className="rg-cta h-12 w-full min-w-0 px-1.5 text-[10px] leading-tight tracking-[0.04em] disabled:opacity-40"
          >
            {t("buyNow")}
          </button>
        </div>
      </div>
    </div>
  );
}
