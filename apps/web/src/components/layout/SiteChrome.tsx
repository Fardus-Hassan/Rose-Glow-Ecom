"use client";

import { usePathname } from "@/i18n/navigation";
import { Header } from "./Header";
import { FooterClient } from "./FooterClient";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname.startsWith("/l/");

  return (
    <>
      {isLanding ? null : <Header />}
      <main className="flex-1 bg-[color:var(--rg-paper)]">{children}</main>
      {isLanding ? null : <FooterClient />}
    </>
  );
}
