"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import type { PublicMetaPixelConfig } from "@/lib/server/meta-pixel";
import { trackPageView } from "@/lib/meta-pixel";

export function MetaPixel({ config }: { config: PublicMetaPixelConfig }) {
  const pathname = usePathname();
  const booted = useRef(false);

  useEffect(() => {
    if (!config.enabled || !config.pixelId) return;
    window.__rgMetaPixelId = config.pixelId;
    if (!booted.current) {
      booted.current = true;
      return;
    }
    trackPageView();
  }, [pathname, config.enabled, config.pixelId]);

  if (!config.enabled || !config.pixelId) return null;

  const pixelId = config.pixelId;

  return (
    <>
      <Script id="meta-pixel-base" strategy="afterInteractive">{`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', ${JSON.stringify(pixelId)});
fbq('track', 'PageView');
      `}</Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${encodeURIComponent(pixelId)}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
