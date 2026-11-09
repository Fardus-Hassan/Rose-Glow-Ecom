import { getTranslations, setRequestLocale } from "next-intl/server";
import { products } from "@/data/products";
import { ProductsView } from "@/components/products/ProductsView";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Products" });
  return {
    title: `${t("title")} · Rose Glow`,
    description: t("subtitle"),
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations("Products");

  return (
    <div className="bg-[#f0ebe4] pb-20 md:pb-28">
      <section className="border-b border-white/10 bg-[#0e0d0c] text-[#f4efe8]">
        <div className="container-rg pb-12 pt-28 md:pb-16 md:pt-32">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[#c9a08a]">
            {t("eyebrow")}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.4rem,6vw,4.25rem)] leading-[1.05] tracking-[-0.02em]">
            {t("title")}
          </h1>
          <div className="mt-5 h-px w-14 bg-gradient-to-r from-[#c9a08a] to-transparent" />
          <p className="mt-5 max-w-xl text-[15px] leading-7 text-[#f4efe8]/58 md:text-base">
            {t("subtitle")}
          </p>
        </div>
      </section>

      <div className="container-rg pt-10 md:pt-14">
        <ProductsView products={products} initialCategory={category} />
      </div>
    </div>
  );
}
