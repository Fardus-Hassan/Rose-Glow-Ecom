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
    <header className="sticky top-0 z-50 border-b border-[color:var(--rg-line)] bg-[color:var(--rg-paper)]/92 text-[color:var(--rg-ink)] shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-md">
      <div className="container-rg grid h-[4.25rem] grid-cols-[auto_1fr_auto] items-center gap-2 md:h-[4.75rem] md:grid-cols-[1fr_auto_1fr] md:gap-3">
        <div className="flex justify-start">
          <LocaleSwitcher light size="sm" />
        </div>

        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="flex min-w-0 items-center justify-center gap-2 justify-self-center sm:gap-2.5"
          aria-label="Rose Glow"
        >
          <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-[#0c0a0b] ring-1 ring-[#d4a574]/40 md:h-9 md:w-9">
            <Image
              src={mediaUrl("/brand/logo.png")}
              alt=""
              fill
              sizes="36px"
              className="object-cover"
              priority
            />
          </span>
          <span className="font-brand truncate text-[1rem] sm:text-[1.1rem] md:text-xl">
            Rose Glow
          </span>
        </button>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={scrollToOrder}
            className="rg-cta-solid rg-beat min-h-10 px-3 text-[10px] tracking-[0.08em] sm:px-4"
          >
            {t("orderNow")}
          </button>
        </div>
      </div>
    </header>
  );
}
