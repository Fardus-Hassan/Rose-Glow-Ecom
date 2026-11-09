import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";

export async function PromoBanner() {
  const t = await getTranslations("Home");

  return (
    <section className="bg-[color:var(--rg-pearl)] py-4 md:py-10">
      <div className="container-rg">
        <Reveal>
          <div className="grid overflow-hidden rounded-[1.5rem] bg-[color:var(--rg-paper-deep)] shadow-sm ring-1 ring-[color:var(--rg-line)] md:grid-cols-2">
            <div className="relative min-h-[260px] md:min-h-[360px]">
              <Image
                src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?auto=format&fit=crop&w=1400&q=80"
                alt=""
                fill
                sizes="(max-width:768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center bg-[color:var(--rg-blush)] px-6 py-10 md:px-12 md:py-14">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[color:var(--rg-pink-deep)]">
                {t("promoEyebrow")}
              </p>
              <h2 className="mt-3 font-display text-4xl text-[color:var(--rg-charcoal)] md:text-5xl">
                {t("promoTitle")}
              </h2>
              <p className="mt-3 max-w-sm text-sm leading-7 text-[color:var(--rg-muted)]">
                {t("promoSub")}
              </p>
              <p className="mt-5 inline-flex w-fit rounded-full bg-[color:var(--rg-paper)] px-4 py-2 text-xs font-semibold tracking-wider text-[color:var(--rg-charcoal)] ring-1 ring-[color:var(--rg-line)]">
                {t("promoCode")}
              </p>
              <div className="mt-7">
                <Link href="/products" className="btn-pink">
                  {t("promoCta")} →
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
