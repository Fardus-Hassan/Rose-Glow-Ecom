"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Category, Product } from "@/lib/types";
import { Button } from "@/components/ui/Button";

type ProductPayload = {
  slug: string;
  sku: string;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
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
};

function emptyForm(categoryId = ""): ProductPayload {
  return {
    slug: "",
    sku: "",
    nameEn: "",
    nameBn: "",
    descriptionEn: "",
    descriptionBn: "",
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
  };
}

function fromProduct(p: Product): ProductPayload {
  return {
    slug: p.slug,
    sku: p.sku,
    nameEn: p.nameEn,
    nameBn: p.nameBn,
    descriptionEn: p.descriptionEn,
    descriptionBn: p.descriptionBn,
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<ProductPayload>(
    initial ? fromProduct(initial) : emptyForm(),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = {
      ...form,
      price: Number(form.price),
      stock: Number(form.stock),
      compareAtPrice:
        form.compareAtPrice === null || form.compareAtPrice === undefined
          ? null
          : Number(form.compareAtPrice),
    };
    try {
      if (productId) {
        await api(`/admin/products/${productId}`, {
          method: "PATCH",
          body: JSON.stringify(body),
        });
        router.push("/products");
      } else {
        const created = await api<Product>("/admin/products", {
          method: "POST",
          body: JSON.stringify(body),
        });
        router.push(`/products/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {error ? (
        <p className="border border-red-800/20 bg-red-50 px-3 py-2 text-sm text-red-900">
          {error}
        </p>
      ) : null}

      <section className="admin-card p-6">
        <h2 className="font-display text-xl text-night">Basics</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Slug">
            <input
              className="admin-input"
              value={form.slug}
              onChange={(e) => patch("slug", e.target.value)}
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
          <Field label="Name (EN)">
            <input
              className="admin-input"
              value={form.nameEn}
              onChange={(e) => patch("nameEn", e.target.value)}
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
          <Field label="Category" className="md:col-span-2">
            <select
              className="admin-input"
              value={form.categoryId}
              onChange={(e) => patch("categoryId", e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameEn}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description (EN)" className="md:col-span-2">
            <textarea
              className="admin-input min-h-[100px]"
              value={form.descriptionEn}
              onChange={(e) => patch("descriptionEn", e.target.value)}
              required
            />
          </Field>
          <Field label="Description (BN)" className="md:col-span-2">
            <textarea
              className="admin-input min-h-[100px]"
              value={form.descriptionBn}
              onChange={(e) => patch("descriptionBn", e.target.value)}
              required
            />
          </Field>
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
          <Field label="Compare at">
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
              onChange={(e) => patch("stock", Number(e.target.value))}
            />
          </Field>
          <div className="flex flex-wrap gap-4 pt-6 md:col-span-2">
            <Toggle
              label="Published"
              checked={form.published}
              onChange={(v) => patch("published", v)}
            />
            <Toggle
              label="In stock"
              checked={form.inStock}
              onChange={(v) => patch("inStock", v)}
            />
            <Toggle
              label="Featured"
              checked={form.featured}
              onChange={(v) => patch("featured", v)}
            />
            <Toggle
              label="Newest"
              checked={form.newest}
              onChange={(v) => patch("newest", v)}
            />
          </div>
        </div>
      </section>

      <section className="admin-card p-6">
        <h2 className="font-display text-xl text-night">SEO</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="SEO title (EN)">
            <input
              className="admin-input"
              value={form.seoTitleEn}
              onChange={(e) => patch("seoTitleEn", e.target.value)}
            />
          </Field>
          <Field label="SEO title (BN)">
            <input
              className="admin-input"
              value={form.seoTitleBn}
              onChange={(e) => patch("seoTitleBn", e.target.value)}
            />
          </Field>
          <Field label="Meta description (EN)" className="md:col-span-2">
            <textarea
              className="admin-input min-h-[72px]"
              value={form.seoDescriptionEn}
              onChange={(e) => patch("seoDescriptionEn", e.target.value)}
            />
          </Field>
          <Field label="Meta description (BN)" className="md:col-span-2">
            <textarea
              className="admin-input min-h-[72px]"
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
              onChange={(e) => patch("canonicalPath", e.target.value)}
            />
          </Field>
          <Field label="OG image URL" className="md:col-span-2">
            <input
              className="admin-input"
              value={form.ogImage}
              onChange={(e) => patch("ogImage", e.target.value)}
            />
          </Field>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" loading={saving}>
          {productId ? "Save product" : "Create product"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push("/products")}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="admin-label">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
      <input
        type="checkbox"
        className="h-4 w-4 accent-night"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}
