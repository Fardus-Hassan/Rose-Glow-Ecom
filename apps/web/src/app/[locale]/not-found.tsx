import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="container-rg flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
        {t("eyebrow")}
      </p>
      <p className="mt-4 font-display text-7xl text-[#1c1a19] md:text-8xl">404</p>
      <p className="mt-5 max-w-md text-sm leading-7 text-[#1c1a19]/55">
        {t("body")}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center justify-center bg-[#1c1a19] px-7 text-[11px] uppercase tracking-[0.2em] text-[#f4efe8]"
        >
          {t("home")}
        </Link>
        <Link
          href="/products"
          className="inline-flex min-h-12 items-center justify-center border border-[#1c1a19]/2 px-7 text-[11px] uppercase tracking-[0.2em] text-[#1c1a19]"
        >
          {t("shop")}
        </Link>
      </div>
    </div>
  );
}
