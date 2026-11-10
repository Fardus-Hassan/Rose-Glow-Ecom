"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  categories as knownCategorySlugs,
  type Product,
  type ProductCategory,
} from "@/data/products";
import type { SocialLink } from "@/data/social";
import { getApiBase } from "@/lib/api";
import {
  mapApiProduct,
  type ApiProduct,
  type ContactContent,
} from "@/lib/catalog";
import { mediaUrl } from "@/lib/media";

type CatalogContextValue = {
  ready: boolean;
  products: Product[];
  categories: ProductCategory[];
  social: SocialLink[];
  contact: ContactContent;
  storeName: string;
  taglineEn: string;
  taglineBn: string;
  logo: string;
  getBySlug: (slug: string) => Product | undefined;
};

const emptyContact: ContactContent = {
  phoneDisplay: "",
  phoneTel: "tel:",
  whatsappDisplay: "",
  whatsappHref: "https://wa.me/",
  email: "",
  emailHref: "mailto:",
  addressEn: "",
  addressBn: "",
  hoursEn: "",
  hoursBn: "",
};

const CatalogContext = createContext<CatalogContextValue | null>(null);

function mapContact(value: Record<string, string>): ContactContent {
  const phone = value.phone || "";
  const digits = phone.replace(/[^\d+]/g, "");
  const wa = (value.whatsapp || digits).replace(/[^\d]/g, "");
  return {
    phoneDisplay: phone,
    phoneTel: digits
      ? digits.startsWith("+")
        ? `tel:${digits}`
        : `tel:+${digits}`
      : "tel:",
    whatsappDisplay: value.whatsapp || phone,
    whatsappHref: wa ? `https://wa.me/${wa}` : "https://wa.me/",
    email: value.email || "",
    emailHref: value.email ? `mailto:${value.email}` : "mailto:",
    addressEn: value.addressEn || "",
    addressBn: value.addressBn || "",
    hoursEn: value.hoursEn || "",
    hoursBn: value.hoursBn || "",
  };
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [social, setSocial] = useState<SocialLink[]>([]);
  const [contact, setContact] = useState<ContactContent>(emptyContact);
  const [storeName, setStoreName] = useState("");
  const [taglineEn, setTaglineEn] = useState("");
  const [taglineBn, setTaglineBn] = useState("");
  const [logo, setLogo] = useState(mediaUrl("/brand/logo.png"));

  useEffect(() => {
    let cancelled = false;
    const base = getApiBase();

    const load = async () => {
      try {
        const [productsRes, categoriesRes, settingsRes] = await Promise.all([
          fetch(`${base}/products?page=1&pageSize=100`, { cache: "no-store" }),
          fetch(`${base}/categories?active=1`, { cache: "no-store" }),
          fetch(`${base}/cms/sections/settings`, { cache: "no-store" }),
        ]);

        if (!cancelled && productsRes.ok) {
          const payload = (await productsRes.json()) as
            | ApiProduct[]
            | { items?: ApiProduct[] };
          const rows = Array.isArray(payload)
            ? payload
            : (payload.items ?? []);
          setProducts(rows.map(mapApiProduct));
        }

        if (!cancelled && categoriesRes.ok) {
          const rows = (await categoriesRes.json()) as Array<{
            slug: string;
            isActive?: boolean;
            sortOrder?: number;
          }>;
          const slugs = rows
            .filter((c) => c.isActive !== false)
            .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
            .map((c) => c.slug)
            .filter((slug): slug is ProductCategory =>
              knownCategorySlugs.includes(slug as ProductCategory),
            );
          setCategories(slugs);
        }

        if (!cancelled && settingsRes.ok) {
          const section = (await settingsRes.json()) as {
            data?: {
              social?: Record<string, string>;
              contact?: Record<string, string>;
              storeName?: string;
              taglineEn?: string;
              taglineBn?: string;
              logo?: string;
            };
          };
          const socialValue = section.data?.social ?? {};
          const contactValue = section.data?.contact ?? {};
          setSocial(
            [
              {
                id: "instagram" as const,
                href: socialValue.instagram || "",
                label: "Instagram",
              },
              {
                id: "facebook" as const,
                href: socialValue.facebook || "",
                label: "Facebook",
              },
              {
                id: "whatsapp" as const,
                href: socialValue.whatsapp || "",
                label: "WhatsApp",
              },
              {
                id: "tiktok" as const,
                href: socialValue.tiktok || "",
                label: "TikTok",
              },
            ].filter((l) => Boolean(l.href)),
          );
          if (Object.keys(contactValue).length) {
            setContact(mapContact(contactValue));
          }
          if (section.data?.storeName) setStoreName(section.data.storeName);
          if (section.data?.taglineEn) setTaglineEn(section.data.taglineEn);
          if (section.data?.taglineBn) setTaglineBn(section.data.taglineBn);
          if (section.data?.logo) setLogo(section.data.logo);
        }
      } catch {
        // Leave empty — UI shows skeleton / empty, never seed defaults.
      } finally {
        if (!cancelled) setReady(true);
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<CatalogContextValue>(
    () => ({
      ready,
      products,
      categories,
      social,
      contact,
      storeName,
      taglineEn,
      taglineBn,
      logo,
      getBySlug: (slug: string) => products.find((p) => p.slug === slug),
    }),
    [
      ready,
      products,
      categories,
      social,
      contact,
      storeName,
      taglineEn,
      taglineBn,
      logo,
    ],
  );

  return (
    <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>
  );
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalog must be used within CatalogProvider");
  return ctx;
}
