import { getTranslations } from "next-intl/server";
import {
  IconGem,
  IconShield,
  IconSupport,
  IconTruck,
} from "@/components/icons";

export async function TrustStrip() {
  const t = await getTranslations("Home");

  const items = [
    { icon: IconGem, label: t("trustQuality") },
    { icon: IconTruck, label: t("trustDelivery") },
    { icon: IconShield, label: t("trustPayment") },
    { icon: IconSupport, label: t("trustSupport") },
  ];

  return (
    <section className="border-b border-[color:var(--rg-line)] bg-[color:var(--rg-paper)]">
      <div className="container-rg grid grid-cols-2 gap-6 py-7 md:grid-cols-4 md:gap-4 md:py-8">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3 md:justify-center">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[color:var(--rg-blush)] text-[color:var(--rg-pink-deep)]">
              <Icon className="h-5 w-5" />
            </span>
            <p className="text-xs font-medium leading-5 text-[color:var(--rg-ink)] md:text-[13px]">
              {label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
