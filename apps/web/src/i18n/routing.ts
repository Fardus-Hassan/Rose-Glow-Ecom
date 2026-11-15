import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["bn", "en"],
  defaultLocale: "bn",
  localePrefix: "always",
  // Always open Bangla first — ignore browser Accept-Language
  localeDetection: false,
});

export type AppLocale = (typeof routing.locales)[number];
