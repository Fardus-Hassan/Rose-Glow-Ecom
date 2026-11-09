import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact/ContactForm";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { siteContact } from "@/data/contact";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");
  const address =
    locale === "bn" ? siteContact.addressBn : siteContact.addressEn;
  const hours = locale === "bn" ? siteContact.hoursBn : siteContact.hoursEn;

  return (
    <div className="pb-16 pt-28 md:pb-24 md:pt-36">
      <div className="container-rg">
        <div className="max-w-2xl">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.08] tracking-[-0.03em] text-[#1c1a19]">
            {t("title")}
          </h1>
          <div className="mt-4 h-px w-12 bg-gradient-to-r from-[#c9a08a] to-transparent" />
          <p className="mt-6 max-w-md text-sm leading-7 text-[#1c1a19]/55 md:text-[15px] md:leading-8">
            {t("sub")}
          </p>
        </div>

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14 xl:gap-20">
          <aside className="space-y-8 lg:pt-2">
            <div className="border-t border-[#1c1a19]/10 pt-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c1a19]/4">
                {t("whatsappLabel")}
              </p>
              <a
                href={siteContact.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block text-lg text-[#1c1a19] transition hover:text-[#a67c68]"
              >
                {siteContact.whatsappDisplay}
              </a>
              <p className="mt-1 text-xs text-[#1c1a19]/45">{t("whatsappHint")}</p>
            </div>

            <div className="border-t border-[#1c1a19]/10 pt-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c1a19]/4">
                {t("callLabel")}
              </p>
              <a
                href={siteContact.phoneTel}
                className="mt-2 inline-block text-lg text-[#1c1a19] transition hover:text-[#a67c68]"
              >
                {siteContact.phoneDisplay}
              </a>
            </div>

            <div className="border-t border-[#1c1a19]/10 pt-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c1a19]/4">
                {t("emailLabel")}
              </p>
              <a
                href={siteContact.emailHref}
                className="mt-2 inline-block text-lg text-[#1c1a19] transition hover:text-[#a67c68]"
              >
                {siteContact.email}
              </a>
            </div>

            <div className="border-t border-[#1c1a19]/10 pt-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c1a19]/4">
                {t("addressLabel")}
              </p>
              <p className="mt-2 text-sm leading-7 text-[#1c1a19]">{address}</p>
            </div>

            <div className="border-t border-[#1c1a19]/10 pt-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#1c1a19]/4">
                {t("hoursLabel")}
              </p>
              <p className="mt-2 text-sm leading-7 text-[#1c1a19]">{hours}</p>
            </div>

            <div className="border-t border-[#1c1a19]/10 pt-6">
              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[#1c1a19]/4">
                {t("follow")}
              </p>
              <SocialLinks tone="dark" />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={siteContact.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center bg-[#1c1a19] px-5 text-[10px] uppercase tracking-[0.18em] text-[#f4efe8] transition hover:bg-black"
              >
                {t("chatWhatsapp")}
              </a>
              <a
                href={siteContact.phoneTel}
                className="inline-flex min-h-11 items-center justify-center border border-[#1c1a19]/2 px-5 text-[10px] uppercase tracking-[0.18em] text-[#1c1a19] transition hover:border-[#1c1a19]"
              >
                {t("callNow")}
              </a>
            </div>
          </aside>

          <ContactForm />
        </div>
      </div>
    </div>
  );
}
