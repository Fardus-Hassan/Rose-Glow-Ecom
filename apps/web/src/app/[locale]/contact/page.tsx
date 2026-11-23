import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "@/components/contact/ContactForm";
import { EditorialPageHeader } from "@/components/layout/EditorialPageHeader";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { fetchCmsPage, fetchContactContent } from "@/lib/catalog";
import { buildPageMetadata } from "@/lib/seo";
import { localize } from "@/data/products";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  const page = await fetchCmsPage("contact");
  return buildPageMetadata({
    path: "/contact",
    locale,
    fallbackTitle: page
      ? localize(page.seoTitle, locale) || localize(page.title, locale)
      : `${t("title")} · Rose Glow`,
    fallbackDescription: page
      ? localize(page.seoDescription, locale) || localize(page.body, locale)
      : t("sub"),
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");
  const siteContact = await fetchContactContent();
  const address =
    locale === "bn" ? siteContact.addressBn : siteContact.addressEn;
  const hours = locale === "bn" ? siteContact.hoursBn : siteContact.hoursEn;

  return (
    <div className="relative overflow-hidden bg-[color:var(--rg-paper)] pb-16 pt-28 md:pb-24 md:pt-36">
      <div
        className="rg-editorial-grid pointer-events-none absolute inset-0 opacity-45"
        aria-hidden
      />

      <div className="container-rg relative">
        <EditorialPageHeader
          eyebrow={t("eyebrow")}
          title={t("title")}
          lead={t("sub")}
        />

        <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14 xl:gap-20">
          <aside className="space-y-8 lg:pt-2">
            {(
              [
                [t("whatsappLabel"), siteContact.whatsappHref, siteContact.whatsappDisplay, t("whatsappHint")],
                [t("callLabel"), siteContact.phoneTel, siteContact.phoneDisplay, null],
                [t("emailLabel"), siteContact.emailHref, siteContact.email, null],
              ] as const
            ).map(([label, href, display, hint]) => (
              <div
                key={label}
                className="border-t border-[color:var(--rg-line)] pt-6"
              >
                <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--rg-muted)]">
                  {label}
                </p>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  className="mt-2 inline-block font-display text-xl text-[color:var(--rg-charcoal)] transition hover:text-[color:var(--rg-accent)]"
                >
                  {display}
                </a>
                {hint ? (
                  <p className="mt-1 text-xs text-[color:var(--rg-muted)]">
                    {hint}
                  </p>
                ) : null}
              </div>
            ))}

            <div className="border-t border-[color:var(--rg-line)] pt-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--rg-muted)]">
                {t("addressLabel")}
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--rg-charcoal)]">
                {address}
              </p>
            </div>

            <div className="border-t border-[color:var(--rg-line)] pt-6">
              <p className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--rg-muted)]">
                {t("hoursLabel")}
              </p>
              <p className="mt-2 text-sm leading-7 text-[color:var(--rg-charcoal)]">
                {hours}
              </p>
            </div>

            <div className="border-t border-[color:var(--rg-line)] pt-6">
              <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-[color:var(--rg-muted)]">
                {t("follow")}
              </p>
              <SocialLinks tone="dark" />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <a
                href={siteContact.whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="rg-cta-solid"
              >
                {t("chatWhatsapp")}
              </a>
              <a href={siteContact.phoneTel} className="rg-cta-ghost">
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
