"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { localize, type Product } from "@/data/products";
import { Reveal } from "@/components/motion/Reveal";
import { RichText } from "@/components/ui/RichText";
import { fetchShippingSettings } from "@/lib/catalog";

/**
 * One editorial details band — description + specs + shipping, no tab chrome.
 */
export function ProductDetails({ product }: { product: Product }) {
  const t = useTranslations("Product");
  const tc = useTranslations("Categories");
  const locale = useLocale();
  const [shippingCopy, setShippingCopy] = useState(t("shippingCopy"));

  useEffect(() => {
    let cancelled = false;
    void fetchShippingSettings()
      .then((settings) => {
        if (cancelled) return;
        const copy =
          locale === "bn"
            ? settings.shippingReturnBn || settings.shippingReturnEn
            : settings.shippingReturnEn || settings.shippingReturnBn;
        if (copy.trim()) setShippingCopy(copy);
      })
      .catch(() => {
        /* keep i18n fallback */
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const specs = [
    [t("material"), localize(product.material, locale)],
    [t("color"), product.colors.map((c) => localize(c, locale)).join(" · ")],
    [t("category"), tc(product.category)],
  ] as const;

  return (
    <section className="border-y border-[color:var(--rg-line)] bg-[color:var(--rg-paper-deep)] py-12 md:py-16">
      <div className="container-rg">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16 xl:gap-20">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--rg-accent)]">
                {t("description")}
              </p>
              <h2 className="mt-2.5 font-display text-[clamp(1.75rem,3.2vw,2.5rem)] leading-[1.08] tracking-[-0.02em] text-[color:var(--rg-pearl)]">
                {t("descriptionTitle")}
              </h2>
              <div className="rg-home-gold-rule mt-4 w-12" />
              <RichText
                html={localize(product.description, locale)}
                className="mt-6 text-[15px] leading-7 text-white md:leading-8"
              />
            </div>

            <div className="flex flex-col gap-8 lg:pt-1">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--rg-accent)]">
                  {t("specifications")}
                </p>
                <dl className="mt-4">
                  {specs.map(([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)] gap-4 border-b border-[color:var(--rg-line)] py-3.5 last:border-b-0"
                    >
                      <dt className="text-[10px] uppercase tracking-[0.16em] text-[color:var(--rg-muted)]">
                        {label}
                      </dt>
                      <dd className="text-sm text-[color:var(--rg-pearl)]">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="border-t border-[color:var(--rg-line)] pt-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--rg-accent)]">
                  {t("shipping")}
                </p>
                <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white">
                  {shippingCopy}
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
