"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getCoverMedia, localize, type Product } from "@/data/products";
import { formatBdt } from "@/lib/format";
import { IconStar } from "@/components/icons";
import { SmartImage } from "@/components/media/SmartImage";

export function ProductCard({
  product,
  priority = false,
  onSelect,
}: {
  product: Product;
  priority?: boolean;
  /** When set, card opens this handler instead of navigating to PDP. */
  onSelect?: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("Products");
  const tc = useTranslations("Categories");
  const cover = getCoverMedia(product);
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : 0;
  const filledStars = Math.round(product.rating);
  const coverSrc =
    cover?.type === "video" ? cover.poster || cover.src : cover?.src;

  const body = (
    <>
      <div className="relative aspect-[3/4] overflow-hidden bg-[color:var(--rg-soft)]">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(243,238,232,0.12),transparent_70%)]"
          aria-hidden
        />
        {coverSrc ? (
          <div className="absolute inset-0 overflow-hidden">
            <SmartImage
              src={coverSrc}
              alt={
                cover?.alt
                  ? localize(cover.alt, locale)
                  : localize(product.name, locale)
              }
              fill
              variant="card"
              variants={cover?.variants}
              blurDataURL={cover?.blurDataUrl}
              sizesPreset="card"
              priority={priority}
              className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.04]"
            />
          </div>
        ) : null}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[color:var(--rg-paper)]/70 to-transparent" />

        {discount > 0 ? (
          <span className="absolute left-0 top-5 bg-[color:var(--rg-accent)] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-[color:var(--rg-cta-ink)]">
            −{discount}%
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col pt-5 text-left">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[color:var(--rg-accent)]">
          {tc(product.category)}
        </p>
        <h3 className="mt-2 font-display text-[clamp(1.15rem,2.2vw,1.45rem)] leading-[1.15] tracking-[-0.02em] text-[color:var(--rg-pearl)] transition group-hover:text-[color:var(--rg-accent)]">
          {localize(product.name, locale)}
        </h3>
        <div className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-display text-lg leading-none text-[#f3d78a]">
            {(product.options?.length || 0) > 1
              ? t("priceFrom", { price: formatBdt(product.price, locale) })
              : formatBdt(product.price, locale)}
          </span>
          {product.compareAtPrice && !(product.options?.length || 0) ? (
            <span className="relative inline-block font-display text-base leading-none text-white/80">
              {formatBdt(product.compareAtPrice, locale)}
              <span className="absolute inset-x-0 top-[58%] h-px bg-white/75" />
            </span>
          ) : null}
        </div>

        {product.rating > 0 ? (
          <div className="mt-3 flex items-center gap-1 text-[color:var(--rg-accent)]">
            {Array.from({ length: 5 }).map((_, i) => (
              <IconStar
                key={i}
                className={`h-2.5 w-2.5 ${i < filledStars ? "opacity-100" : "opacity-25"}`}
              />
            ))}
            <span className="ml-1 text-[10px] text-[color:var(--rg-muted)]">
              {product.rating.toFixed(1)}
            </span>
          </div>
        ) : null}
      </div>
    </>
  );

  return (
    <article className="group flex flex-col">
      {onSelect ? (
        <button type="button" onClick={onSelect} className="block w-full text-left">
          {body}
        </button>
      ) : (
        <Link href={`/product/${product.slug}`} className="block">
          {body}
        </Link>
      )}
    </article>
  );
}
