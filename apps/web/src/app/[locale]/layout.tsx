import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SiteChrome } from "@/components/layout/SiteChrome";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { BagProvider } from "@/store/bag";
import { CatalogProvider } from "@/store/catalog";
import { buildPageMetadata } from "@/lib/seo";
import { mediaUrl } from "@/lib/media";
import { getPublicMetaPixelConfig } from "@/lib/server/meta-pixel";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Meta" });
  const seo = await buildPageMetadata({
    path: "/",
    locale,
    fallbackTitle: t("title"),
    fallbackDescription: t("description"),
  });

  return {
    ...seo,
    icons: {
      icon: [{ url: mediaUrl("/brand/logo.png"), type: "image/png" }],
      apple: [{ url: mediaUrl("/brand/logo.png"), type: "image/png" }],
      shortcut: mediaUrl("/brand/logo.png"),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const [messages, metaPixel] = await Promise.all([
    getMessages(),
    getPublicMetaPixelConfig(),
  ]);

  return (
    <div className={`locale-${locale} flex min-h-full flex-col`}>
      <NextIntlClientProvider messages={messages}>
        <CatalogProvider>
          <BagProvider>
            <SmoothScroll>
              <MetaPixel config={metaPixel} />
              <SiteChrome>{children}</SiteChrome>
            </SmoothScroll>
          </BagProvider>
        </CatalogProvider>
      </NextIntlClientProvider>
    </div>
  );
}
