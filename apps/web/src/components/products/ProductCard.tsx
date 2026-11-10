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
}: {
  product: Product;
  priority?: boolean;
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

  return (
    <article data-stagger-item className="group flex flex-col">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-[#e2dacf]">
          {coverSrc ? (
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
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : null}

          {discount > 0 ? (
            <span className="absolute left-3 top-3 bg-[#0e0d0c]/78 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-[#f4efe8] backdrop-blur-sm">
              −{discount}%
            </span>
          ) : null}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 bg-gradient-to-t from-[#0e0d0c]/70 to-transparent p-3 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="block text-center text-[10px] uppercase tracking-[0.2em] text-[#f4efe8]">
              {t("viewProduct")} →
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col pt-3.5 md:pt-4">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c1a19]/45">
            {tc(product.category)}
          </p>
          <h3 className="mt-1 font-display text-lg leading-snug text-[#1c1a19] md:text-xl">
            {localize(product.name, locale)}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1">
            <div className="flex items-center gap-0.5 text-[#c9a08a]">
              {Array.from({ length: 5 }).map((_, i) => (
                <IconStar
                  key={i}
                  className={`h-3 w-3 ${i < filledStars ? "opacity-100" : "opacity-25"}`}
                />
              ))}
            </div>
            <span className="text-[11px] text-[#1c1a19]/45">
              {product.rating.toFixed(1)}
            </span>
            <span className="text-[11px] text-[#1c1a19]/35">·</span>
            <span className="text-[11px] text-[#1c1a19]/45">
              {t("purchased", { count: product.soldCount })}
            </span>
          </div>

          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-sm text-[#1c1a19]/85">
              {formatBdt(product.price, locale)}
            </span>
            {product.compareAtPrice ? (
              <span className="text-xs text-[#1c1a19]/40 line-through">
                {formatBdt(product.compareAtPrice, locale)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
