import { getSection } from "@/lib/server/cms";
import { sectionDefaults } from "@/lib/cms/defaults";

export type ShippingSettings = {
  shippingFeeDefault: number;
  freeShippingOver: number;
  codEnabled: boolean;
  codNoteEn: string;
  codNoteBn: string;
};

function asNumber(value: unknown, fallback: number) {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

export async function getShippingSettings(): Promise<ShippingSettings> {
  const defaults = sectionDefaults.shipping as ShippingSettings;
  try {
    const section = await getSection("shipping");
    const data = (section?.data || {}) as Record<string, unknown>;
    return {
      shippingFeeDefault: asNumber(
        data.shippingFeeDefault,
        defaults.shippingFeeDefault,
      ),
      freeShippingOver: asNumber(
        data.freeShippingOver,
        defaults.freeShippingOver,
      ),
      codEnabled:
        typeof data.codEnabled === "boolean"
          ? data.codEnabled
          : defaults.codEnabled,
      codNoteEn: String(data.codNoteEn ?? defaults.codNoteEn),
      codNoteBn: String(data.codNoteBn ?? defaults.codNoteBn),
    };
  } catch {
    return defaults;
  }
}

export function computeShippingFee(
  subtotal: number,
  settings: ShippingSettings,
) {
  if (
    settings.freeShippingOver > 0 &&
    subtotal >= settings.freeShippingOver
  ) {
    return 0;
  }
  return settings.shippingFeeDefault;
}
