"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { chosenOffer, getCoverMedia, localize } from "@/data/products";
import { formatBdt, cn } from "@/lib/format";
import { useBag } from "@/store/bag";
import { useCartLines } from "@/hooks/useCartLines";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({ open, onClose }: Props) {
  const t = useTranslations("Cart");
  const tn = useTranslations("Nav");
  const locale = useLocale();
  const { setCartQty, removeFromCart } = useBag();
  const { lines, pending } = useCartLines();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
  }, [open]);

  const subtotal = lines.reduce(
    (sum, item) =>
      sum + chosenOffer(item.product, item.line.optionId).price * item.line.qty,
    0,
  );

  if (!mounted) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[80]",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <button
        type="button"
        className={cn(
          "absolute inset-0 bg-black/55 transition-opacity duration-500",
          open ? "opacity-100" : "opacity-0",
        )}
        aria-label={tn("close")}
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />

      <aside
        role="dialog"
        aria-modal={open}
        aria-label={t("title")}
        inert={open ? undefined : true}
        className={cn(
          "fixed inset-y-0 right-0 flex h-dvh w-full max-w-[26rem] flex-col border-l border-white/10 bg-[#0c0a0b] text-[#f3eee8] shadow-[-24px_0_80px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#d4a574]">
              {t("eyebrow")}
            </p>
            <h2 className="font-display mt-1 text-2xl tracking-[-0.02em]">
              {t("title")}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center text-[#f3eee8]/70 transition hover:text-[#f3eee8]"
            aria-label={tn("close")}
          >
            <span className="relative block h-3.5 w-3.5" aria-hidden>
              <span className="absolute left-1/2 top-1/2 block h-px w-full -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
              <span className="absolute left-1/2 top-1/2 block h-px w-full -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-current" />
            </span>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          {pending ? (
            <p className="py-10 text-sm text-[#f3eee8]/55">{t("loading")}</p>
          ) : lines.length === 0 ? (
            <div className="py-12">
              <p className="font-display text-2xl">{t("emptyTitle")}</p>
              <p className="mt-3 text-sm leading-6 text-[#f3eee8]/55">
                {t("emptySub")}
              </p>
              <Link
                href="/products"
                onClick={onClose}
                className="rg-cta-solid mt-6 min-h-11 px-6"
              >
                {t("continueShopping")}
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-white/10">
              {lines.map(({ line, product }) => {
                const offer = chosenOffer(product, line.optionId);
                const cover = offer.image
                  ? { src: offer.image }
                  : getCoverMedia(product);
                return (
                  <li
                    key={`${line.slug}:${line.optionId || ""}`}
                    className="flex gap-3 py-4"
                  >
                    <Link
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="relative h-20 w-16 shrink-0 overflow-hidden bg-[#1a1518]"
                    >
                      {cover ? (
                        <Image
                          src={cover.src}
                          alt={localize(product.name, locale)}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : null}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${product.slug}`}
                          onClick={onClose}
                          className="font-display text-lg leading-tight text-[#f3eee8] transition hover:text-[#d4a574]"
                        >
                          {localize(offer.label, locale)}
                        </Link>
                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(line.slug, line.optionId)
                          }
                          className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-[#f3eee8]/40 transition hover:text-[#f3eee8]"
                        >
                          {t("remove")}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-[#f3eee8]/55">
                        {formatBdt(offer.price, locale)}
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <div className="inline-flex items-center border border-white/15">
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center text-[#f3eee8]/70"
                            onClick={() =>
                              setCartQty(line.slug, line.qty - 1, line.optionId)
                            }
                            aria-label={t("decrease")}
                          >
                            −
                          </button>
                          <span className="min-w-6 text-center text-sm">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center text-[#f3eee8]/70"
                            onClick={() =>
                              setCartQty(line.slug, line.qty + 1, line.optionId)
                            }
                            aria-label={t("increase")}
                          >
                            +
                          </button>
                        </div>
                        <p className="text-sm">
                          {formatBdt(offer.price * line.qty, locale)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {lines.length > 0 ? (
          <div className="border-t border-white/10 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#f3eee8]/55">{t("subtotal")}</span>
              <span>{formatBdt(subtotal, locale)}</span>
            </div>
            <p className="mt-2 text-[11px] leading-5 text-[#f3eee8]/40">
              {t("codNote")}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                href="/cart"
                onClick={onClose}
                className="rg-cta min-h-11 w-full px-2 text-[10px] tracking-[0.08em]"
              >
                {t("viewCart")}
              </Link>
              <Link
                href="/checkout"
                onClick={onClose}
                className="rg-cta-solid min-h-11 w-full px-2 text-[10px] tracking-[0.08em]"
              >
                {t("checkout")}
              </Link>
            </div>
          </div>
        ) : null}
      </aside>
    </div>,
    document.body,
  );
}
