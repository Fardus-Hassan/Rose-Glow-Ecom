"use client";

import Image from "next/image";
import { useMemo, useState, type FormEvent } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { getCoverMedia, getProductBySlug, localize } from "@/data/products";
import { formatBdt, cn } from "@/lib/format";
import { useBag } from "@/store/bag";

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
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Partial<FormState>>({});
  const [submitted, setSubmitted] = useState(false);

  const lines = useMemo(
    () =>
      cart
        .map((line) => {
          const product = getProductBySlug(line.slug);
          if (!product) return null;
          return { line, product };
        })
        .filter(Boolean) as Array<{
        line: { slug: string; qty: number };
        product: NonNullable<ReturnType<typeof getProductBySlug>>;
      }>,
    [cart],
  );

  const subtotal = lines.reduce(
    (sum, item) => sum + item.product.price * item.line.qty,
    0,
  );

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
    if (!validate()) return;
    setSubmitted(true);
    clearCart();
  };

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
          <p className="mt-2 text-sm text-[#1c1a19]/55">{t("codOnly")}</p>
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
                key === "name" ? "name" : key === "phone" ? "tel" : "address-level2"
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

        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center bg-[#1c1a19] px-6 text-[11px] uppercase tracking-[0.2em] text-[#f4efe8] transition hover:bg-black sm:w-auto"
        >
          {t("placeOrder")}
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
                      ×{line.qty} · {formatBdt(product.price * line.qty, locale)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 flex items-center justify-between border-t border-[#1c1a19]/10 pt-4 text-sm">
            <span className="text-[#1c1a19]/55">{t("total")}</span>
            <span className="text-[#1c1a19]">{formatBdt(subtotal, locale)}</span>
          </div>
        </div>
      </aside>
      </div>
    </div>
  );
}
