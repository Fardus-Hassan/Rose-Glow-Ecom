"use client";

import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  getCoverMedia,
  getProductBySlug,
  getRelatedProducts,
  localize,
  type Product,
} from "@/data/products";
import { formatBdt, cn } from "@/lib/format";
import { IconHeart, IconShield, IconStar, IconTruck } from "@/components/icons";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductReviews } from "@/components/product/ProductReviews";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingQuickView } from "@/components/landing/LandingQuickView";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { Slider } from "@/components/ui/Slider";
import { siteContact } from "@/data/contact";

const SLUG = "pearl-bloom-earrings";
/** Manual picks for this ad landing; falls back to category matches. */
const RELATED_SLUGS = ["soft-hoop-earrings", "rose-veil-necklace", "petal-ring"];

type FormState = {
  name: string;
  phone: string;
  address: string;
  district: string;
  note: string;
};

type LineMap = Record<string, number>;

const emptyForm: FormState = {
  name: "",
  phone: "",
  address: "",
  district: "",
  note: "",
};

export function PearlBloomLanding() {
  const t = useTranslations("LandingPearl");
  const tp = useTranslations("Product");
  const tc = useTranslations("Categories");
  const locale = useLocale();
  const product = getProductBySlug(SLUG);
  const [lines, setLines] = useState<LineMap>({ [SLUG]: 1 });
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState<Product | null>(null);

  const related = useMemo(() => {
    const manual = RELATED_SLUGS.map(getProductBySlug).filter(
      Boolean,
    ) as Product[];
    if (manual.length > 0) return manual.slice(0, 3);
    return getRelatedProducts(SLUG, 3);
  }, []);

  const orderItems = useMemo(() => {
    return Object.entries(lines)
      .map(([slug, qty]) => {
        const item = getProductBySlug(slug);
        if (!item || qty <= 0) return null;
        return { product: item, qty };
      })
      .filter(Boolean) as Array<{ product: Product; qty: number }>;
  }, [lines]);

  const total = orderItems.reduce(
    (sum, item) => sum + item.product.price * item.qty,
    0,
  );
  const itemCount = orderItems.reduce((sum, item) => sum + item.qty, 0);

  if (!product) return null;

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100,
        )
      : 0;

  const scrollToOrder = () => {
    document
      .getElementById("order")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const setQty = (slug: string, qty: number) => {
    setLines((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[slug];
        // Keep at least one line so the COD form stays usable.
        if (Object.keys(next).length === 0) next[SLUG] = 1;
      } else {
        next[slug] = qty;
      }
      return next;
    });
  };

  const addProduct = (slug: string) => {
    setLines((prev) => ({
      ...prev,
      [slug]: (prev[slug] || 0) + 1,
    }));
    scrollToOrder();
  };

  const removeProduct = (slug: string) => {
    setQty(slug, 0);
  };

  const toggleProduct = (slug: string) => {
    if ((lines[slug] || 0) > 0) {
      removeProduct(slug);
      return;
    }
    addProduct(slug);
  };

  const validate = () => {
    const next: Partial<FormState> = {};
    if (!form.name.trim()) next.name = t("required");
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10) {
      next.phone = t("phoneInvalid");
    }
    if (!form.address.trim()) next.address = t("required");
    if (!form.district.trim()) next.district = t("required");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (orderItems.length === 0) return;
    if (!validate()) return;
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fieldClass =
    "min-h-11 w-full border border-[#1c1a19]/15 bg-transparent px-4 text-sm text-[#1c1a19] outline-none transition placeholder:text-[#1c1a19]/35 focus:border-[#c9a08a]";

  if (submitted) {
    return (
      <div className="min-h-screen bg-[color:var(--rg-paper)]">
        <LandingNav />
        <div className="container-rg flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
            {t("successEyebrow")}
          </p>
          <h1 className="mt-4 font-display text-4xl text-[#1c1a19] md:text-5xl">
            {t("successTitle")}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-[#1c1a19]/55">
            {t("successSub")}
          </p>
          <p className="mt-3 text-sm text-[#1c1a19]/45">
            {t("bagCount", { count: itemCount })} · {formatBdt(total, locale)}
          </p>
          <a
            href={siteContact.phoneTel}
            className="mt-8 inline-flex min-h-12 items-center justify-center bg-[#1c1a19] px-7 text-[11px] uppercase tracking-[0.2em] text-[#f4efe8]"
          >
            {t("callUs")} · {siteContact.phoneDisplay}
          </a>
          <div className="mt-8">
            <SocialLinks tone="dark" className="justify-center" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[color:var(--rg-paper)]">
      <LandingNav />

      {/* Floating bag strip when multi */}
      {itemCount > 0 ? (
        <div className="sticky top-[4.25rem] z-40 border-b border-[#1c1a19]/10 bg-[#e7e0d6]/90 backdrop-blur-md md:top-[4.75rem]">
          <div className="container-rg flex items-center justify-between gap-3 py-2.5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#1c1a19]/65">
              {t("bagCount", { count: itemCount })} · {formatBdt(total, locale)}
            </p>
            <button
              type="button"
              onClick={scrollToOrder}
              className="text-[10px] uppercase tracking-[0.18em] text-[#1c1a19] underline-offset-4 hover:underline"
            >
              {t("viewOrder")} →
            </button>
          </div>
        </div>
      ) : null}

      <div className="container-rg pb-28 pt-6 sm:pt-8 md:pb-24 md:pt-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-12 xl:gap-16">
          <div className="lg:sticky lg:top-36">
            <ProductGallery media={product.media} discount={discount} />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#c9a08a]">
              {tc(product.category)}
            </p>
            <h1 className="mt-3 font-display text-[clamp(1.75rem,6vw,2.85rem)] leading-[1.1] tracking-[-0.02em] text-[#1c1a19]">
              {localize(product.name, locale)}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-2xl text-[#1c1a19]">
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

            <p className="mt-5 text-[15px] leading-7 text-[#1c1a19]/58">
              {localize(product.description, locale)}
            </p>

            <div className="mt-6 grid grid-cols-3 gap-1.5 border-y border-[#1c1a19]/10 py-4 sm:gap-2">
              {(
                [
                  [IconShield, t("trust1")],
                  [IconTruck, t("trust2")],
                  [IconHeart, t("trust3")],
                ] as const
              ).map(([Icon, label]) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1.5 text-center sm:gap-2"
                >
                  <span className="flex h-8 w-8 items-center justify-center border border-[#c9a08a]/35 text-[#a67c68]">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <p className="max-w-[6.5rem] text-[9px] leading-snug text-[#1c1a19]/65 sm:text-[10px]">
                    {label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  if (!lines[SLUG]) setQty(SLUG, 1);
                  scrollToOrder();
                }}
                className="inline-flex min-h-12 w-full items-center justify-center bg-[#1c1a19] px-6 text-[11px] uppercase tracking-[0.2em] text-[#f4efe8] transition hover:bg-black sm:w-auto"
              >
                {t("orderNow")} →
              </button>
            </div>

            <div className="mt-7">
              <p className="mb-2.5 text-[10px] uppercase tracking-[0.2em] text-[#1c1a19]/4">
                {t("follow")}
              </p>
              <SocialLinks tone="dark" />
            </div>
          </div>
        </div>

        {/* Details */}
        <section className="mt-14 border-t border-[#1c1a19]/10 pt-10 md:mt-20 md:pt-14">
          <h2 className="font-display text-3xl text-[#1c1a19] md:text-4xl">
            {tp("descriptionTitle")}
          </h2>
          <div className="mt-4 h-px w-12 bg-gradient-to-r from-[#c9a08a] to-transparent" />
          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="text-sm leading-7 text-[#1c1a19]/58 md:text-[15px] md:leading-8">
                {localize(product.description, locale)}
              </p>
              <ul className="mt-6 space-y-3 text-sm text-[#1c1a19]/65">
                {[t("point1"), t("point2"), t("point3")].map((point) => (
                  <li key={point} className="flex gap-3">
                    <span className="mt-2 h-1 w-1 shrink-0 bg-[#c9a08a]" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-[10px] uppercase tracking-[0.22em] text-[#c9a08a]">
                {tp("specifications")}
              </h3>
              <dl className="mt-4">
                {(
                  [
                    [tp("material"), localize(product.material, locale)],
                    [
                      tp("color"),
                      product.colors.map((c) => localize(c, locale)).join(" · "),
                    ],
                    [tp("sku"), product.sku],
                    [tp("category"), tc(product.category)],
                  ] as const
                ).map(([label, value]) => (
                  <div
                    key={label}
                    className="grid grid-cols-[1fr_1.2fr] gap-4 border-b border-[#1c1a19]/08 py-3.5"
                  >
                    <dt className="text-[11px] uppercase tracking-[0.14em] text-[#1c1a19]/40">
                      {label}
                    </dt>
                    <dd className="text-sm text-[#1c1a19]">{value}</dd>
                  </div>
                ))}
              </dl>
              <h3 className="mt-8 text-[10px] uppercase tracking-[0.22em] text-[#c9a08a]">
                {tp("shipping")}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#1c1a19]/58">
                {tp("shippingCopy")}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-14 md:mt-20">
        <ProductReviews product={product} />
      </div>

      {/* Related */}
      {related.length > 0 ? (
        <section className="container-rg mt-14 md:mt-20">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
            {t("relatedEyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl text-[#1c1a19] md:text-4xl">
            {t("relatedTitle")}
          </h2>
          <div className="mt-4 h-px w-12 bg-gradient-to-r from-[#c9a08a] to-transparent" />
          <p className="mt-3 max-w-xl text-sm text-[#1c1a19]/55">
            {t("relatedSub")}
          </p>

          <div className="mt-8">
            <Slider
              autoPlayMs={0}
              slideClassName="basis-[82%] sm:basis-[48%] lg:basis-[32%]"
              labelPrev={t("sliderPrev")}
              labelNext={t("sliderNext")}
            >
              {related.map((item) => {
                const cover = getCoverMedia(item);
                const inBag = (lines[item.slug] || 0) > 0;
                return (
                  <div
                    key={item.slug}
                    className="flex h-full flex-col border-t border-[#1c1a19]/10 pt-5"
                  >
                    <button
                      type="button"
                      onClick={() => setPreview(item)}
                      className="relative aspect-[4/5] w-full overflow-hidden bg-[#e2dacf] text-left"
                    >
                      {cover ? (
                        <Image
                          src={cover.src}
                          alt={localize(item.name, locale)}
                          fill
                          sizes="(max-width: 768px) 80vw, 33vw"
                          className="object-cover transition duration-500 hover:scale-[1.03]"
                        />
                      ) : null}
                    </button>
                    <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-[#1c1a19]/4">
                      {tc(item.category)}
                    </p>
                    <h3 className="mt-1 font-display text-xl text-[#1c1a19]">
                      {localize(item.name, locale)}
                    </h3>
                    <p className="mt-1 text-sm text-[#1c1a19]/7">
                      {formatBdt(item.price, locale)}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setPreview(item)}
                        className="inline-flex min-h-10 flex-1 items-center justify-center border border-[#1c1a19]/2 px-3 text-[10px] uppercase tracking-[0.16em] text-[#1c1a19] transition hover:border-[#1c1a19]"
                      >
                        {t("viewDetails")}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleProduct(item.slug)}
                        className={cn(
                          "inline-flex min-h-10 flex-1 items-center justify-center px-3 text-[10px] uppercase tracking-[0.16em] transition",
                          inBag
                            ? "border border-[#1c1a19]/25 text-[#1c1a19] hover:border-[#1c1a19]"
                            : "bg-[#1c1a19] text-[#f4efe8] hover:bg-black",
                        )}
                      >
                        {inBag ? t("remove") : t("addToo")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </Slider>
          </div>
        </section>
      ) : null}

      <div className="container-rg pb-28 md:pb-24">
        <div className="mt-12 flex flex-col items-center border-t border-[#1c1a19]/10 pt-10 text-center md:mt-16">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
            {t("follow")}
          </p>
          <div className="mt-4">
            <SocialLinks tone="dark" className="justify-center" />
          </div>
        </div>

        {/* Order form */}
        <section
          id="order"
          className="mt-12 scroll-mt-44 border border-[#1c1a19]/10 bg-[#e7e0d6]/40 p-4 sm:p-5 md:mt-16 md:scroll-mt-40 md:p-8 lg:p-10"
        >
          <div className="mx-auto max-w-2xl">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#c9a08a]">
              {t("orderEyebrow")}
            </p>
            <h2 className="mt-2 font-display text-3xl text-[#1c1a19] md:text-4xl">
              {t("orderTitle")}
            </h2>
            <p className="mt-2 text-sm text-[#1c1a19]/55">{t("codOnly")}</p>

            {/* Selected lines */}
            <ul className="mt-6 divide-y divide-[#1c1a19]/10 border-y border-[#1c1a19]/10">
              {orderItems.map(({ product: item, qty }) => {
                const cover = getCoverMedia(item);
                return (
                  <li
                    key={item.slug}
                    className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="flex min-w-0 flex-1 gap-3">
                      <div className="relative h-16 w-14 shrink-0 overflow-hidden bg-[#e2dacf]">
                        {cover ? (
                          <Image
                            src={cover.src}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm leading-snug text-[#1c1a19]">
                          {localize(item.name, locale)}
                        </p>
                        <p className="mt-0.5 text-xs text-[#1c1a19]/45">
                          {formatBdt(item.price, locale)}
                        </p>
                        <p className="mt-2 text-sm text-[#1c1a19] sm:hidden">
                          {formatBdt(item.price * qty, locale)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end sm:gap-2">
                      <div className="inline-flex items-center border border-[#1c1a19]/15">
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center text-[#1c1a19]/70 sm:h-8 sm:w-8"
                          onClick={() => setQty(item.slug, qty - 1)}
                          aria-label={t("decrease")}
                        >
                          −
                        </button>
                        <span className="min-w-7 text-center text-sm">{qty}</span>
                        <button
                          type="button"
                          className="flex h-9 w-9 items-center justify-center text-[#1c1a19]/70 sm:h-8 sm:w-8"
                          onClick={() => setQty(item.slug, qty + 1)}
                          aria-label={t("increase")}
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-2">
                        <button
                          type="button"
                          onClick={() => removeProduct(item.slug)}
                          className="text-[10px] uppercase tracking-[0.14em] text-[#1c1a19]/45 transition hover:text-[#1c1a19]"
                        >
                          {t("remove")}
                        </button>
                        <p className="hidden text-sm text-[#1c1a19] sm:block">
                          {formatBdt(item.price * qty, locale)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-[#1c1a19]/55">{t("total")}</span>
              <span className="text-[#1c1a19]">{formatBdt(total, locale)}</span>
            </div>

            <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
              {(
                [
                  ["name", t("name"), "text"],
                  ["phone", t("phone"), "tel"],
                  ["district", t("district"), "text"],
                ] as const
              ).map(([key, label, type]) => (
                <label key={key} className="block">
                  <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#1c1a19]/45">
                    {label}
                  </span>
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [key]: e.target.value }))
                    }
                    className={cn(fieldClass, errors[key] && "border-red-700/50")}
                  />
                  {errors[key] ? (
                    <span className="mt-1 block text-xs text-red-700/70">
                      {errors[key]}
                    </span>
                  ) : null}
                </label>
              ))}

              <label className="block">
                <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#1c1a19]/45">
                  {t("address")}
                </span>
                <textarea
                  value={form.address}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, address: e.target.value }))
                  }
                  rows={3}
                  className={cn(
                    fieldClass,
                    "min-h-[5.5rem] resize-y py-3",
                    errors.address && "border-red-700/50",
                  )}
                />
                {errors.address ? (
                  <span className="mt-1 block text-xs text-red-700/70">
                    {errors.address}
                  </span>
                ) : null}
              </label>

              <label className="block">
                <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-[#1c1a19]/45">
                  {t("note")}
                </span>
                <textarea
                  value={form.note}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, note: e.target.value }))
                  }
                  rows={2}
                  className={cn(fieldClass, "min-h-[4.5rem] resize-y py-3")}
                />
              </label>

              <button
                type="submit"
                className="inline-flex min-h-12 w-full items-center justify-center bg-[#1c1a19] px-6 text-[11px] uppercase tracking-[0.2em] text-[#f4efe8] transition hover:bg-black"
              >
                {t("placeOrder")}
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* Mobile sticky */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#1c1a19]/10 bg-[#f0ebe4]/95 p-3 backdrop-blur-md lg:hidden">
        <div className="container-rg flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[#1c1a19]">
              {t("bagCount", { count: itemCount })}
            </p>
            <p className="text-xs text-[#1c1a19]/55">
              {formatBdt(total, locale)}
            </p>
          </div>
          <button
            type="button"
            onClick={scrollToOrder}
            className="inline-flex h-12 shrink-0 items-center justify-center bg-[#1c1a19] px-5 text-[11px] uppercase tracking-[0.18em] text-[#f4efe8]"
          >
            {t("orderNow")}
          </button>
        </div>
      </div>

      {preview ? (
        <LandingQuickView
          product={preview}
          inBag={(lines[preview.slug] || 0) > 0}
          onClose={() => setPreview(null)}
          onAdd={addProduct}
          onRemove={removeProduct}
        />
      ) : null}
    </div>
  );
}
