"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { chosenOffer, getCoverMedia, localize } from "@/data/products";
import { formatBdt } from "@/lib/format";
import { CartPageSkeleton } from "@/components/skeletons/StorefrontSkeletons";
import { useBag } from "@/store/bag";
import { useCartLines } from "@/hooks/useCartLines";

export function CartView() {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const { setCartQty, removeFromCart } = useBag();
  const { lines, pending } = useCartLines();

  if (pending) return <CartPageSkeleton />;

  const subtotal = lines.reduce(
    (sum, item) => sum + chosenOffer(item.product, item.line.optionId).price * item.line.qty,
    0,
  );

  if (lines.length === 0) {
    return (
      <div className="py-16 text-center md:py-24">
        <p className="rg-section-title text-3xl md:text-4xl">
          {t("emptyTitle")}
        </p>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#f3eee8]/55">
          {t("emptySub")}
        </p>
        <Link href="/products" className="rg-cta-solid mt-8 min-h-12 px-8">
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:gap-14">
      <ul className="divide-y divide-[#f3eee8]/10 border-y border-[#f3eee8]/10">
        {lines.map(({ line, product }) => {
          const offer = chosenOffer(product, line.optionId);
          const cover = offer.image
            ? { src: offer.image }
            : getCoverMedia(product);
          return (
            <li key={`${line.slug}:${line.optionId || ""}`} className="flex gap-4 py-5 md:gap-6 md:py-6">
              <Link
                href={`/product/${product.slug}`}
                className="relative h-28 w-24 shrink-0 overflow-hidden bg-[#1a1518] md:h-36 md:w-28"
              >
                {cover ? (
                  <Image
                    src={cover.src}
                    alt={localize(product.name, locale)}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                ) : null}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/product/${product.slug}`}
                      className="font-display text-xl text-[#f3eee8] transition hover:text-[#d4a574] md:text-2xl"
                    >
                      {localize(offer.label, locale)}
                    </Link>
                    <p className="mt-1 text-sm text-[#f3eee8]/55">
                      {formatBdt(offer.price, locale)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(line.slug, line.optionId)}
                    className="text-[10px] uppercase tracking-[0.18em] text-[#f3eee8]/40 transition hover:text-[#f3eee8]"
                  >
                    {t("remove")}
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="inline-flex items-center border border-[#f3eee8]/15">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center text-[#f3eee8]/70 transition hover:bg-[#f3eee8]/05"
                      onClick={() => setCartQty(line.slug, line.qty - 1, line.optionId)}
                      aria-label={t("decrease")}
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm">{line.qty}</span>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center text-[#f3eee8]/70 transition hover:bg-[#f3eee8]/05"
                      onClick={() => setCartQty(line.slug, line.qty + 1, line.optionId)}
                      aria-label={t("increase")}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-[#f3eee8]">
                    {formatBdt(offer.price * line.qty, locale)}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-[#f3eee8]/10 bg-[#1a1518]/45 p-6 md:p-7">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#d4a574]">
            {t("summary")}
          </p>
          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-[#f3eee8]/55">{t("subtotal")}</span>
            <span className="text-[#f3eee8]">{formatBdt(subtotal, locale)}</span>
          </div>
          <p className="mt-3 text-xs leading-6 text-[#f3eee8]/45">{t("codNote")}</p>
          <div className="mt-6 flex flex-row gap-2">
            <Link
              href="/checkout"
              className="rg-cta-solid min-h-11 flex-1 px-3 sm:min-h-12"
            >
              {t("checkout")}
            </Link>
            <Link
              href="/products"
              className="rg-cta min-h-11 flex-1 px-3 sm:min-h-12"
            >
              {t("continueShopping")}
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
