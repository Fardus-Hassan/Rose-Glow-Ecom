"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { getCoverMedia, localize, type Product } from "@/data/products";
import { formatBdt, cn } from "@/lib/format";
import { CheckoutPageSkeleton } from "@/components/skeletons/StorefrontSkeletons";
import { useBag } from "@/store/bag";
import { useCatalog } from "@/store/catalog";
import {
  computeClientShippingFee,
  createStoreOrder,
  fetchShippingSettings,
  type ShippingSettings,
} from "@/lib/catalog";
import {
  trackInitiateCheckout,
  trackPurchase,
} from "@/lib/meta-pixel";

type FormState = {
  name: string;
  phone: string;
  address: string;
  district: string;
  note: string;
};

const emptyForm: FormState = {
  name: "",
  phone: "",
  address: "",
  district: "",
  note: "",
};

export function CheckoutView() {
  const t = useTranslations("Checkout");
  const locale = useLocale();
  const router = useRouter();
  const { cart, clearCart } = useBag();
  const { ready, getBySlug } = useCatalog();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [shipping, setShipping] = useState<ShippingSettings | null>(null);

  useEffect(() => {
    let cancelled = false;
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
          });
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const lines = useMemo(
    () =>
      cart
        .map((line) => {
          const product = getBySlug(line.slug);
          if (!product) return null;
          return { line, product };
        })
        .filter(Boolean) as Array<{
        line: { slug: string; qty: number };
        product: Product;
      }>,
    [cart, getBySlug],
  );

  const subtotal = lines.reduce(
    (sum, item) => sum + item.product.price * item.line.qty,
    0,
  );
  const shippingFee = shipping
    ? computeClientShippingFee(subtotal, shipping)
    : 0;
  const total = subtotal + shippingFee;
  const codNote =
    locale === "bn"
      ? shipping?.codNoteBn || shipping?.codNoteEn
      : shipping?.codNoteEn;

  const checkoutTracked = useRef(false);
  useEffect(() => {
    if (!ready || lines.length === 0 || checkoutTracked.current) return;
    checkoutTracked.current = true;
    trackInitiateCheckout({
      value: total,
      numItems: lines.reduce((s, item) => s + item.line.qty, 0),
      contents: lines.map(({ line, product }) => ({
        id: product.sku || product.slug,
        quantity: line.qty,
        item_price: product.price,
      })),
    });
  }, [ready, lines, total]);

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

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate() || lines.length === 0) return;
    if (shipping && !shipping.codEnabled) {
      setSubmitError(
        locale === "bn"
          ? "এখন ক্যাশ অন ডেলিভারি বন্ধ আছে।"
          : "Cash on delivery is currently unavailable.",
      );
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const order = await createStoreOrder({
        customerName: form.name.trim(),
        customerPhone: form.phone.trim(),
        addressLine: form.address.trim(),
        city: form.district.trim(),
        district: form.district.trim(),
        note: form.note.trim() || undefined,
        shippingFee,
        discount: 0,
        items: lines.map(({ line, product }) => ({
          productId: product.id,
          productName: localize(product.name, locale),
          productSku: product.sku,
          unitPrice: product.price,
          quantity: line.qty,
        })),
      });
      const eventId = order.id || order.orderNumber;
      trackPurchase({
        value: order.total ?? total,
        orderId: order.orderNumber,
        eventId,
        contents: lines.map(({ line, product }) => ({
          id: product.sku || product.slug,
          quantity: line.qty,
          item_price: product.price,
        })),
      });
      setOrderNumber(order.orderNumber);
      setSubmitted(true);
      clearCart();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Order failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!ready) return <CheckoutPageSkeleton />;

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl py-10 text-center md:py-16">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
          {t("successEyebrow")}
        </p>
        <h1 className="mt-4 font-display text-4xl text-[#1c1a19] md:text-5xl">
          {t("successTitle")}
        </h1>
        <p className="mt-5 text-sm leading-7 text-[#1c1a19]/55">
          {t("successSub")}
        </p>
        {orderNumber ? (
          <p className="mt-3 text-sm text-[#1c1a19]/70">
            {orderNumber}
          </p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/products"
            className="inline-flex min-h-12 items-center justify-center bg-[#1c1a19] px-7 text-[11px] uppercase tracking-[0.2em] text-[#f4efe8]"
          >
            {t("shopMore")}
          </Link>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex min-h-12 items-center justify-center border border-[#1c1a19]/2 px-7 text-[11px] uppercase tracking-[0.2em] text-[#1c1a19]"
          >
            {t("home")}
          </button>
        </div>
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="py-10 text-center md:py-16">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 font-display text-4xl text-[#1c1a19] md:text-5xl">
          {t("emptyTitle")}
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-[#1c1a19]/55">
          {t("emptySub")}
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex min-h-12 items-center justify-center bg-[#1c1a19] px-8 text-[11px] uppercase tracking-[0.2em] text-[#f4efe8]"
        >
          {t("shopMore")}
        </Link>
      </div>
    );
  }

  const fieldClass =
    "min-h-12 w-full border border-[#1c1a19]/15 bg-transparent px-4 text-sm text-[#1c1a19] outline-none transition placeholder:text-[#1c1a19]/35 focus:border-[#c9a08a]";

  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
        {t("eyebrow")}
      </p>
      <h1 className="mt-3 font-display text-4xl text-[#1c1a19] md:text-5xl">
        {t("title")}
      </h1>
      <div className="mt-4 h-px w-12 bg-gradient-to-r from-[#c9a08a] to-transparent" />

      <div className="mt-10 grid gap-10 md:mt-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:gap-14">
        <form onSubmit={onSubmit} className="space-y-5" noValidate>
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#c9a08a]">
              {t("delivery")}
            </p>
            <p className="mt-2 text-sm text-[#1c1a19]/55">
              {codNote || t("codOnly")}
            </p>
            {shipping && !shipping.codEnabled ? (
              <p className="mt-2 border border-red-800/20 bg-red-50 px-3 py-2 text-sm text-red-900">
                {locale === "bn"
                  ? "এখন ক্যাশ অন ডেলিভারি বন্ধ আছে।"
                  : "Cash on delivery is currently unavailable."}
              </p>
            ) : null}
          </div>

          {(
            [
              ["name", t("name"), "text"],
              ["phone", t("phone"), "tel"],
              ["district", t("district"), "text"],
            ] as const
          ).map(([key, label, type]) => (
            <label key={key} className="block">
              <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#1c1a19]/45">
                {label}
              </span>
              <input
                type={type}
                value={form[key]}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, [key]: e.target.value }))
                }
                className={cn(fieldClass, errors[key] && "border-red-700/50")}
                autoComplete={
                  key === "name"
                    ? "name"
                    : key === "phone"
                      ? "tel"
                      : "address-level2"
                }
              />
              {errors[key] ? (
                <span className="mt-1.5 block text-xs text-red-700/70">
                  {errors[key]}
                </span>
              ) : null}
            </label>
          ))}

          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#1c1a19]/45">
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
                "min-h-[6.5rem] resize-y py-3",
                errors.address && "border-red-700/50",
              )}
              autoComplete="street-address"
            />
            {errors.address ? (
              <span className="mt-1.5 block text-xs text-red-700/70">
                {errors.address}
              </span>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#1c1a19]/45">
              {t("note")}
            </span>
            <textarea
              value={form.note}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, note: e.target.value }))
              }
              rows={2}
              className={cn(fieldClass, "min-h-[5rem] resize-y py-3")}
            />
          </label>

          {submitError ? (
            <p className="border border-red-800/20 bg-red-50 px-3 py-2 text-sm text-red-900">
              {submitError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting || (shipping ? !shipping.codEnabled : false)}
            className="inline-flex min-h-12 w-full items-center justify-center bg-[#1c1a19] px-6 text-[11px] uppercase tracking-[0.2em] text-[#f4efe8] transition hover:bg-black disabled:opacity-50 sm:w-auto"
          >
            {submitting ? "…" : t("placeOrder")}
          </button>
        </form>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-[#1c1a19]/10 bg-[#e7e0d6]/45 p-6 md:p-7">
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#c9a08a]">
              {t("order")}
            </p>
            <ul className="mt-5 space-y-4">
              {lines.map(({ line, product }) => {
                const cover = getCoverMedia(product);
                return (
                  <li key={line.slug} className="flex gap-3">
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
                      <p className="truncate text-sm text-[#1c1a19]">
                        {localize(product.name, locale)}
                      </p>
                      <p className="mt-1 text-xs text-[#1c1a19]/45">
                        ×{line.qty} ·{" "}
                        {formatBdt(product.price * line.qty, locale)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 space-y-2 border-t border-[#1c1a19]/10 pt-4 text-sm">
              <div className="flex items-center justify-between text-[#1c1a19]/55">
                <span>Subtotal</span>
                <span>{formatBdt(subtotal, locale)}</span>
              </div>
              <div className="flex items-center justify-between text-[#1c1a19]/55">
                <span>Shipping</span>
                <span>
                  {shippingFee > 0
                    ? formatBdt(shippingFee, locale)
                    : shipping
                      ? "Free"
                      : "…"}
                </span>
              </div>
              {shipping &&
              shipping.freeShippingOver > 0 &&
              subtotal < shipping.freeShippingOver ? (
                <p className="text-xs text-[#1c1a19]/45">
                  Free shipping over{" "}
                  {formatBdt(shipping.freeShippingOver, locale)}
                </p>
              ) : null}
              <div className="flex items-center justify-between border-t border-[#1c1a19]/10 pt-2">
                <span className="text-[#1c1a19]/55">{t("total")}</span>
                <span className="text-[#1c1a19]">
                  {formatBdt(total, locale)}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
