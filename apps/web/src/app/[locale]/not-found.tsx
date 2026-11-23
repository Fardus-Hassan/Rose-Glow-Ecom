import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="relative overflow-hidden bg-[color:var(--rg-paper)]">
      <div
        className="rg-editorial-grid pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      />
      <div className="container-rg relative flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[color:var(--rg-muted)]">
          {t("eyebrow")}
        </p>
        <p className="rg-giant-type mt-4 text-[clamp(5rem,18vw,9rem)] opacity-[0.12]">
          404
        </p>
        <p className="mt-5 max-w-md text-sm leading-7 text-[color:var(--rg-charcoal)]/55">
          {t("body")}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/" className="rg-cta-solid min-h-12 px-7">
            {t("home")}
          </Link>
          <Link href="/products" className="rg-cta min-h-12 px-7">
            {t("shop")}
          </Link>
        </div>
      </div>
    </div>
  );
}
