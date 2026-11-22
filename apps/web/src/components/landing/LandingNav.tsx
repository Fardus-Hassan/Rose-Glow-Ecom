"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { mediaUrl } from "@/lib/media";

export function LandingNav() {
  const t = useTranslations("LandingPearl");

  const scrollToOrder = () => {
    const node = document.getElementById("order");
    if (!node) return;
    node.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#1c1a19]/10 bg-[#f0ebe4] text-[#1c1a19]">
      <div className="container-rg grid h-[4.25rem] grid-cols-[auto_1fr_auto] items-center gap-2 md:h-[4.75rem] md:grid-cols-[1fr_auto_1fr] md:gap-3">
        <div className="flex justify-start">
          <LocaleSwitcher size="sm" />
        </div>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex min-w-0 items-center justify-center gap-2 justify-self-center sm:gap-2.5"
          aria-label="Rose Glow"
        >
          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full ring-1 ring-[#c9a08a]/35 md:h-9 md:w-9">
            <Image
              src={mediaUrl("/brand/logo.png")}
              alt=""
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </span>
          <span className="truncate font-display text-[1rem] tracking-[0.02em] sm:text-[1.1rem] md:text-xl">
            Rose Glow
          </span>
        </button>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={scrollToOrder}
            className="rg-beat inline-flex min-h-10 items-center justify-center bg-[#c75d7e] px-2.5 text-[10px] uppercase tracking-[0.14em] text-white shadow-[0_0_0_1px_rgba(199,93,126,0.28)] transition-colors hover:bg-[#b24e6e] sm:px-4 sm:text-[11px] sm:tracking-[0.16em]"
          >
            {t("orderNow")}
          </button>
        </div>
      </div>
    </header>
  );
}
