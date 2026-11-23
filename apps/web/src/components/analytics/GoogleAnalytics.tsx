"use client";

import Script from "next/script";
import type { PublicGa4Config } from "@/lib/server/analytics";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics({ config }: { config: PublicGa4Config }) {
  if (!config.enabled || !config.measurementId) return null;
  const id = config.measurementId;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`}
        strategy="afterInteractive"
      />
      <Script id="ga4-base" strategy="afterInteractive">{`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('js', new Date());
gtag('config', ${JSON.stringify(id)}, { send_page_view: true });
      `}</Script>
    </>
  );
}
