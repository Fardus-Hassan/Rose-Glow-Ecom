"use client";

import { Suspense } from "react";
import type { PublicAnalyticsConfig } from "@/lib/server/analytics";
import { MetaPixel } from "@/components/analytics/MetaPixel";
import { GoogleTagManager } from "@/components/analytics/GoogleTagManager";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { GoogleAds } from "@/components/analytics/GoogleAds";
import { TikTokPixel } from "@/components/analytics/TikTokPixel";

export function StorefrontAnalytics({
  config,
}: {
  config: PublicAnalyticsConfig;
}) {
  return (
    <>
      <MetaPixel config={config.meta} />
      <Suspense fallback={null}>
        <GoogleTagManager config={config.gtm} />
      </Suspense>
      <GoogleAnalytics config={config.ga4} />
      <GoogleAds config={config.googleAds} />
      <TikTokPixel config={config.tiktok} />
    </>
  );
}
