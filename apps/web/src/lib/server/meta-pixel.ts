import { createHash } from "crypto";
import { getSection } from "@/lib/server/cms";

export type MetaPixelSettings = {
  enabled: boolean;
  pixelId: string;
  testEventCode: string;
  capiAccessToken: string;
};

export type PublicMetaPixelConfig = {
  enabled: boolean;
  pixelId: string;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function readMeta(raw: unknown): MetaPixelSettings {
  const meta =
    raw && typeof raw === "object"
      ? ((raw as Record<string, unknown>).meta as
          | Record<string, unknown>
          | undefined)
      : undefined;
  const pixelId = String(meta?.pixelId ?? "").trim();
  const enabled = meta?.pixelEnabled === true && /^\d{5,30}$/.test(pixelId);
  return {
    enabled,
    pixelId,
    testEventCode: String(meta?.testEventCode ?? "").trim(),
    capiAccessToken: String(meta?.capiAccessToken ?? "").trim(),
  };
}

export async function getMetaPixelSettings(): Promise<MetaPixelSettings> {
  try {
    const section = await getSection("settings");
    return readMeta(section.data);
  } catch {
    return {
      enabled: false,
      pixelId: "",
      testEventCode: "",
      capiAccessToken: "",
    };
  }
}

export async function getPublicMetaPixelConfig(): Promise<PublicMetaPixelConfig> {
  const full = await getMetaPixelSettings();
  return {
    enabled: full.enabled,
    pixelId: full.enabled ? full.pixelId : "",
  };
}

type CapiPurchaseInput = {
  eventId: string;
  value: number;
  currency?: string;
  orderNumber: string;
  contents: Array<{ id: string; quantity: number; item_price: number }>;
  customer?: {
    phone?: string;
    email?: string;
    name?: string;
  };
  eventSourceUrl?: string;
  clientIp?: string;
  userAgent?: string;
};

/** Server-side Purchase for dedupe with browser pixel (same event_id). */
export async function sendMetaCapiPurchase(input: CapiPurchaseInput) {
  const cfg = await getMetaPixelSettings();
  if (!cfg.enabled || !cfg.pixelId || !cfg.capiAccessToken) return;

  const userData: Record<string, unknown> = {
    client_ip_address: input.clientIp || undefined,
    client_user_agent: input.userAgent || undefined,
  };

  const phone = input.customer?.phone?.replace(/\D/g, "");
  if (phone) userData.ph = [sha256(phone)];

  const email = input.customer?.email?.toLowerCase().trim();
  if (email) userData.em = [sha256(email)];

  const first = input.customer?.name?.trim().split(/\s+/)[0]?.toLowerCase();
  if (first) userData.fn = [sha256(first)];

  const event: Record<string, unknown> = {
    event_name: "Purchase",
    event_time: Math.floor(Date.now() / 1000),
    event_id: input.eventId,
    action_source: "website",
    event_source_url: input.eventSourceUrl,
    user_data: userData,
    custom_data: {
      currency: input.currency || "BDT",
      value: input.value,
      content_type: "product",
      contents: input.contents,
      order_id: input.orderNumber,
      num_items: input.contents.reduce((s, c) => s + c.quantity, 0),
    },
  };

  const body: Record<string, unknown> = {
    data: [event],
    access_token: cfg.capiAccessToken,
  };
  if (cfg.testEventCode) body.test_event_code = cfg.testEventCode;

  try {
    await fetch(`https://graph.facebook.com/v21.0/${cfg.pixelId}/events`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // Never block checkout on analytics failure
  }
}
