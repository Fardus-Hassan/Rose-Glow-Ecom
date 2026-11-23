"use client";

import { useLocale, useTranslations } from "next-intl";
import { IconPhone, IconWhatsApp } from "@/components/icons";
import { cn } from "@/lib/format";
import { useCatalog } from "@/store/catalog";

type Props = {
  productName?: string;
  className?: string;
};

export function ProductContactActions({ productName, className }: Props) {
  const t = useTranslations("Product");
  const locale = useLocale();
  const { ready, contact } = useCatalog();

  if (!ready) return null;

  const showCall =
    contact.showCallOnProducts &&
    Boolean(contact.phoneDisplay?.trim()) &&
    contact.phoneTel !== "tel:";
  const showWhatsapp =
    contact.showWhatsappOnProducts &&
    Boolean(contact.whatsappHref) &&
    contact.whatsappHref !== "https://wa.me/";

  if (!showCall && !showWhatsapp) return null;

  const waText = encodeURIComponent(
    productName
      ? locale === "bn"
        ? `হ্যালো Rose Glow, আমি “${productName}” অর্ডার করতে চাই।`
        : `Hi Rose Glow, I’d like to order “${productName}”.`
      : locale === "bn"
        ? "হ্যালো Rose Glow, আমি অর্ডার করতে চাই।"
        : "Hi Rose Glow, I’d like to place an order.",
  );
  const whatsappHref = `${contact.whatsappHref}${
    contact.whatsappHref.includes("?") ? "&" : "?"
  }text=${waText}`;

  return (
    <div
      className={cn(
        "border border-[color:var(--rg-line)] bg-[color:var(--rg-paper-deep)]/70 p-3.5 sm:p-4",
        className,
      )}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--rg-accent)]">
            {t("needHelpEyebrow")}
          </p>
          <p className="mt-1 text-sm text-[color:var(--rg-muted)]">
            {t("needHelpTitle")}
          </p>
        </div>
      </div>

      <div
        className={cn(
          "mt-3.5 grid gap-2",
          showCall && showWhatsapp ? "grid-cols-2" : "grid-cols-1",
        )}
      >
        {showCall ? (
          <a
            href={contact.phoneTel}
            className="rg-beat group inline-flex min-h-11 items-center justify-center gap-2 border border-[color:var(--rg-line)] bg-[color:var(--rg-paper)] px-3 text-[11px] uppercase tracking-[0.16em] text-[color:var(--rg-pearl)] transition-colors hover:border-[color:var(--rg-accent)] hover:text-[color:var(--rg-accent)]"
          >
            <IconPhone className="h-4 w-4 shrink-0 transition group-hover:scale-105" />
            <span className="truncate">{t("callButton")}</span>
          </a>
        ) : null}

        {showWhatsapp ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="rg-beat group inline-flex min-h-11 items-center justify-center gap-2 border border-[#1f6b4a]/35 bg-[#1f6b4a] px-3 text-[11px] uppercase tracking-[0.16em] text-white transition-colors hover:bg-[#185a3e]"
          >
            <IconWhatsApp className="h-4 w-4 shrink-0 transition group-hover:scale-105" />
            <span className="truncate">{t("whatsappButton")}</span>
          </a>
        ) : null}
      </div>

      <p className="mt-2.5 text-[11px] leading-relaxed text-[color:var(--rg-muted)]">
        {t("needHelpHint")}
      </p>
    </div>
  );
}
