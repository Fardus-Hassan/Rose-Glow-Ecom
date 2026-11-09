import { getTranslations, setRequestLocale } from "next-intl/server";
import { CartView } from "@/components/bag/CartView";

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Cart");

  return (
    <div className="container-rg pb-16 pt-28 md:pb-24 md:pt-36">
      <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
        {t("eyebrow")}
      </p>
      <h1 className="mt-3 font-display text-4xl text-[#1c1a19] md:text-5xl">
        {t("title")}
      </h1>
      <div className="mt-4 h-px w-12 bg-gradient-to-r from-[#c9a08a] to-transparent" />
      <div className="mt-10 md:mt-12">
        <CartView />
      </div>
    </div>
  );
}
