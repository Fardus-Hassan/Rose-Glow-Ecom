"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { localize, type Product } from "@/data/products";
import { FadePanel } from "@/components/ui/FadePanel";
import { RichText } from "@/components/ui/RichText";
import { cn } from "@/lib/format";

type Tab = "description" | "specifications" | "shipping";

export function ProductDetails({ product }: { product: Product }) {
  const t = useTranslations("Product");
  const tc = useTranslations("Categories");
  const locale = useLocale();
  const [tab, setTab] = useState<Tab>("description");

  const specs = [
    [t("material"), localize(product.material, locale)],
    [t("color"), product.colors.map((c) => localize(c, locale)).join(" · ")],
    [t("sku"), product.sku],
    [t("category"), tc(product.category)],
  ] as const;

  return (
    <section className="container-rg">
      <div className="-mx-5 overflow-x-auto border-b border-[#1c1a19]/10 px-5 [-ms-overflow-style:none] [scrollbar-width:none] sm:-mx-6 sm:px-6 md:mx-0 md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max gap-6 md:min-w-0 md:gap-8">
          {(
            [
              ["description", t("description")],
              ["specifications", t("specifications")],
              ["shipping", t("shipping")],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "relative shrink-0 pb-3 text-[11px] uppercase tracking-[0.18em] transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                tab === key
                  ? "text-[#1c1a19]"
                  : "text-[#1c1a19]/40 hover:text-[#1c1a19]",
              )}
            >
              {label}
              <span
                className={cn(
                  "absolute inset-x-0 -bottom-px h-px bg-[#c9a08a] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                  tab === key ? "scale-x-100" : "scale-x-0",
                )}
              />
            </button>
          ))}
          <span className="w-2 shrink-0 md:hidden" aria-hidden />
        </div>
      </div>

      <div className="py-8 md:py-10">
        <FadePanel activeKey={tab}>
          {tab === "description" ? (
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <h3 className="font-display text-2xl text-[#1c1a19] md:text-3xl">
                  {t("descriptionTitle")}
                </h3>
                <RichText
                  html={localize(product.description, locale)}
                  className="mt-4 text-sm leading-7 text-[#1c1a19]/58 md:text-[15px] md:leading-8"
                />
                <ul className="mt-6 space-y-3 text-sm text-[#1c1a19]/65">
                  <li className="flex gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 bg-[#c9a08a]" />
                    {localize(product.material, locale)}
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 bg-[#c9a08a]" />
                    {product.colors.map((c) => localize(c, locale)).join(" · ")}
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 bg-[#c9a08a]" />
                    {t("trustShipping")} · {t("trustReturn")}
                  </li>
                </ul>
              </div>

              <div className="border border-[#1c1a19]/10 bg-[#e7e0d6] p-5 md:p-7">
                <h4 className="text-[10px] uppercase tracking-[0.22em] text-[#c9a08a]">
                  {t("specifications")}
                </h4>
                <dl className="mt-4">
                  {specs.map(([label, value]) => (
                    <div
                      key={label}
                      className="grid grid-cols-[1fr_1.2fr] gap-4 border-b border-[#1c1a19]/08 py-3.5 last:border-b-0"
                    >
                      <dt className="text-[11px] uppercase tracking-[0.14em] text-[#1c1a19]/40">
                        {label}
                      </dt>
                      <dd className="text-sm text-[#1c1a19]">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          ) : null}

          {tab === "specifications" ? (
            <dl className="mx-auto max-w-2xl">
              {specs.map(([label, value]) => (
                <div
                  key={label}
                  className="grid grid-cols-[1fr_1.4fr] gap-4 border-b border-[#1c1a19]/08 py-4"
                >
                  <dt className="text-[11px] uppercase tracking-[0.14em] text-[#1c1a19]/40">
                    {label}
                  </dt>
                  <dd className="text-sm text-[#1c1a19]">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {tab === "shipping" ? (
            <p className="max-w-2xl text-sm leading-7 text-[#1c1a19]/58 md:text-[15px]">
              {t("shippingCopy")}
            </p>
          ) : null}
        </FadePanel>
      </div>
    </section>
  );
}
