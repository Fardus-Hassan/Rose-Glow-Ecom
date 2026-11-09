import { getTranslations } from "next-intl/server";
import { IconGem, IconShield, IconTruck } from "@/components/icons";

/**
 * Soft bridge under the hero — one compact row on mobile + desktop.
 */
export async function PromiseBar() {
  const t = await getTranslations("Home");

  const items = [
    { icon: IconShield, title: t("promiseCodTitle") },
    { icon: IconGem, title: t("promiseFinishTitle") },
    { icon: IconTruck, title: t("promiseDeliveryTitle") },
  ];

  return (
    <section className="border-b border-[#1c1a19]/08 bg-[#f0ebe4]">
      <div className="container-rg grid grid-cols-3 gap-2 py-4 sm:gap-4 sm:py-5">
        {items.map(({ icon: Icon, title }) => (
          <div
            key={title}
            className="flex flex-col items-center gap-1.5 text-center sm:flex-row sm:justify-center sm:gap-2.5"
          >
            <span className="flex h-7 w-7 shrink-0 items-center justify-center text-[#a67c68] sm:h-8 sm:w-8">
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </span>
            <p className="text-[9px] uppercase leading-snug tracking-[0.14em] text-[#1c1a19]/55 sm:text-[10px] sm:tracking-[0.18em] md:text-[11px]">
              {title}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
