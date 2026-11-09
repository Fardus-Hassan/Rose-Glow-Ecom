import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getCoverMedia, localize, products } from "@/data/products";
import { formatBdt } from "@/lib/format";
import { Reveal } from "@/components/motion/Reveal";

export async function Spotlight() {
  const t = await getTranslations("Home");
  const locale = await getLocale();
  const product = products.find((p) => p.featured) ?? products[0];
  const cover = getCoverMedia(product);

  return (
    <section className="bg-[#f0ebe4] py-16 md:py-24">
      <div className="container-rg grid items-stretch gap-0 md:grid-cols-2">
        <Reveal className="relative min-h-[420px] overflow-hidden md:min-h-[560px]">
          {cover ? (
            <Image
              src={cover.src}
              alt={localize(product.name, locale)}
              fill
              sizes="(max-width:768px) 100vw, 50vw"
              className="object-cover"
            />
          ) : null}
        </Reveal>

        <Reveal
          delay={0.1}
          className="flex flex-col justify-center border border-[#1c1a19]/10 border-t-0 bg-[#e7e0d6] px-6 py-10 md:border-l-0 md:border-t md:px-12 md:py-16"
        >
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#c9a08a]">
            {t("spotlightEyebrow")}
          </p>
          <h2 className="mt-5 font-display text-4xl leading-tight text-[#1c1a19] md:text-5xl">
            {localize(product.name, locale)}
          </h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-[#1c1a19]/65">
            {localize(product.description, locale)}
          </p>
          <p className="mt-8 text-lg text-[#1c1a19]">
            {formatBdt(product.price, locale)}
          </p>
          <div className="mt-8">
            <Link
              href={`/product/${product.slug}`}
              className="inline-flex items-center gap-3 border border-[#1c1a19] px-7 py-3.5 text-[11px] uppercase tracking-[0.22em] text-[#1c1a19] transition hover:bg-[#1c1a19] hover:text-[#f4efe8]"
            >
              {t("spotlightCta")}
              <span>→</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
