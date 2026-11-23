"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname, useSearchParams } from "next/navigation";
import type { PublicGtmConfig } from "@/lib/server/gtm";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export function GoogleTagManager({ config }: { config: PublicGtmConfig }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const booted = useRef(false);

  useEffect(() => {
    if (!config.enabled || !config.containerId) return;
    window.dataLayer = window.dataLayer || [];

    if (!booted.current) {
      booted.current = true;
      return;
    }

    const page = `${pathname}${searchParams?.toString() ? `?${searchParams}` : ""}`;
    window.dataLayer.push({
      event: "page_view",
      page_path: page,
    });
  }, [pathname, searchParams, config.enabled, config.containerId]);

  if (!config.enabled || !config.containerId) return null;

  const id = config.containerId;

  return (
    <>
      <Script id="gtm-base" strategy="afterInteractive">{`
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer',${JSON.stringify(id)});
      `}</Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(id)}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
          title="Google Tag Manager"
        />
      </noscript>
    </>
  );
}
