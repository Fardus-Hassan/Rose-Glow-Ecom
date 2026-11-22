"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  chosenOffer,
  defaultOptionId,
  galleryForOffer,
  getCoverMedia,
  localize,
  type Product,
} from "@/data/products";
import type { Review } from "@/data/reviews";
import { bdMobile, formatBdt, cn } from "@/lib/format";
import {
  IconGem,
  IconPhone,
  IconShield,
  IconStar,
  IconTruck,
  IconWhatsApp,
} from "@/components/icons";
import { ProductGallery } from "@/components/product/ProductGallery";
import { VariantChoices } from "@/components/product/VariantChoices";
import { ProductContactActions } from "@/components/product/ProductContactActions";
import { ProductReviews } from "@/components/product/ProductReviews";
import { ProductCard } from "@/components/products/ProductCard";
import { LandingNav } from "@/components/landing/LandingNav";
import { LandingQuickView } from "@/components/landing/LandingQuickView";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { Slider } from "@/components/ui/Slider";
import { RichText } from "@/components/ui/RichText";
import { MetaViewContent } from "@/components/analytics/MetaViewContent";
import {
  computeClientShippingFee,
  createStoreOrder,
  fetchReviews,
  fetchShippingSettings,
  type ShippingSettings,
} from "@/lib/catalog";
import {
  trackAddToCart,
  trackInitiateCheckout,
  trackPurchase,
} from "@/lib/meta-pixel";
import { isRichTextEmpty } from "@/lib/rich-text";
import {
  parseLandingConfig,
  type ProductLandingConfig,
} from "@/lib/landing";
import {
  LandingPageSkeleton,
  ProductCardSkeleton,
} from "@/components/skeletons/StorefrontSkeletons";
import { useCatalog } from "@/store/catalog";

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

