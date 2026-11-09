"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/format";

export function ContactForm() {
  const t = useTranslations("Contact");
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    message: "",
  });

  const fieldClass =
    "min-h-12 w-full border border-[#1c1a19]/15 bg-transparent px-4 text-sm text-[#1c1a19] outline-none transition placeholder:text-[#1c1a19]/35 focus:border-[#c9a08a]";

  if (sent) {
    return (
      <div className="border border-[#1c1a19]/10 bg-[#e7e0d6]/45 p-8 md:p-10">
        <p className="font-display text-3xl text-[#1c1a19]">{t("successTitle")}</p>
        <p className="mt-3 text-sm leading-7 text-[#1c1a19]/55">{t("successSub")}</p>
      </div>
    );
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        if (!form.name.trim() || !form.phone.trim() || !form.message.trim()) {
          return;
        }
        setSent(true);
      }}
    >
      <label className="block">
        <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#1c1a19]/45">
          {t("name")}
        </span>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          className={fieldClass}
          required
        />
      </label>
      <label className="block">
        <span className="mb-2 block text-[10px] uppercase tracking-[0.18em] text-[#1c1a19]/45">
          {t("phone")}
        </span>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
          className={fieldClass}
          required
        />
      </label>
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
          className={cn(fieldClass, "min-h-[8rem] resize-y py-3")}
          required
        />
      </label>
      <button
        type="submit"
        className="inline-flex min-h-12 items-center justify-center bg-[#1c1a19] px-8 text-[11px] uppercase tracking-[0.2em] text-[#f4efe8] transition hover:bg-black"
      >
        {t("send")}
      </button>
    </form>
  );
}
