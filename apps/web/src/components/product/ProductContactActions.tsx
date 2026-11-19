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
        "rounded-sm border border-[#1c1a19]/10 bg-[#e7e0d6]/55 p-3.5 sm:p-4",
        className,
      )}
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#a67c68]">
            {t("needHelpEyebrow")}
          </p>
          <p className="mt-1 text-sm text-[#1c1a19]/70">{t("needHelpTitle")}</p>
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
            className="rg-beat group inline-flex min-h-12 items-center justify-center gap-2 border border-[#1c1a19]/18 bg-[#f4efe8] px-3 text-[11px] uppercase tracking-[0.16em] text-[#1c1a19] transition-colors hover:border-[#1c1a19] hover:bg-[#1c1a19] hover:text-[#f4efe8]"
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
            className="rg-beat group inline-flex min-h-12 items-center justify-center gap-2 border border-[#1f6b4a]/25 bg-[#1f6b4a] px-3 text-[11px] uppercase tracking-[0.16em] text-[#f4efe8] transition-colors hover:bg-[#185a3e]"
          >
            <IconWhatsApp className="h-4 w-4 shrink-0 transition group-hover:scale-105" />
            <span className="truncate">{t("whatsappButton")}</span>
          </a>
        ) : null}
      </div>

      <p className="mt-2.5 text-[11px] leading-relaxed text-[#1c1a19]/45">
        {t("needHelpHint")}
      </p>
    </div>
  );
}
