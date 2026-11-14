import type { LucideIcon } from "lucide-react";
import {
  Home,
  Info,
  Mail,
  Menu,
  Settings,
  Share2,
  Truck,
  SearchCheck,
} from "lucide-react";
import type { SectionKey } from "./types";

type Base = {
  name: string;
  label: string;
  help?: string;
  placeholder?: string;
  width?: "half" | "full";
};

export type Field =
  | (Base & { type: "text"; maxLength?: number })
  | (Base & { type: "textarea"; rows?: number })
  | (Base & { type: "number"; min?: number; max?: number })
  | (Base & { type: "url" })
  | (Base & { type: "image" })
  | (Base & { type: "video" })
  | (Base & { type: "toggle" })
  | (Base & { type: "select"; options: { value: string; label: string }[] })
  | (Base & { type: "link" })
  | (Base & { type: "list"; addLabel?: string })
  | (Base & {
      type: "repeater";
      fields: Field[];
      itemTitle?: string;
      addLabel?: string;
      max?: number;
    })
  | (Base & { type: "group"; fields: Field[] });

export type Panel = {
  title: string;
  description?: string;
  path?: string;
  fields: Field[];
};

export type SectionSchema = {
  key: SectionKey;
  label: string;
  description: string;
  icon: LucideIcon;
  group: "Pages" | "Site settings";
  path?: string;
  seo?: boolean;
  panels: Panel[];
};

const text = (
  name: string,
  label: string,
  extra: Partial<Base> & { maxLength?: number } = {},
): Field => ({ type: "text", name, label, ...extra });

const textarea = (
  name: string,
  label: string,
  extra: Partial<Base> & { rows?: number } = {},
): Field => ({ type: "textarea", name, label, ...extra });

const number = (
  name: string,
  label: string,
  extra: Partial<Base> & { min?: number; max?: number; help?: string } = {},
): Field => ({ type: "number", name, label, ...extra });

const half = (field: Field): Field => ({ ...field, width: "half" });
const image = (name: string, label: string, help?: string): Field => ({
  type: "image",
  name,
  label,
  help,
});
const video = (name: string, label: string, help?: string): Field => ({
  type: "video",
  name,
  label,
  help,
});
const url = (name: string, label: string): Field => ({
  type: "url",
  name,
  label,
  width: "half",
});
const toggle = (name: string, label: string, help?: string): Field => ({
  type: "toggle",
  name,
  label,
  help,
});
const link = (name: string, label: string): Field => ({
  type: "link",
  name,
  label,
});
const list = (name: string, label: string, addLabel = "Add item"): Field => ({
  type: "list",
  name,
  label,
  addLabel,
});

