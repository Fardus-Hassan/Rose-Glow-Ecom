import { getSection } from "@/lib/server/cms";

export type GtmSettings = {
  enabled: boolean;
  containerId: string;
};

export type PublicGtmConfig = {
  enabled: boolean;
  containerId: string;
};

function normalizeContainerId(raw: string) {
  const value = raw.trim().toUpperCase();
  if (!value) return "";
  if (/^GTM-[A-Z0-9]+$/.test(value)) return value;
  if (/^[A-Z0-9]+$/.test(value)) return `GTM-${value}`;
  return "";
}

function readGtm(raw: unknown): GtmSettings {
  const root =
    raw && typeof raw === "object"
      ? (raw as Record<string, unknown>)
      : undefined;
  const gtm =
    root?.gtm && typeof root.gtm === "object"
      ? (root.gtm as Record<string, unknown>)
      : undefined;
  const containerId = normalizeContainerId(
    String(gtm?.containerId ?? gtm?.gtmId ?? ""),
  );
  const enabled = gtm?.gtmEnabled === true && Boolean(containerId);
  return { enabled, containerId };
}

export async function getGtmSettings(): Promise<GtmSettings> {
  try {
    const section = await getSection("settings");
    return readGtm(section.data);
  } catch {
    return { enabled: false, containerId: "" };
  }
}

export async function getPublicGtmConfig(): Promise<PublicGtmConfig> {
  const full = await getGtmSettings();
  return {
    enabled: full.enabled,
    containerId: full.enabled ? full.containerId : "",
  };
}
