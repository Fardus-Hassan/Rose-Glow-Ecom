import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";

const ATELIER_IMAGE =
  "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?auto=format&fit=crop&w=1600&q=80";

/**
 * Finale — edge-to-edge atelier image with gold CTA.
 */
export async function AtelierBand() {
  const t = await getTranslations("Home");
  const nav = await getTranslations("Nav");

  return (
    <section className="relative isolate min-h-[80svh] overflow-hidden bg-[color:var(--rg-paper)] md:min-h-[88svh]">
      <div className="absolute inset-0">
        <Parallax speed={48} scale={1.08} className="absolute inset-[-8%]">
          <Image
            src={ATELIER_IMAGE}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[center_35%]"
          />
        </Parallax>
        <div className="absolute inset-0 bg-[color:var(--rg-paper)]/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-[color:var(--rg-paper)] via-[color:var(--rg-paper)]/30 to-transparent" />
      </div>

      <div className="container-rg relative flex min-h-[80svh] flex-col justify-end pb-16 pt-28 md:min-h-[88svh] md:pb-24 md:pt-32">
        <Reveal>
          <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[color:var(--rg-accent)]">
            {nav("atelierNote")}
          </p>
          <h2 className="mt-4 max-w-3xl font-display text-[clamp(2.4rem,7vw,5.25rem)] leading-[1.02] tracking-[-0.03em] text-[color:var(--rg-pearl)]">
            {t("atelierTitle")}
          </h2>
          <div className="rg-home-gold-rule mt-6 w-20" />
          <p className="mt-6 max-w-lg text-[15px] leading-7 text-white md:text-base md:leading-8">
            {t("atelierSub")}
          </p>
          <div className="mt-10">
            <Link href="/products" className="rg-cta-solid min-h-12 px-10">
              {t("atelierCta")}
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