export function ProductLanding({
  productSlug,
  product: productProp,
  landing: landingProp,
  relatedSlugs: relatedSlugsProp,
}: {
  productSlug: string;
  product?: Product | null;
  landing?: ProductLandingConfig | unknown;
  relatedSlugs?: string[];
}) {
  const t = useTranslations("LandingPearl");
  const tp = useTranslations("Product");
  const tc = useTranslations("Categories");
  const locale = useLocale();
  const { ready, products, getBySlug, contact } = useCatalog();
  // Prefer SSR product so reload never flashes seed/default catalog rows.
  const product = productProp ?? (ready ? getBySlug(productSlug) : null);
  const landing = parseLandingConfig(landingProp);
  const relatedSlugs = relatedSlugsProp?.length
    ? relatedSlugsProp
    : landing.relatedSlugs;
  const [lines, setLines] = useState<LineMap>({ [productSlug]: 1 });
  const [lineOptions, setLineOptions] = useState<Record<string, string>>(() => {
    const id = defaultOptionId(productProp as Product);
    return id ? { [productSlug]: id } : {};
  });
  const [optionId, setOptionId] = useState(defaultOptionId(productProp as Product));
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);
  const [preview, setPreview] = useState<Product | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [shipping, setShipping] = useState<ShippingSettings | null>(null);
  const [orderInView, setOrderInView] = useState(false);

  useEffect(() => {
    const el = document.getElementById("order");
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOrderInView(entry.isIntersecting),
      { threshold: 0.2, rootMargin: "0px 0px -72px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    void fetchReviews({ productSlug, pageSize: 100 }).then((rows) => {
      if (!cancelled) setReviews(rows);
    });
    void fetchShippingSettings()
      .then((settings) => {
        if (!cancelled) setShipping(settings);
      })
      .catch(() => {
        if (!cancelled) {
          setShipping({
            shippingFeeDefault: 80,
            freeShippingOver: 2500,
            codEnabled: true,
            codNoteEn: "Cash on delivery available nationwide.",
            codNoteBn: "সারাদেশে ক্যাশ অন ডেলিভারি পাওয়া যায়।",
            shippingReturnEn:
              "Cash on delivery available nationwide. Easy exchange support after your piece arrives.",
            shippingReturnBn:
              "সারাদেশে ক্যাশ অন ডেলিভারি। পিস হাতে পেয়ে সহজ এক্সচেঞ্জ সাপোর্ট।",
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [productSlug]);

  useEffect(() => {
    setLines({ [productSlug]: 1 });
  }, [productSlug]);

  const related = useMemo(() => {
    const manual = relatedSlugs
      .map((slug) => getBySlug(slug))
      .filter(Boolean) as Product[];
    if (manual.length > 0) return manual.slice(0, 6);
    const current = getBySlug(productSlug);
    if (!current) return products.slice(0, 3);
    return products
      .filter(
        (item) =>
          item.slug !== productSlug && item.category === current.category,
      )
      .concat(
        products.filter(
          (item) =>
            item.slug !== productSlug && item.category !== current.category,
        ),
      )
      .slice(0, 3);
  }, [getBySlug, products, productSlug, relatedSlugs]);

  const orderItems = useMemo(() => {
    return Object.entries(lines)
      .map(([slug, qty]) => {
        const item = getBySlug(slug);
        if (!item || qty <= 0) return null;
        return { product: item, qty };
      })
      .filter(Boolean) as Array<{ product: Product; qty: number }>;
  }, [lines, getBySlug]);

  const offerFor = (item: Product) =>
    chosenOffer(
      item,
      item.slug === productSlug ? optionId : lineOptions[item.slug],
    );

  const subtotal = orderItems.reduce((sum, item) => {
    return sum + offerFor(item.product).price * item.qty;
  }, 0);
  const shippingFee = shipping
    ? computeClientShippingFee(subtotal, shipping)
    : 0;
  const total = subtotal + shippingFee;
  const itemCount = orderItems.reduce((sum, item) => sum + item.qty, 0);

  const checkoutTracked = useRef(false);
  useEffect(() => {
    if (!product || !orderInView || checkoutTracked.current) return;
    if (orderItems.length === 0) return;
    checkoutTracked.current = true;
    trackInitiateCheckout({
      value: total,
      numItems: itemCount,
      contents: orderItems.map(({ product: item, qty }) => {
        const lineOffer = offerFor(item);
        return {
          id: lineOffer.sku || item.sku || item.slug,
          quantity: qty,
          item_price: lineOffer.price,
        };
      }),
    });
  }, [product, orderInView, orderItems, total, itemCount, optionId, lineOptions]);

  if (!product) {
    if (!ready) return <LandingPageSkeleton />;
    return null;
  }

  const offer = chosenOffer(product, optionId);
  const gallery = galleryForOffer(product, offer.media);
  const compare = offer.compareAtPrice;
  const discount =
    compare && compare > offer.price
      ? Math.round(((compare - offer.price) / compare) * 100)
      : 0;

  const scrollToOrder = () => {
    document
      .getElementById("order")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const rememberOption = (slug: string, nextOptionId?: string) => {
    if (!nextOptionId) return;
    setLineOptions((prev) => ({ ...prev, [slug]: nextOptionId }));
  };

  const setQty = (slug: string, qty: number, nextOptionId?: string) => {
    const prevQty = lines[slug] || 0;
    if (nextOptionId) rememberOption(slug, nextOptionId);
    setLines((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[slug];
        // Keep at least one line so the COD form stays usable.
        if (Object.keys(next).length === 0) next[productSlug] = 1;
      } else {
        next[slug] = qty;
      }
      return next;
    });
    if (qty <= 0) {
      setLineOptions((prev) => {
        if (!(slug in prev) || slug === productSlug) return prev;
        const next = { ...prev };
        delete next[slug];
        return next;
      });
    }
    if (qty > prevQty) {
      const item = getBySlug(slug);
      if (item) {
        const added = qty - prevQty;
        const lineOffer = chosenOffer(
          item,
          nextOptionId ||
            (slug === productSlug ? optionId : lineOptions[slug]),
        );
        trackAddToCart({
          contentId: lineOffer.sku || item.sku || item.slug,
          contentName: localize(lineOffer.label, locale),
          value: lineOffer.price * added,
          quantity: added,
        });
      }
    }
  };

  const addProduct = (slug: string, nextOptionId?: string) => {
    const item = getBySlug(slug);
    const resolvedOption =
      nextOptionId ||
      lineOptions[slug] ||
      (item ? defaultOptionId(item) : undefined);
    if (resolvedOption) rememberOption(slug, resolvedOption);
    setLines((prev) => ({
      ...prev,
      [slug]: (prev[slug] || 0) + 1,
    }));
    if (item) {
      const lineOffer = chosenOffer(item, resolvedOption);
      trackAddToCart({
        contentId: lineOffer.sku || item.sku || item.slug,
        contentName: localize(lineOffer.label, locale),
        value: lineOffer.price,
        quantity: 1,
      });
    }
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
    if (!bdMobile(form.phone)) {
      next.phone = t("phoneInvalid");
    }
    if (!form.address.trim()) next.address = t("required");
    if (!form.district.trim()) next.district = t("required");
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (orderItems.length === 0) return;
    if (!validate()) return;
    if (shipping && !shipping.codEnabled) {
      setSubmitError(t("codUnavailable"));
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await createStoreOrder({
        customerName: form.name.trim(),
        customerPhone: bdMobile(form.phone),
        addressLine: form.address.trim(),
        city: form.district.trim(),
        district: form.district.trim(),
        note: form.note.trim() || undefined,
        shippingFee,
        discount: 0,
        items: orderItems.map(({ product: item, qty }) => {
          const lineOffer = offerFor(item);
          return {
            productId: item.id,
            productName: localize(lineOffer.label, locale),
            productSku: lineOffer.sku,
            unitPrice: lineOffer.price,
            quantity: qty,
          };
        }),
      });
      trackPurchase({
        value: order.total ?? total,
        orderId: order.orderNumber,
        eventId: order.id || order.orderNumber,
        contents: orderItems.map(({ product: item, qty }) => ({
          id: item.sku || item.slug,
          quantity: qty,
          item_price: item.price,
        })),
      });
      setOrderNumber(order.orderNumber);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t("orderFailed"));
    } finally {
      setSubmitting(false);
    }
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
            {orderNumber ? `${orderNumber} · ` : ""}
            {t("bagCount", { count: itemCount })} · {formatBdt(total, locale)}
          </p>
          <a
            href={contact.phoneTel}
            className="mt-8 inline-flex min-h-12 items-center justify-center bg-[#1c1a19] px-7 text-[11px] uppercase tracking-[0.2em] text-[#f4efe8]"
          >
            {t("callUs")} · {contact.phoneDisplay}
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
      <MetaViewContent
        contentId={product.sku || product.slug}
        contentName={localize(product.name, locale)}
        value={product.price}
      />
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

      <div className="container-rg pt-6 sm:pt-8 md:pt-12">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-start lg:gap-12 xl:gap-16">
          <div className="lg:sticky lg:top-36">
            <ProductGallery
              key={offer.optionId || "product"}
              media={gallery}
              discount={discount}
            />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#c9a08a]">
              {localize(
                {
                  en: landing.eyebrowEn || tc(product.category),
                  bn: landing.eyebrowBn || tc(product.category),
                },
                locale,
              )}
            </p>
            <h1 className="mt-3 font-display text-[clamp(1.75rem,6vw,2.85rem)] leading-[1.1] tracking-[-0.02em] text-[#1c1a19]">
              {localize(
                {
                  en: landing.headlineEn || product.name.en,
                  bn: landing.headlineBn || product.name.bn,
                },
                locale,
              )}
            </h1>

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="text-2xl text-[#1c1a19]">
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
              onSelect={(id) => {
                setOptionId(id);
                rememberOption(productSlug, id);
              }}
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
              html={localize(
                {
                  en:
                    landing.bodyEn ||
                    (product.shortDescription?.en &&
                    !isRichTextEmpty(product.shortDescription.en)
                      ? product.shortDescription.en
                      : product.description.en),
                  bn:
                    landing.bodyBn ||
                    (product.shortDescription?.bn &&
                    !isRichTextEmpty(product.shortDescription.bn)
                      ? product.shortDescription.bn
                      : product.description.bn),
                },
                locale,
              )}
              className="mt-5 text-[15px] leading-7 text-[#1c1a19]/58"
            />

            <div className="mt-6 grid grid-cols-3 gap-1.5 bg-[#f6efe8] px-2 py-4 ring-1 ring-[#c9a08a]/55 sm:gap-2 sm:px-3">
              {(
                [
                  [IconShield, t("trust1")],
                  [IconTruck, t("trust2")],
                  [IconGem, t("trust3")],
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

            <div className="mt-7">
              <button
                type="button"
                onClick={() => {
                  if (!lines[productSlug]) setQty(productSlug, 1);
                  scrollToOrder();
                }}
                className="rg-beat inline-flex min-h-12 w-full items-center justify-center bg-[#c75d7e] px-6 text-[11px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#b24e6e]"
              >
                {t("orderNow")} →
              </button>
            </div>

            <ProductContactActions
              className="mt-5"
              productName={localize(product.name, locale)}
            />

            <div className="mt-7 flex flex-col items-center text-center">
              <p className="mb-2.5 text-[10px] uppercase tracking-[0.2em] text-[#1c1a19]/4">
                {t("follow")}
              </p>
              <SocialLinks tone="dark" className="justify-center" />
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
              <RichText
                html={localize(
                  {
                    en: landing.bodyEn || product.description.en,
                    bn: landing.bodyBn || product.description.bn,
                  },
                  locale,
                )}
                className="text-sm leading-7 text-[#1c1a19]/58 md:text-[15px] md:leading-8"
              />
              <ul className="mt-6 space-y-3 text-sm text-[#1c1a19]/65">
                {landing.points
                  .map((point) => localize(point, locale).trim())
                  .filter(Boolean)
                  .map((point) => (
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
              <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[#1c1a19]/58">
                {(
                  locale === "bn"
                    ? shipping?.shippingReturnBn ||
                      shipping?.shippingReturnEn ||
                      tp("shippingCopy")
                    : shipping?.shippingReturnEn ||
                      shipping?.shippingReturnBn ||
                      tp("shippingCopy")
                )
                  .replace(/\n{3,}/g, "\n\n")
                  .trim()}
              </p>
            </div>
          </div>
        </section>
      </div>

      {reviews.length > 0 ? (
        <div className="mt-14 md:mt-20">
          <ProductReviews product={product} reviews={reviews} />
        </div>
      ) : null}

      {/* Related */}
      {!ready ? (
        <section className="container-rg mt-14 md:mt-20">
          <div className="h-3 w-24 animate-pulse rounded-sm bg-[#1c1a19]/10" />
          <div className="mt-3 h-9 w-56 animate-pulse rounded-sm bg-[#1c1a19]/10" />
          <div className="mt-8 flex gap-4 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <ProductCardSkeleton
                key={i}
                className="w-[82%] shrink-0 sm:w-[48%] lg:w-[32%]"
              />
            ))}
          </div>
        </section>
      ) : related.length > 0 ? (
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
              slideClassName="basis-[82%] sm:basis-[48%] lg:basis-[32%]"
              labelPrev={t("sliderPrev")}
              labelNext={t("sliderNext")}
            >
              {related.map((item) => {
                const inBag = (lines[item.slug] || 0) > 0;
                return (
                  <div key={item.slug} className="flex h-full flex-col">
                    <ProductCard
                      product={item}
                      onSelect={() => setPreview(item)}
                    />
                    <div className="mt-3 flex flex-row gap-2">
                      <button
                        type="button"
                        onClick={() => setPreview(item)}
                        className="inline-flex min-h-10 flex-1 items-center justify-center border border-[#1c1a19]/2 px-2 text-[10px] uppercase tracking-[0.14em] text-[#1c1a19] transition hover:border-[#1c1a19] sm:px-3 sm:tracking-[0.16em]"
                      >
                        {t("viewDetails")}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleProduct(item.slug)}
                        className={cn(
                          "inline-flex min-h-10 flex-1 items-center justify-center px-2 text-[10px] uppercase tracking-[0.14em] transition sm:px-3 sm:tracking-[0.16em]",
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

      <div className="container-rg pb-4 md:pb-8">
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
            <ul className="mt-6 divide-y divide-[#1c1a19]/10 border-t border-[#1c1a19]/10">
              {orderItems.map(({ product: item, qty }) => {
                const lineOffer = offerFor(item);
                const cover = lineOffer.image
                  ? { src: lineOffer.image }
                  : getCoverMedia(item);
                return (
                  <li
                    key={`${item.slug}:${lineOffer.optionId || ""}`}
                    className="flex flex-row items-center gap-3 py-4 sm:gap-4"
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
                          {localize(lineOffer.label, locale)}
                        </p>
                        <p className="mt-0.5 text-xs text-[#1c1a19]/45">
                          {formatBdt(lineOffer.price, locale)}
                        </p>
                        <p className="mt-2 text-sm text-[#1c1a19] sm:hidden">
                          {formatBdt(lineOffer.price * qty, locale)}
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
                          {formatBdt(lineOffer.price * qty, locale)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 space-y-2 pt-2 text-sm">
              <div className="flex items-center justify-between text-[#1c1a19]/55">
                <span>{t("subtotal")}</span>
                <span>{formatBdt(subtotal, locale)}</span>
              </div>
              <div className="flex items-center justify-between text-[#1c1a19]/55">
                <span>{t("shippingLabel")}</span>
                <span>
                  {shippingFee > 0
                    ? formatBdt(shippingFee, locale)
                    : shipping
                      ? t("shippingFree")
                      : "…"}
                </span>
              </div>
              {shipping &&
              shipping.freeShippingOver > 0 &&
              subtotal < shipping.freeShippingOver ? (
                <p className="text-xs text-[#1c1a19]/45">
                  {t("freeShippingOver", {
                    amount: formatBdt(shipping.freeShippingOver, locale),
                  })}
                </p>
              ) : null}
              <div className="flex items-center justify-between border-t border-[#1c1a19]/10 pt-2">
                <span className="text-[#1c1a19]/55">{t("total")}</span>
                <span className="text-[#1c1a19]">{formatBdt(total, locale)}</span>
              </div>
            </div>

            <form
              method="post"
              action="#"
              onSubmit={onSubmit}
              className="mt-6 space-y-4"
              noValidate
            >
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

              {submitError ? (
                <p className="border border-red-800/20 bg-red-50 px-3 py-2 text-sm text-red-900">
                  {submitError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="rg-beat inline-flex min-h-12 w-full items-center justify-center bg-[#c75d7e] px-6 text-[11px] uppercase tracking-[0.2em] text-white transition-colors hover:bg-[#b24e6e] disabled:opacity-50"
              >
                {submitting ? "…" : t("placeOrder")}
              </button>
            </form>
          </div>
        </section>
      </div>

      {/* Mobile sticky — hidden while COD form is on screen so Place COD isn't doubled */}
      {!orderInView ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 border-t border-[#1c1a19]/10 bg-[#f0ebe4]/95 p-3 backdrop-blur-md lg:hidden">
          <div className="container-rg flex items-center gap-2 sm:gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-[#1c1a19]">
                {t("bagCount", { count: itemCount })}
              </p>
              <p className="text-xs text-[#1c1a19]/55">
                {formatBdt(total, locale)}
              </p>
            </div>

            {contact.showCallOnProducts &&
            contact.phoneDisplay?.trim() &&
            contact.phoneTel !== "tel:" ? (
              <a
                href={contact.phoneTel}
                aria-label={tp("callButton")}
                className="pointer-events-auto inline-flex h-12 w-12 shrink-0 items-center justify-center border border-[#1c1a19]/15 bg-[#f4efe8] text-[#1c1a19] transition hover:border-[#1c1a19] hover:bg-[#1c1a19] hover:text-[#f4efe8]"
              >
                <IconPhone className="h-4 w-4" />
              </a>
            ) : null}

            {contact.showWhatsappOnProducts &&
            contact.whatsappHref &&
            contact.whatsappHref !== "https://wa.me/" ? (
              <a
                href={`${contact.whatsappHref}${
                  contact.whatsappHref.includes("?") ? "&" : "?"
                }text=${encodeURIComponent(
                  locale === "bn"
                    ? `হ্যালো Rose Glow, আমি “${localize(product.name, locale)}” অর্ডার করতে চাই।`
                    : `Hi Rose Glow, I’d like to order “${localize(product.name, locale)}”.`,
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={tp("whatsappButton")}
                className="pointer-events-auto inline-flex h-12 w-12 shrink-0 items-center justify-center bg-[#1f6b4a] text-[#f4efe8] transition hover:bg-[#185a3e]"
              >
                <IconWhatsApp className="h-4 w-4" />
              </a>
            ) : null}

            <button
              type="button"
              onClick={scrollToOrder}
              className="rg-beat pointer-events-auto inline-flex h-12 shrink-0 items-center justify-center bg-[#c75d7e] px-4 text-[11px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#b24e6e] sm:px-5 sm:tracking-[0.18em]"
            >
              {t("orderNow")}
            </button>
          </div>
        </div>
      ) : null}

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
