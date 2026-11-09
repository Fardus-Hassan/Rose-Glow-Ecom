import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/Reveal";

const ATELIER_IMAGE = "/home/atelier-gold-spread.jpg";

export async function AtelierBand() {
  const t = await getTranslations("Home");
  const nav = await getTranslations("Nav");

  return (
    <section className="relative isolate min-h-[70svh] overflow-hidden bg-[#0e0d0c] text-[#f4efe8] md:min-h-[560px]">
      <div className="absolute inset-0 -z-20">
        <Image
          src={ATELIER_IMAGE}
          alt=""
          fill
          sizes="100vw"
          className="object-cover object-[center_35%] opacity-55"
        />
      </div>

      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#0e0d0c] via-[#0e0d0c]/78 to-[#0e0d0c]/25" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0e0d0c] via-transparent to-[#0e0d0c]/40" />

      <div className="container-rg relative flex min-h-[70svh] items-end py-16 md:min-h-[560px] md:items-center md:py-24">
        <Reveal className="max-w-xl">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
            {nav("atelierNote")}
          </p>

          <h2 className="mt-5 font-display text-[clamp(2.4rem,5vw,4.25rem)] leading-[1.05] tracking-[-0.02em] text-[#f4efe8]">
            {t("atelierTitle")}
          </h2>

          <div className="mt-6 h-px w-14 bg-gradient-to-r from-[#c9a08a] to-transparent" />

          <p className="mt-6 max-w-md text-[15px] leading-7 text-[#f4efe8]/62 md:text-base md:leading-8">
            {t("atelierSub")}
          </p>

          <div className="mt-10">
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 border border-[#c9a08a]/55 bg-[#c9a08a]/10 px-7 py-3.5 text-[11px] uppercase tracking-[0.22em] text-[#f4efe8] backdrop-blur-sm transition hover:border-[#c9a08a] hover:bg-[#c9a08a]/20"
            >
              {t("atelierCta")}
              <span className="transition group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
