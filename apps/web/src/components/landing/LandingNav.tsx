"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";

export function LandingNav() {
  const t = useTranslations("LandingPearl");

  const scrollToOrder = () => {
    const node = document.getElementById("order");
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#1c1a19]/10 bg-[#f0ebe4]/95 text-[#1c1a19] backdrop-blur-xl">
      <div className="container-rg grid h-[4.25rem] grid-cols-[auto_1fr_auto] items-center gap-2 md:h-[4.75rem] md:grid-cols-[1fr_auto_1fr] md:gap-3">
        <div className="flex justify-start">
          <LocaleSwitcher size="sm" />
        </div>

        <Link
          href="/l/pearl-bloom"
          className="flex min-w-0 items-center justify-center gap-2 justify-self-center sm:gap-2.5"
        >
          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-[#c9a08a]/35 md:h-9 md:w-9">
            <Image
              src="/brand/logo.png"
              alt="Rose Glow"
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </span>
          <span className="truncate font-display text-[1rem] tracking-[0.02em] sm:text-[1.1rem] md:text-xl">
            Rose Glow
          </span>
        </Link>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={scrollToOrder}
            className="inline-flex min-h-10 items-center justify-center bg-[#1c1a19] px-2.5 text-[10px] uppercase tracking-[0.14em] text-[#f4efe8] transition hover:bg-black sm:px-4 sm:tracking-[0.16em] sm:text-[11px]"
          >
            {t("orderNow")}
          </button>
        </div>
      </div>
    </header>
  );
}
