import { getSection } from "@/lib/server/cms";
import {
  getPublicGtmConfig,
  type PublicGtmConfig,
} from "@/lib/server/gtm";
import {
  getPublicMetaPixelConfig,
  type PublicMetaPixelConfig,
} from "@/lib/server/meta-pixel";

export type PublicGa4Config = {
  enabled: boolean;
  measurementId: string;
};

export type PublicGoogleAdsConfig = {
  enabled: boolean;
  conversionId: string;
  conversionLabel: string;
};

export type PublicTikTokConfig = {
  enabled: boolean;
  pixelId: string;
};

export type PublicAnalyticsConfig = {
  gtm: PublicGtmConfig;
  meta: PublicMetaPixelConfig;
  ga4: PublicGa4Config;
  googleAds: PublicGoogleAdsConfig;
  tiktok: PublicTikTokConfig;
};

function asObj(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === "object"
    ? (raw as Record<string, unknown>)
    : {};
}

function nest(data: Record<string, unknown>, key: string) {
  return asObj(data[key]);
}

function readGa4(data: Record<string, unknown>): PublicGa4Config {
  const ga4 = nest(data, "ga4");
  const measurementId = String(ga4.measurementId ?? "")
    .trim()
    .toUpperCase();
  const valid = /^G-[A-Z0-9]+$/.test(measurementId);
  const enabled = ga4.ga4Enabled === true && valid;
  return {
    enabled,
    measurementId: enabled ? measurementId : "",
  };
}

function readGoogleAds(data: Record<string, unknown>): PublicGoogleAdsConfig {
  const ads = nest(data, "googleAds");
  let conversionId = String(ads.conversionId ?? "")
    .trim()
    .toUpperCase();
  if (conversionId && !conversionId.startsWith("AW-")) {
    conversionId = `AW-${conversionId.replace(/^AW-/, "")}`;
  }
  const conversionLabel = String(ads.conversionLabel ?? "").trim();
  const valid = /^AW-\d+$/.test(conversionId);
  const enabled = ads.adsEnabled === true && valid;
  return {
    enabled,
    conversionId: enabled ? conversionId : "",
    conversionLabel: enabled ? conversionLabel : "",
  };
}

function readTikTok(data: Record<string, unknown>): PublicTikTokConfig {
  const tiktok = nest(data, "tiktok");
  const pixelId = String(tiktok.pixelId ?? "").trim();
  const valid = /^[A-Za-z0-9]{10,64}$/.test(pixelId);
  const enabled = tiktok.tiktokEnabled === true && valid;
  return {
    enabled,
    pixelId: enabled ? pixelId : "",
  };
}

export async function getPublicAnalyticsConfig(): Promise<PublicAnalyticsConfig> {
  const [gtm, meta, section] = await Promise.all([
    getPublicGtmConfig(),
    getPublicMetaPixelConfig(),
    getSection("settings").catch(() => null),
  ]);
  const data = asObj(section?.data);

  return {
    gtm,
    meta,
    ga4: readGa4(data),
    googleAds: readGoogleAds(data),
    tiktok: readTikTok(data),
  };
}
