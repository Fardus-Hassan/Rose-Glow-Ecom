import { getTranslations, setRequestLocale } from "next-intl/server";
import { PearlBloomLanding } from "@/components/landing/PearlBloomLanding";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "LandingPearl" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function PearlBloomLandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="pb-20 lg:pb-0">
      <PearlBloomLanding />
    </div>
  );
}
