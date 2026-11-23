import { getTranslations, setRequestLocale } from "next-intl/server";
import { WishlistView } from "@/components/bag/WishlistView";
import { EditorialPageHeader } from "@/components/layout/EditorialPageHeader";

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Wishlist");

  return (
    <div className="relative overflow-hidden bg-[color:var(--rg-paper)] pb-16 pt-28 md:pb-24 md:pt-36">
      <div
        className="rg-editorial-grid pointer-events-none absolute inset-0 opacity-40"
        aria-hidden
      />
      <div className="container-rg relative">
        <EditorialPageHeader eyebrow={t("eyebrow")} title={t("title")} />
        <div className="mt-10 md:mt-12">
          <WishlistView />
        </div>
      </div>
    </div>
  );
}