export const sectionSchemas: SectionSchema[] = [
  {
    key: "home",
    label: "Home page",
    description: "Hero, promise bar copy, and homepage section headings.",
    icon: Home,
    group: "Pages",
    path: "/",
    seo: true,
    panels: [
      {
        title: "Hero",
        description: "First viewport of the storefront.",
        path: "hero",
        fields: [
          half(text("eyebrowEn", "Eyebrow (EN)")),
          half(text("eyebrowBn", "Eyebrow (BN)")),
          half(text("headlineEn", "Headline (EN)")),
          half(text("headlineBn", "Headline (BN)")),
          textarea("bodyEn", "Body (EN)", { rows: 3 }),
          textarea("bodyBn", "Body (BN)", { rows: 3 }),
          half(text("ctaEn", "CTA label (EN)")),
          half(text("ctaBn", "CTA label (BN)")),
          {
            type: "select",
            name: "mode",
            label: "Hero media mode",
            width: "half",
            options: [
              { value: "image", label: "Image" },
              { value: "video", label: "Video" },
            ],
          },
          toggle(
            "overlayDesktop",
            "Dark overlay — laptop / desktop",
            "Keeps headline/CTA readable on large screens. Turn off for a clean full-bleed look.",
          ),
          half(
            number("overlayDepthDesktop", "Overlay depth — laptop", {
              min: 0,
              max: 100,
              help: "0 = very light, 50 = medium, 100 = deepest",
            }),
          ),
          toggle(
            "overlayMobile",
            "Dark overlay — mobile",
            "Same overlay control for phones and small tablets.",
          ),
          half(
            number("overlayDepthMobile", "Overlay depth — mobile", {
              min: 0,
              max: 100,
              help: "0 = very light, 50 = medium, 100 = deepest",
            }),
          ),
          image("imageDesktop", "Desktop image"),
          image("imageMobile", "Mobile image"),
          video(
            "videoDesktop",
            "Desktop video",
            "Pick an MP4 from the media library when mode is video",
          ),
          video("videoMobile", "Mobile video"),
        ],
      },
      {
        title: "Featured strip",
        path: "featured",
        fields: [
          half(text("titleEn", "Title (EN)")),
          half(text("titleBn", "Title (BN)")),
          textarea("subEn", "Subtitle (EN)", { rows: 2 }),
          textarea("subBn", "Subtitle (BN)", { rows: 2 }),
        ],
      },
      {
        title: "Reviews strip",
        path: "reviews",
        fields: [
          half(text("titleEn", "Title (EN)")),
          half(text("titleBn", "Title (BN)")),
          textarea("subEn", "Subtitle (EN)", { rows: 2 }),
          textarea("subBn", "Subtitle (BN)", { rows: 2 }),
        ],
      },
    ],
  },
  {
    key: "about",
    label: "About page",
    description: "Atelier story and pillars.",
    icon: Info,
    group: "Pages",
    path: "/about",
    seo: true,
    panels: [
      {
        title: "Story",
        fields: [
          half(text("eyebrowEn", "Eyebrow (EN)")),
          half(text("eyebrowBn", "Eyebrow (BN)")),
          half(text("titleEn", "Title (EN)")),
          half(text("titleBn", "Title (BN)")),
          textarea("leadEn", "Lead (EN)", { rows: 4 }),
          textarea("leadBn", "Lead (BN)", { rows: 4 }),
          image("image", "Hero image"),
          half(text("ctaEn", "CTA (EN)")),
          half(text("ctaBn", "CTA (BN)")),
        ],
      },
      {
        title: "Pillars",
        fields: [
          {
            type: "repeater",
            name: "pillars",
            label: "Pillars",
            itemTitle: "titleEn",
            addLabel: "Add pillar",
            max: 6,
            fields: [
              half(text("titleEn", "Title (EN)")),
              half(text("titleBn", "Title (BN)")),
              textarea("bodyEn", "Body (EN)", { rows: 2 }),
              textarea("bodyBn", "Body (BN)", { rows: 2 }),
            ],
          },
        ],
      },
    ],
  },
  {
    key: "contactPage",
    label: "Contact page",
    description: "Contact intro and form labels.",
    icon: Mail,
    group: "Pages",
    path: "/contact",
    seo: true,
    panels: [
      {
        title: "Header",
        fields: [
          half(text("eyebrowEn", "Eyebrow (EN)")),
          half(text("eyebrowBn", "Eyebrow (BN)")),
          half(text("titleEn", "Title (EN)")),
          half(text("titleBn", "Title (BN)")),
          textarea("subEn", "Subtitle (EN)", { rows: 3 }),
          textarea("subBn", "Subtitle (BN)", { rows: 3 }),
        ],
      },
    ],
  },
  {
    key: "settings",
    label: "General",
    description: "Brand, contact details and social profiles.",
    icon: Settings,
    group: "Site settings",
    panels: [
      {
        title: "Brand",
        fields: [
          half(text("storeName", "Store name")),
          image("logo", "Logo"),
          textarea("taglineEn", "Tagline (EN)", { rows: 2 }),
          textarea("taglineBn", "Tagline (BN)", { rows: 2 }),
        ],
      },
      {
        title: "Contact",
        path: "contact",
        fields: [
          half(text("phone", "Phone")),
          half(text("whatsapp", "WhatsApp number")),
          half(text("email", "Email")),
          half(text("addressEn", "Address (EN)")),
          half(text("addressBn", "Address (BN)")),
          half(text("hoursEn", "Hours (EN)")),
          half(text("hoursBn", "Hours (BN)")),
        ],
      },
      {
        title: "Social links",
        path: "social",
        fields: [
          url("instagram", "Instagram"),
          url("facebook", "Facebook"),
          url("whatsapp", "WhatsApp link"),
          url("tiktok", "TikTok"),
        ],
      },
    ],
  },
  {
    key: "navigation",
    label: "Navigation",
    description: "Header links and featured pick.",
    icon: Menu,
    group: "Site settings",
    panels: [
      {
        title: "Menu",
        fields: [
          {
            type: "repeater",
            name: "links",
            label: "Menu links",
            itemTitle: "labelEn",
            addLabel: "Add link",
            fields: [
              half(text("labelEn", "Label (EN)")),
              half(text("labelBn", "Label (BN)")),
              url("href", "Path"),
            ],
          },
          text("featuredProductSlug", "Featured product slug", {
            help: "Shown in the shop mega-menu special pick",
          }),
        ],
      },
    ],
  },
  {
    key: "footer",
    label: "Footer",
    description: "Footer tagline and newsletter copy.",
    icon: Share2,
    group: "Site settings",
    panels: [
      {
        title: "Copy",
        fields: [
          textarea("taglineEn", "Tagline (EN)", { rows: 2 }),
          textarea("taglineBn", "Tagline (BN)", { rows: 2 }),
          half(text("newsletterTitleEn", "Newsletter title (EN)")),
          half(text("newsletterTitleBn", "Newsletter title (BN)")),
          textarea("newsletterSubEn", "Newsletter sub (EN)", { rows: 2 }),
          textarea("newsletterSubBn", "Newsletter sub (BN)", { rows: 2 }),
          list("extraLinks", "Extra link labels", "Add label"),
        ],
      },
    ],
  },
  {
    key: "shipping",
    label: "Shipping & COD",
    description: "Delivery fees and free-shipping threshold.",
    icon: Truck,
    group: "Site settings",
    panels: [
      {
        title: "Rules",
        fields: [
          half({
            type: "number",
            name: "shippingFeeDefault",
            label: "Default shipping (BDT)",
            min: 0,
          }),
          half({
            type: "number",
            name: "freeShippingOver",
            label: "Free shipping over (BDT)",
            min: 0,
          }),
          toggle("codEnabled", "Cash on delivery enabled"),
          textarea("codNoteEn", "COD note (EN)", { rows: 2 }),
          textarea("codNoteBn", "COD note (BN)", { rows: 2 }),
        ],
      },
    ],
  },
  {
    key: "seoDefaults",
    label: "SEO defaults",
    description: "Fallback title and description for the storefront.",
    icon: SearchCheck,
    group: "Site settings",
    panels: [
      {
        title: "Defaults",
        fields: [
          half(text("titleEn", "Default title (EN)")),
          half(text("titleBn", "Default title (BN)")),
          textarea("descriptionEn", "Default description (EN)", { rows: 3 }),
          textarea("descriptionBn", "Default description (BN)", { rows: 3 }),
          text("keywords", "Keywords"),
          image("ogImage", "Default OG image"),
        ],
      },
    ],
  },
];

export function getSectionSchema(key: string) {
  return sectionSchemas.find((s) => s.key === key);
}

export function emptyForField(field: Field): unknown {
  switch (field.type) {
    case "toggle":
      return false;
    case "number":
      return 0;
    case "list":
    case "repeater":
      return [];
    case "group":
    case "link":
      return {};
    default:
      return "";
  }
}
