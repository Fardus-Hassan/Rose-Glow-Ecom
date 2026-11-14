"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ExternalLink, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/admin/api";
import type { Category, Product } from "@/lib/admin/types";
import { Button } from "@/components/admin/ui/Button";
import { MediaField } from "@/components/admin/media/MediaLibrary";
import { Field, PanelCard, Toggle } from "@/components/admin/form/PanelCard";
import { GoogleSerpPreview } from "@/components/admin/form/GoogleSerpPreview";
import {
  galleryFromProduct,
  galleryToPayload,
  ProductMediaGallery,
  type GalleryItem,
} from "@/components/admin/products/ProductMediaGallery";
import {
  emptyLandingConfig,
  normalizeLandingSlug,
  parseLandingConfig,
  type ProductLandingConfig,
} from "@/lib/landing";

type ColorRow = { key: string; en: string; bn: string };

type ProductPayload = {
  slug: string;
  sku: string;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  materialEn: string;
  materialBn: string;
  price: number;
  compareAtPrice?: number | null;
  categoryId: string;
  stock: number;
  featured: boolean;
  newest: boolean;
  inStock: boolean;
  published: boolean;
  seoTitleEn: string;
  seoTitleBn: string;
  seoDescriptionEn: string;
  seoDescriptionBn: string;
  seoKeywords: string;
  canonicalPath: string;
  ogImage: string;
  landingEnabled: boolean;
  landingSlug: string;
  landing: ProductLandingConfig;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function emptyForm(categoryId = ""): ProductPayload {
  return {
    slug: "",
    sku: "",
    nameEn: "",
    nameBn: "",
    descriptionEn: "",
    descriptionBn: "",
    materialEn: "",
    materialBn: "",
    price: 0,
    compareAtPrice: null,
    categoryId,
    stock: 0,
    featured: false,
    newest: false,
    inStock: true,
    published: true,
    seoTitleEn: "",
    seoTitleBn: "",
    seoDescriptionEn: "",
    seoDescriptionBn: "",
    seoKeywords: "",
    canonicalPath: "",
    ogImage: "",
    landingEnabled: false,
    landingSlug: "",
    landing: emptyLandingConfig(),
  };
}

function colorsFromProduct(colors: unknown): ColorRow[] {
  if (!Array.isArray(colors)) return [];
  return colors.map((c, i) => {
    if (c && typeof c === "object") {
      const row = c as { en?: string; bn?: string };
      return {
        key: `c-${i}`,
        en: String(row.en || ""),
        bn: String(row.bn || ""),
      };
    }
    return { key: `c-${i}`, en: String(c || ""), bn: "" };
  });
}

function fromProduct(p: Product): {
  form: ProductPayload;
  media: GalleryItem[];
  colors: ColorRow[];
} {
  return {
    form: {
      slug: p.slug,
      sku: p.sku,
      nameEn: p.nameEn,
      nameBn: p.nameBn,
      descriptionEn: p.descriptionEn,
      descriptionBn: p.descriptionBn,
      materialEn: p.materialEn || "",
      materialBn: p.materialBn || "",
      price: p.price,
      compareAtPrice: p.compareAtPrice ?? null,
      categoryId: p.categoryId,
      stock: p.stock,
      featured: p.featured,
      newest: p.newest,
      inStock: p.inStock,
      published: p.published,
      seoTitleEn: p.seoTitleEn,
      seoTitleBn: p.seoTitleBn,
      seoDescriptionEn: p.seoDescriptionEn,
      seoDescriptionBn: p.seoDescriptionBn,
      seoKeywords: p.seoKeywords,
      canonicalPath: p.canonicalPath,
      ogImage: p.ogImage,
      landingEnabled: Boolean(p.landingEnabled),
      landingSlug: p.landingSlug || "",
      landing: parseLandingConfig(p.landing),
    },
    media: galleryFromProduct(p.media),
    colors: colorsFromProduct(p.colors),
  };
}

export function ProductForm({
  productId,
  initial,
}: {
  productId?: string;
  initial?: Product;
}) {
  const router = useRouter();
  const seeded = initial ? fromProduct(initial) : null;
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductPayload>(
    seeded?.form || emptyForm(),
  );
  const [media, setMedia] = useState<GalleryItem[]>(seeded?.media || []);
  const [colors, setColors] = useState<ColorRow[]>(seeded?.colors || []);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slugTouched = useRef(Boolean(initial?.slug));

  useEffect(() => {
    api<Category[]>("/admin/categories").then((rows) => {
      setCategories(rows);
      if (!form.categoryId && rows[0]) {
        setForm((f) => ({ ...f, categoryId: rows[0].id }));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function patch<K extends keyof ProductPayload>(key: K, value: ProductPayload[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function patchLanding<K extends keyof ProductLandingConfig>(
    key: K,
    value: ProductLandingConfig[K],
  ) {
    setForm((f) => ({ ...f, landing: { ...f.landing, [key]: value } }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.categoryId) {
      setError("Choose a category");
      return;
    }
    if (!media.some((m) => m.src.trim())) {
      setError("Add at least one product image or video");
      return;
    }
    setSaving(true);
    setError(null);
    const landingSlug =
      normalizeLandingSlug(form.landingSlug) ||
      normalizeLandingSlug(form.slug);
    const body = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      compareAtPrice:
        form.compareAtPrice === null || form.compareAtPrice === undefined
          ? null
          : Number(form.compareAtPrice),
      inStock: Number(form.stock) > 0 ? form.inStock : false,
      media: galleryToPayload(media),
      colors: colors
        .filter((c) => c.en.trim() || c.bn.trim())
        .map((c) => ({ en: c.en.trim(), bn: c.bn.trim() })),
      canonicalPath:
        form.canonicalPath || (form.slug ? `/products/${form.slug}` : ""),
      ogImage: form.ogImage || media.find((m) => m.type === "IMAGE" && m.src)?.src || "",
      landingEnabled: form.landingEnabled,
      landingSlug: form.landingEnabled ? landingSlug : null,
      landing: {
        ...form.landing,
        relatedSlugs: form.landing.relatedSlugs
          .map((s) => s.trim())
          .filter(Boolean),
        points: form.landing.points.map((p) => ({
          en: p.en.trim(),
          bn: p.bn.trim(),
        })),
      },
    };
    try {
      if (productId) {
        await api(`/admin/products/${productId}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        toast.success("Product saved");
      } else {
        const created = await api<Product>("/admin/products", {
          method: "POST",
          body: JSON.stringify(body),
        });
        toast.success("Product created");
        router.push(`/admin/products/${created.id}`);
        return;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function moveToTrash() {
    if (!productId) return;
    const ok = window.confirm(
      "Move this product to the recycle bin? You can restore it within 30 days.",
    );
    if (!ok) return;
    setDeleting(true);
    try {
      await api(`/admin/products/${productId}`, { method: "DELETE" });
      toast.success("Moved to recycle bin");
      router.push("/admin/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="pb-24">
      {error ? (
        <p className="mb-6 border border-red-800/20 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-6 xl:flex-row xl:items-start">
        <div className="min-w-0 flex-1 space-y-6">
          <PanelCard
            id="panel-content"
            title="Product content"
            description="Names, story copy, material, and colour options shown on the product page."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Name (EN)">
                <input
                  className="admin-input"
                  value={form.nameEn}
                  onChange={(e) => {
                    const nameEn = e.target.value;
                    setForm((f) => ({
                      ...f,
                      nameEn,
                      ...(!slugTouched.current
                        ? { slug: slugify(nameEn) }
                        : {}),
                    }));
                  }}
                  required
                />
              </Field>
              <Field label="Name (BN)">
                <input
                  className="admin-input"
                  value={form.nameBn}
                  onChange={(e) => patch("nameBn", e.target.value)}
                  required
                />
              </Field>
              <Field label="Description (EN)" className="md:col-span-2">
                <textarea
                  className="admin-input min-h-[7rem]"
                  value={form.descriptionEn}
                  onChange={(e) => patch("descriptionEn", e.target.value)}
                  required
                />
              </Field>
              <Field label="Description (BN)" className="md:col-span-2">
                <textarea
                  className="admin-input min-h-[7rem]"
                  value={form.descriptionBn}
                  onChange={(e) => patch("descriptionBn", e.target.value)}
                  required
                />
              </Field>
              <Field label="Material (EN)">
                <input
                  className="admin-input"
                  value={form.materialEn}
                  onChange={(e) => patch("materialEn", e.target.value)}
                  placeholder="Gold-tone metal, pearl"
                />
              </Field>
              <Field label="Material (BN)">
                <input
                  className="admin-input"
                  value={form.materialBn}
                  onChange={(e) => patch("materialBn", e.target.value)}
                />
              </Field>
            </div>

            <div className="border-t border-ink/10 pt-5">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink">Colours</p>
                  <p className="text-xs text-muted">
                    Optional bilingual colour labels for the PDP.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    setColors((rows) => [
                      ...rows,
                      {
                        key: `c-${Date.now()}`,
                        en: "",
                        bn: "",
                      },
                    ])
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> Add colour
                </Button>
              </div>
              {colors.length === 0 ? (
                <p className="text-sm text-muted">No colours added.</p>
              ) : (
                <div className="space-y-2">
                  {colors.map((row) => (
                    <div key={row.key} className="flex gap-2">
                      <input
                        className="admin-input"
                        placeholder="EN"
                        value={row.en}
                        onChange={(e) =>
                          setColors((rows) =>
                            rows.map((c) =>
                              c.key === row.key
                                ? { ...c, en: e.target.value }
                                : c,
                            ),
                          )
                        }
                      />
                      <input
                        className="admin-input"
                        placeholder="BN"
                        value={row.bn}
                        onChange={(e) =>
                          setColors((rows) =>
                            rows.map((c) =>
                              c.key === row.key
                                ? { ...c, bn: e.target.value }
                                : c,
                            ),
                          )
                        }
                      />
                      <button
                        type="button"
                        className="border border-ink/15 px-3 text-muted hover:text-ink"
                        onClick={() =>
                          setColors((rows) =>
                            rows.filter((c) => c.key !== row.key),
                          )
                        }
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PanelCard>

          <PanelCard
            id="panel-media"
            title="Media gallery"
            description="Images and videos for the product page. Drag to set order. First item is the catalogue thumbnail."
          >
            <ProductMediaGallery value={media} onChange={setMedia} />
          </PanelCard>

          <PanelCard
            id="panel-pricing"
            title="Pricing & inventory"
            description="Storefront prices are in Bangladeshi Taka (BDT)."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Price (BDT)">
                <input
                  type="number"
                  min={0}
                  className="admin-input"
                  value={form.price}
                  onChange={(e) => patch("price", Number(e.target.value))}
                  required
                />
              </Field>
              <Field label="Compare at" hint="Optional strike-through price">
                <input
                  type="number"
                  min={0}
                  className="admin-input"
                  value={form.compareAtPrice ?? ""}
                  onChange={(e) =>
                    patch(
                      "compareAtPrice",
                      e.target.value === "" ? null : Number(e.target.value),
                    )
                  }
                />
              </Field>
              <Field label="Stock">
                <input
                  type="number"
                  min={0}
                  className="admin-input"
                  value={form.stock}
                  onChange={(e) => {
                    const stock = Number(e.target.value);
                    setForm((f) => ({
                      ...f,
                      stock,
                      inStock: stock > 0 ? f.inStock || true : false,
                    }));
                  }}
                />
              </Field>
            </div>
          </PanelCard>

          <PanelCard
            id="panel-landing"
            title="Ad landing page"
            description="Dedicated COD landing at /l/your-slug — for ads & campaigns. Manage copy, bullets, related products, and meta."
          >
            <div className="space-y-4">
              <Toggle
                label="Enable landing page"
                hint="Publishes a focused order page without the main site chrome"
                checked={form.landingEnabled}
                onChange={(v) => {
                  patch("landingEnabled", v);
                  if (v && !form.landingSlug) {
                    patch("landingSlug", normalizeLandingSlug(form.slug));
                  }
                }}
              />
              {form.landingEnabled ? (
                <>
                  <Field
                    label="Landing URL slug"
                    hint={`Live at /l/${form.landingSlug || form.slug || "…"}`}
                  >
                    <div className="flex flex-row items-center gap-2">
                      <input
                        className="admin-input min-w-0 flex-1"
                        value={form.landingSlug}
                        placeholder={form.slug || "pearl-bloom"}
                        onChange={(e) =>
                          patch(
                            "landingSlug",
                            normalizeLandingSlug(e.target.value),
                          )
                        }
                      />
                      {(form.landingSlug || form.slug) && (
                        <Link
                          href={`/en/l/${form.landingSlug || form.slug}`}
                          target="_blank"
                          className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 border border-ink/15 px-3 text-[11px] uppercase tracking-[0.14em] text-ink hover:border-rose"
                        >
                          Open <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      )}
                    </div>
                  </Field>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Eyebrow (EN)">
                      <input
                        className="admin-input"
                        value={form.landing.eyebrowEn}
                        placeholder="Everyday glow"
                        onChange={(e) =>
                          patchLanding("eyebrowEn", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Eyebrow (BN)">
                      <input
                        className="admin-input"
                        value={form.landing.eyebrowBn}
                        onChange={(e) =>
                          patchLanding("eyebrowBn", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Headline override (EN)" hint="Blank = product name">
                      <input
                        className="admin-input"
                        value={form.landing.headlineEn}
                        onChange={(e) =>
                          patchLanding("headlineEn", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Headline override (BN)">
                      <input
                        className="admin-input"
                        value={form.landing.headlineBn}
                        onChange={(e) =>
                          patchLanding("headlineBn", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Body override (EN)" className="md:col-span-2" hint="Blank = product description">
                      <textarea
                        className="admin-input min-h-[5rem]"
                        value={form.landing.bodyEn}
                        onChange={(e) =>
                          patchLanding("bodyEn", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Body override (BN)" className="md:col-span-2">
                      <textarea
                        className="admin-input min-h-[5rem]"
                        value={form.landing.bodyBn}
                        onChange={(e) =>
                          patchLanding("bodyBn", e.target.value)
                        }
                      />
                    </Field>
                  </div>

                  <div className="border-t border-ink/10 pt-4">
                    <p className="mb-3 text-sm font-medium text-ink">
                      Selling points (up to 3)
                    </p>
                    <div className="space-y-3">
                      {form.landing.points.map((point, index) => (
                        <div key={index} className="grid gap-2 md:grid-cols-2">
                          <input
                            className="admin-input"
                            placeholder={`Point ${index + 1} EN`}
                            value={point.en}
                            onChange={(e) => {
                              const points = form.landing.points.map((p, i) =>
                                i === index ? { ...p, en: e.target.value } : p,
                              );
                              patchLanding("points", points);
                            }}
                          />
                          <input
                            className="admin-input"
                            placeholder={`Point ${index + 1} BN`}
                            value={point.bn}
                            onChange={(e) => {
                              const points = form.landing.points.map((p, i) =>
                                i === index ? { ...p, bn: e.target.value } : p,
                              );
                              patchLanding("points", points);
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Field
                    label="Related product slugs"
                    hint="Comma-separated catalogue slugs shown as “pair with”"
                  >
                    <input
                      className="admin-input"
                      value={form.landing.relatedSlugs.join(", ")}
                      placeholder="soft-hoop-earrings, petal-ring"
                      onChange={(e) =>
                        patchLanding(
                          "relatedSlugs",
                          e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean),
                        )
                      }
                    />
                  </Field>

                  <div className="grid gap-4 border-t border-ink/10 pt-4 md:grid-cols-2">
                    <Field label="Landing meta title (EN)">
                      <input
                        className="admin-input"
                        maxLength={70}
                        value={form.landing.metaTitleEn}
                        onChange={(e) =>
                          patchLanding("metaTitleEn", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Landing meta title (BN)">
                      <input
                        className="admin-input"
                        maxLength={70}
                        value={form.landing.metaTitleBn}
                        onChange={(e) =>
                          patchLanding("metaTitleBn", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Landing meta description (EN)" className="md:col-span-2">
                      <textarea
                        className="admin-input min-h-[72px]"
                        maxLength={180}
                        value={form.landing.metaDescriptionEn}
                        onChange={(e) =>
                          patchLanding("metaDescriptionEn", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Landing meta description (BN)" className="md:col-span-2">
                      <textarea
                        className="admin-input min-h-[72px]"
                        maxLength={180}
                        value={form.landing.metaDescriptionBn}
                        onChange={(e) =>
                          patchLanding("metaDescriptionBn", e.target.value)
                        }
                      />
                    </Field>
                  </div>
                </>
              ) : null}
            </div>
          </PanelCard>

          <PanelCard
            id="panel-seo"
            title="Search engine (SEO)"
            description="How this product appears on Google and social shares."
          >
            <GoogleSerpPreview
              path={form.canonicalPath || `/product/${form.slug || "…"}`}
              title={form.seoTitleEn || form.nameEn || "Product title"}
              description={
                form.seoDescriptionEn ||
                form.descriptionEn ||
                "Meta description preview"
              }
            />
            <div className="h-1" />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="SEO title (EN)">
                <input
                  className="admin-input"
                  maxLength={70}
                  value={form.seoTitleEn}
                  onChange={(e) => patch("seoTitleEn", e.target.value)}
                />
              </Field>
              <Field label="SEO title (BN)">
                <input
                  className="admin-input"
                  maxLength={70}
                  value={form.seoTitleBn}
                  onChange={(e) => patch("seoTitleBn", e.target.value)}
                />
              </Field>
              <Field label="Meta description (EN)" className="md:col-span-2">
                <textarea
                  className="admin-input min-h-[72px]"
                  maxLength={180}
                  value={form.seoDescriptionEn}
                  onChange={(e) => patch("seoDescriptionEn", e.target.value)}
                />
              </Field>
              <Field label="Meta description (BN)" className="md:col-span-2">
                <textarea
                  className="admin-input min-h-[72px]"
                  maxLength={180}
                  value={form.seoDescriptionBn}
                  onChange={(e) => patch("seoDescriptionBn", e.target.value)}
                />
              </Field>
              <Field label="Keywords">
                <input
                  className="admin-input"
                  value={form.seoKeywords}
                  onChange={(e) => patch("seoKeywords", e.target.value)}
                />
              </Field>
              <Field label="Canonical path">
                <input
                  className="admin-input"
                  value={form.canonicalPath}
                  placeholder={`/products/${form.slug || "slug"}`}
                  onChange={(e) => patch("canonicalPath", e.target.value)}
                />
              </Field>
              <Field label="OG image" className="md:col-span-2">
                <MediaField
                  value={form.ogImage}
                  onChange={(url) => patch("ogImage", url)}
                  kind="image"
                />
              </Field>
            </div>
          </PanelCard>
        </div>

        <aside className="w-full shrink-0 space-y-4 xl:sticky xl:top-24 xl:w-80">
          <PanelCard title="Publish">
            <div className="space-y-3">
              <Toggle
                label="Published"
                hint="Visible on the storefront"
                checked={form.published}
                onChange={(v) => patch("published", v)}
              />
              <Toggle
                label="In stock"
                hint="Buyable on the product page"
                checked={form.inStock}
                onChange={(v) => patch("inStock", v)}
              />
              <Toggle
                label="Featured"
                hint="Highlight in merchandising strips"
                checked={form.featured}
                onChange={(v) => patch("featured", v)}
              />
              <Toggle
                label="Newest"
                hint="Show in new arrivals"
                checked={form.newest}
                onChange={(v) => patch("newest", v)}
              />
            </div>
          </PanelCard>

          <PanelCard title="Organisation">
            <div className="space-y-4">
              <Field label="Category">
                <select
                  className="admin-input"
                  value={form.categoryId}
                  onChange={(e) => patch("categoryId", e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nameEn}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Slug" hint="URL path segment">
                <input
                  className="admin-input"
                  value={form.slug}
                  onChange={(e) => {
                    slugTouched.current = true;
                    patch("slug", e.target.value);
                  }}
                  required
                />
              </Field>
              <Field label="SKU">
                <input
                  className="admin-input"
                  value={form.sku}
                  onChange={(e) => patch("sku", e.target.value)}
                  required
                />
              </Field>
            </div>
          </PanelCard>

          <div className="flex flex-col gap-2">
            <Button type="submit" loading={saving} className="w-full">
              {productId ? "Save product" : "Create product"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => router.push("/admin/products")}
            >
              Back to products
            </Button>
            {form.slug ? (
              <Link
                href={`/en/product/${form.slug}`}
                target="_blank"
                className="inline-flex min-h-10 items-center justify-center gap-2 border border-ink/15 px-4 text-[11px] uppercase tracking-[0.16em] text-ink hover:border-rose"
              >
                View on site <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            ) : null}
            {productId ? (
              <Button
                type="button"
                variant="danger"
                className="w-full"
                loading={deleting}
                onClick={() => void moveToTrash()}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Move to recycle bin
              </Button>
            ) : null}
          </div>
        </aside>
      </div>
    </form>
  );
}
