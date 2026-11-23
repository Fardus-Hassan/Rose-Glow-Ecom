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
    <div className="relative overflow-hidden bg-[color:var(--rg-paper)] pb-16 pt-28 md:pb-24 md:pt-36">
      <div
        className="rg-editorial-grid pointer-events-none absolute inset-0 opacity-35"
        aria-hidden
      />
      <div className="container-rg relative">
        <CheckoutView />
      </div>
    </div>
  );
}
