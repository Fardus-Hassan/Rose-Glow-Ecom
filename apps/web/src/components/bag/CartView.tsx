"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { getCoverMedia, localize, type Product } from "@/data/products";
import { formatBdt } from "@/lib/format";
import { CartPageSkeleton } from "@/components/skeletons/StorefrontSkeletons";
import { useBag } from "@/store/bag";
import { useCatalog } from "@/store/catalog";

export function CartView() {
  const t = useTranslations("Cart");
  const locale = useLocale();
  const { cart, setCartQty, removeFromCart } = useBag();
  const { ready, getBySlug } = useCatalog();

  if (!ready) return <CartPageSkeleton />;

  const lines = cart
    .map((line) => {
      const product = getBySlug(line.slug);
      if (!product) return null;
      return { line, product };
    })
    .filter(Boolean) as Array<{
    line: { slug: string; qty: number };
    product: Product;
  }>;

  const subtotal = lines.reduce(
    (sum, item) => sum + item.product.price * item.line.qty,
    0,
  );

  if (lines.length === 0) {
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
          {t("continueShopping")}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:gap-14">
      <ul className="divide-y divide-[#1c1a19]/10 border-y border-[#1c1a19]/10">
        {lines.map(({ line, product }) => {
          const cover = getCoverMedia(product);
          return (
            <li key={line.slug} className="flex gap-4 py-5 md:gap-6 md:py-6">
              <Link
                href={`/product/${product.slug}`}
                className="relative h-28 w-24 shrink-0 overflow-hidden bg-[#e2dacf] md:h-36 md:w-28"
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
                      className="font-display text-xl text-[#1c1a19] transition hover:text-[#a67c68] md:text-2xl"
                    >
                      {localize(product.name, locale)}
                    </Link>
                    <p className="mt-1 text-sm text-[#1c1a19]/55">
                      {formatBdt(product.price, locale)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFromCart(line.slug)}
                    className="text-[10px] uppercase tracking-[0.18em] text-[#1c1a19]/40 transition hover:text-[#1c1a19]"
                  >
                    {t("remove")}
                  </button>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div className="inline-flex items-center border border-[#1c1a19]/15">
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center text-[#1c1a19]/70 transition hover:bg-[#1c1a19]/05"
                      onClick={() => setCartQty(line.slug, line.qty - 1)}
                      aria-label={t("decrease")}
                    >
                      −
                    </button>
                    <span className="min-w-8 text-center text-sm">{line.qty}</span>
                    <button
                      type="button"
                      className="flex h-10 w-10 items-center justify-center text-[#1c1a19]/70 transition hover:bg-[#1c1a19]/05"
                      onClick={() => setCartQty(line.slug, line.qty + 1)}
                      aria-label={t("increase")}
                    >
                      +
                    </button>
                  </div>
                  <p className="text-sm text-[#1c1a19]">
                    {formatBdt(product.price * line.qty, locale)}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="border border-[#1c1a19]/10 bg-[#e7e0d6]/45 p-6 md:p-7">
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#c9a08a]">
            {t("summary")}
          </p>
          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-[#1c1a19]/55">{t("subtotal")}</span>
            <span className="text-[#1c1a19]">{formatBdt(subtotal, locale)}</span>
          </div>
          <p className="mt-3 text-xs leading-6 text-[#1c1a19]/45">{t("codNote")}</p>
          <Link
            href="/checkout"
            className="mt-6 flex min-h-12 w-full items-center justify-center bg-[#1c1a19] text-[11px] uppercase tracking-[0.2em] text-[#f4efe8] transition hover:bg-black"
          >
            {t("checkout")}
          </Link>
          <Link
            href="/products"
            className="mt-3 flex min-h-11 w-full items-center justify-center text-[11px] uppercase tracking-[0.18em] text-[#1c1a19]/55 transition hover:text-[#1c1a19]"
          >
            {t("continueShopping")}
          </Link>
        </div>
      </aside>
    </div>
  );
}
