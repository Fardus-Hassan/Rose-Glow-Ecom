export type SeoData = {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  noIndex?: boolean;
};

export type SectionKey =
  | "home"
  | "about"
  | "contactPage"
  | "settings"
  | "navigation"
  | "footer"
  | "shipping"
  | "seoDefaults";
