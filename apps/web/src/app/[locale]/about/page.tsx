import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");

  return (
    <div className="pb-16 pt-28 md:pb-24 md:pt-36">
      <div className="container-rg max-w-3xl">
        <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.05] tracking-[-0.03em] text-[#1c1a19]">
          {t("title")}
        </h1>
        <div className="mt-5 h-px w-14 bg-gradient-to-r from-[#c9a08a] to-transparent" />
        <p className="mt-8 text-base leading-8 text-[#1c1a19]/65 md:text-lg md:leading-9">
          {t("lead")}
        </p>
      </div>

      <div className="container-rg mt-14 grid gap-10 md:mt-20 md:grid-cols-3 md:gap-8">
        {(
          [
            [t("pillar1Title"), t("pillar1Body")],
            [t("pillar2Title"), t("pillar2Body")],
            [t("pillar3Title"), t("pillar3Body")],
          ] as const
        ).map(([title, body]) => (
          <div key={title} className="border-t border-[#1c1a19]/10 pt-6">
            <h2 className="font-display text-2xl text-[#1c1a19]">{title}</h2>
            <p className="mt-3 text-sm leading-7 text-[#1c1a19]/55">{body}</p>
          </div>
        ))}
      </div>

      <div className="container-rg mt-14 md:mt-20">
        <Link
          href="/products"
          className="inline-flex min-h-12 items-center justify-center bg-[#1c1a19] px-8 text-[11px] uppercase tracking-[0.2em] text-[#f4efe8] transition hover:bg-black"
        >
          {t("cta")}
        </Link>
      </div>
    </div>
  );
}
