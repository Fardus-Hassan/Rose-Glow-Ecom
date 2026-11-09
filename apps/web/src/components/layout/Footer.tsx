import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { categories } from "@/data/products";

export async function Footer() {
  const t = await getTranslations("Footer");
  const home = await getTranslations("Home");
  const nav = await getTranslations("Nav");
  const tc = await getTranslations("Categories");
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[#0e0d0c] text-[#f4efe8]">
      <div className="container-rg grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr_1.3fr] md:gap-10 md:py-20">
        <div>
          <div className="mb-5 flex items-center gap-3">
            <span
              className="relative h-11 w-11 overflow-hidden rounded-full ring-1 ring-[#c9a08a]/40"
              style={{ position: "relative" }}
            >
              <Image
                src="/brand/logo.png"
                alt="Rose Glow"
                fill
                sizes="44px"
                className="object-cover"
              />
            </span>
            <span className="font-display text-2xl">Rose Glow</span>
          </div>
          <p className="max-w-xs text-sm leading-7 text-[#f4efe8]/55">
            {t("tagline")}
          </p>
        </div>

        <div>
          <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
            {t("quickLinks")}
          </p>
          <div className="flex flex-col gap-3 text-sm text-[#f4efe8]/70">
            <Link href="/" className="hover:text-[#f4efe8]">
              {nav("home")}
            </Link>
            <Link href="/products" className="hover:text-[#f4efe8]">
              {nav("products")}
            </Link>
            <Link href="/about" className="hover:text-[#f4efe8]">
              {nav("about")}
            </Link>
            <Link href="/contact" className="hover:text-[#f4efe8]">
              {nav("contact")}
            </Link>
            <Link href="/cart" className="hover:text-[#f4efe8]">
              {nav("cart")}
            </Link>
          </div>
        </div>

        <div>
          <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
            {t("categories")}
          </p>
          <div className="flex flex-col gap-3 text-sm text-[#f4efe8]/70">
            {categories.slice(0, 4).map((c) => (
              <Link
                key={c}
                href={`/products?category=${c}`}
                className="hover:text-[#f4efe8]"
              >
                {tc(c)}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
            {t("newsletter")}
          </p>
          <p className="mb-4 text-sm leading-6 text-[#f4efe8]/55">
            {home("newsletterSub")}
          </p>
          <form className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              placeholder={home("newsletterPlaceholder")}
              className="min-h-11 flex-1 border border-white/15 bg-transparent px-4 text-sm text-[#f4efe8] outline-none placeholder:text-[#f4efe8]/35 focus:border-[#c9a08a]"
            />
            <button
              type="button"
              className="min-h-11 border border-[#c9a08a]/60 bg-[#c9a08a]/15 px-5 text-[11px] uppercase tracking-[0.18em] text-[#f4efe8] transition hover:bg-[#c9a08a]/25"
            >
              {home("newsletterCta")}
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-rg py-5 text-[11px] tracking-[0.12em] text-[#f4efe8]/35">
          {t("rights", { year })}
        </div>
      </div>
    </footer>
  );
}
