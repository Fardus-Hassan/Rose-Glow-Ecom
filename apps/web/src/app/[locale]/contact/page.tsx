import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact/ContactForm";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");

  return (
    <div className="container-rg pb-16 pt-28 md:pb-24 md:pt-36">
      <div className="grid gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16">
        <div>
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-4xl text-[#1c1a19] md:text-5xl">
            {t("title")}
          </h1>
          <div className="mt-4 h-px w-12 bg-gradient-to-r from-[#c9a08a] to-transparent" />
          <p className="mt-6 max-w-md text-sm leading-7 text-[#1c1a19]/55">
            {t("sub")}
          </p>

          <dl className="mt-10 space-y-5 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-[#1c1a19]/4">
                {t("whatsappLabel")}
              </dt>
              <dd className="mt-1 text-[#1c1a19]">{t("whatsapp")}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-[#1c1a19]/4">
                {t("emailLabel")}
              </dt>
              <dd className="mt-1 text-[#1c1a19]">{t("email")}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.2em] text-[#1c1a19]/4">
                {t("hoursLabel")}
              </dt>
              <dd className="mt-1 text-[#1c1a19]">{t("hours")}</dd>
            </div>
          </dl>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
