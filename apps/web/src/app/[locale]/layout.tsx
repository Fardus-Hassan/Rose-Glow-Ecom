import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import {
  Cormorant_Garamond,
  Hind_Siliguri,
  Manrope,
  Noto_Serif_Bengali,
} from "next/font/google";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SmoothScroll } from "@/components/providers/SmoothScroll";
import { BagProvider } from "@/store/bag";
import "../globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

/** Elegant Bengali display — pairs with Cormorant for headings */
const displayBn = Noto_Serif_Bengali({
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display-bn",
  display: "swap",
});

/** Clean premium Bengali UI/body */
const sansBn = Hind_Siliguri({
  subsets: ["bengali", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-bn",
  display: "swap",
});

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

  return {
    title: t("title"),
    description: t("description"),
    icons: {
      icon: [{ url: "/brand/logo.png", type: "image/png" }],
      apple: [{ url: "/brand/logo.png", type: "image/png" }],
      shortcut: "/brand/logo.png",
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
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${display.variable} ${sans.variable} ${displayBn.variable} ${sansBn.variable} h-full`}
    >
      <body
        className={`locale-${locale} flex min-h-full flex-col antialiased`}
        suppressHydrationWarning
      >
        <NextIntlClientProvider messages={messages}>
          <BagProvider>
            <SmoothScroll>
              <Header />
              <main className="flex-1 bg-[color:var(--rg-paper)]">{children}</main>
              <Footer />
            </SmoothScroll>
          </BagProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
