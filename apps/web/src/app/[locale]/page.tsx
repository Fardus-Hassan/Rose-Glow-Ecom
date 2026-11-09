import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/home/Hero";
import { PromiseBar } from "@/components/home/PromiseBar";
import { Spotlight } from "@/components/home/Spotlight";
import { FeaturedSection } from "@/components/home/FeaturedSection";
import { CollectionsStrip } from "@/components/home/CollectionsStrip";
import { ReviewsSection } from "@/components/home/ReviewsSection";
import { AtelierBand } from "@/components/home/AtelierBand";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <PromiseBar />
      <Spotlight />
      <FeaturedSection />
      <CollectionsStrip />
      <ReviewsSection />
      <AtelierBand />
    </>
  );
}
