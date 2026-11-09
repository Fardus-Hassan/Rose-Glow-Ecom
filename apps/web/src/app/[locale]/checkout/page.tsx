import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckoutView } from "@/components/bag/CheckoutView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Checkout" });
  return { title: `${t("title")} · Rose Glow` };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container-rg pb-16 pt-28 md:pb-24 md:pt-36">
      <CheckoutView />
    </div>
  );
}
