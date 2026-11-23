"use client";

import { useEffect } from "react";
import Script from "next/script";
import type { PublicGoogleAdsConfig } from "@/lib/server/analytics";

export function GoogleAds({ config }: { config: PublicGoogleAdsConfig }) {
  useEffect(() => {
    if (!config.enabled || !config.conversionId) {
      delete window.__rgGoogleAds;
      return;
    }
    window.__rgGoogleAds = {
      conversionId: config.conversionId,
      conversionLabel: config.conversionLabel || "",
    };
  }, [config]);

  if (!config.enabled || !config.conversionId) return null;
  const id = config.conversionId;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads-base" strategy="afterInteractive">{`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('js', new Date());
gtag('config', ${JSON.stringify(id)});
      `}</Script>
    </>
  );
}
