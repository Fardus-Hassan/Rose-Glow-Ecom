"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/format";

type FormState = {
  name: string;
  phone: string;
  email: string;
  message: string;
};

const empty: FormState = {
  name: "",
  phone: "",
  email: "",
  message: "",
};

export function ContactForm() {
  const t = useTranslations("Contact");
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState<FormState>(empty);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  const fieldClass =
    "min-h-12 w-full border border-[#1c1a19]/15 bg-transparent px-4 text-sm text-[#1c1a19] outline-none transition placeholder:text-[#1c1a19]/35 focus:border-[#c9a08a]";

  const validate = () => {
    const next: Partial<FormState> = {};
    if (!form.name.trim()) next.name = t("required");
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10) {
      next.phone = t("phoneInvalid");
    }
    if (!form.message.trim()) next.message = t("required");
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = t("emailInvalid");
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(data?.message || "Failed to send");
      }
      setSent(true);
    } catch (err) {
      setErrors({
        message: err instanceof Error ? err.message : "Failed to send",
      });
    }
  };

  if (sent) {
    return (
      <div className="border border-[#1c1a19]/10 bg-[#e7e0d6]/45 p-8 md:p-10">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#c9a08a]">
          {t("successEyebrow")}
        </p>
        <p className="mt-3 font-display text-3xl text-[#1c1a19] md:text-4xl">
          {t("successTitle")}
        </p>
        <p className="mt-3 text-sm leading-7 text-[#1c1a19]/55">
          {t("successSub")}
        </p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setForm(empty);
            setErrors({});
          }}
          className="mt-8 text-[10px] uppercase tracking-[0.18em] text-[#1c1a19]/55 underline-offset-4 hover:text-[#1c1a19] hover:underline"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form
      className="border border-[#1c1a19]/10 bg-[#e7e0d6]/35 p-5 sm:p-7 md:p-8"
      onSubmit={onSubmit}
      noValidate
    >
      <p className="text-[10px] uppercase tracking-[0.22em] text-[#c9a08a]">
        {t("formEyebrow")}
      </p>
      <h2 className="mt-2 font-display text-2xl text-[#1c1a19] md:text-3xl">
        {t("formTitle")}
      </h2>

      <div className="mt-7 space-y-5">
        <label className="block">
          <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#1c1a19]/45">
            {t("name")}
          </span>
          <input
            type="text"
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
            className={cn(fieldClass, errors.name && "border-red-700/50")}
            autoComplete="name"
          />
          {errors.name ? (
            <span className="mt-1 block text-xs text-red-700/70">
              {errors.name}
            </span>
          ) : null}
        </label>

        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#1c1a19]/45">
              {t("phone")}
            </span>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              className={cn(fieldClass, errors.phone && "border-red-700/50")}
              autoComplete="tel"
            />
            {errors.phone ? (
              <span className="mt-1 block text-xs text-red-700/70">
                {errors.phone}
              </span>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#1c1a19]/45">
              {t("emailOptional")}
            </span>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className={cn(fieldClass, errors.email && "border-red-700/50")}
              autoComplete="email"
            />
            {errors.email ? (
              <span className="mt-1 block text-xs text-red-700/70">
                {errors.email}
              </span>
            ) : null}
          </label>
        </div>

        <label className="block">
          <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#1c1a19]/45">
            {t("message")}
          </span>
          <textarea
            value={form.message}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, message: e.target.value }))
            }
            rows={5}
            className={cn(
              fieldClass,
              "min-h-[8rem] resize-y py-3",
              errors.message && "border-red-700/50",
            )}
          />
          {errors.message ? (
            <span className="mt-1 block text-xs text-red-700/70">
              {errors.message}
            </span>
          ) : null}
        </label>

        <button
          type="submit"
          className="inline-flex min-h-12 w-full items-center justify-center bg-[#1c1a19] px-8 text-[11px] uppercase tracking-[0.2em] text-[#f4efe8] transition hover:bg-black sm:w-auto"
        >
          {t("send")}
        </button>
      </div>
    </form>
  );
}
