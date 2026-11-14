"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { api } from "@/lib/admin/api";
import type { Category } from "@/lib/admin/types";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Button";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Field, PanelCard, Toggle } from "@/components/admin/form/PanelCard";
import { GoogleSerpPreview } from "@/components/admin/form/GoogleSerpPreview";

type CategoryDraft = Omit<Category, "id"> & { id?: string };

const blank: CategoryDraft = {
  slug: "",
  nameEn: "",
  nameBn: "",
  descriptionEn: "",
  descriptionBn: "",
  seoTitleEn: "",
  seoTitleBn: "",
  seoDescriptionEn: "",
  seoDescriptionBn: "",
  sortOrder: 0,
  isActive: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function CategoriesPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [draft, setDraft] = useState<CategoryDraft>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slugTouched = useRef(false);

  function load() {
    api<Category[]>("/admin/categories").then(setRows);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(c: Category) {
    slugTouched.current = true;
    setEditingId(c.id);
    setDraft({ ...c });
    setError(null);
  }

  function startCreate() {
    slugTouched.current = false;
    setEditingId("new");
    setDraft(blank);
    setError(null);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editingId && editingId !== "new") {
        await api(`/admin/categories/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(draft),
        });
      } else {
        await api("/admin/categories", {
          method: "POST",
          body: JSON.stringify(draft),
        });
      }
      setEditingId(null);
      setDraft(blank);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (
      !confirm(
        "Move this category (and its products) to the recycle bin? Restorable for 30 days.",
      )
    ) {
      return;
    }
    await api(`/admin/categories/${id}`, { method: "DELETE" });
    load();
    if (editingId === id) setEditingId(null);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Categories"
        description="Structure the collection with bilingual names and SEO."
        actions={<Button onClick={startCreate}>Add category</Button>}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div className="admin-card overflow-hidden">
          <ul className="divide-y divide-ink/10">
            {rows.length === 0 ? (
              <li className="p-8">
                <EmptyState title="No categories" />
              </li>
            ) : (
              rows.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className={`flex w-full items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-paper/60 ${
                      editingId === c.id ? "bg-paper/80" : ""
                    }`}
                  >
                    <span>
                      <span className="block font-medium text-night">
                        {c.nameEn}
                      </span>
                      <span className="block text-xs text-muted">{c.slug}</span>
                    </span>
                    <span
                      className={`text-[10px] uppercase tracking-[0.16em] ${
                        c.isActive ? "text-emerald-900" : "text-muted"
                      }`}
                    >
                      {c.isActive ? "Active" : "Hidden"}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>

        {editingId ? (
          <form onSubmit={onSubmit} className="space-y-5">
            {error ? (
              <p className="border border-red-800/20 bg-red-50 px-3 py-2 text-sm text-red-900">
                {error}
              </p>
            ) : null}

            <PanelCard
              title={editingId === "new" ? "New category" : "Edit category"}
              description="Names and copy used in navigation and collection pages."
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Name (EN)">
                  <input
                    className="admin-input"
                    value={draft.nameEn}
                    onChange={(e) => {
                      const nameEn = e.target.value;
                      setDraft((d) => ({
                        ...d,
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
                    value={draft.nameBn}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, nameBn: e.target.value }))
                    }
                    required
                  />
                </Field>
                <Field label="Slug">
                  <input
                    className="admin-input"
                    value={draft.slug}
                    onChange={(e) => {
                      slugTouched.current = true;
                      setDraft((d) => ({ ...d, slug: e.target.value }));
                    }}
                    required
                  />
                </Field>
                <Field label="Sort order">
                  <input
                    type="number"
                    className="admin-input"
                    value={draft.sortOrder}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        sortOrder: Number(e.target.value),
                      }))
                    }
                  />
                </Field>
                <Field label="Description (EN)" className="md:col-span-2">
                  <textarea
                    className="admin-input min-h-[72px]"
                    value={draft.descriptionEn}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        descriptionEn: e.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="Description (BN)" className="md:col-span-2">
                  <textarea
                    className="admin-input min-h-[72px]"
                    value={draft.descriptionBn}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        descriptionBn: e.target.value,
                      }))
                    }
                  />
                </Field>
              </div>
            </PanelCard>

            <PanelCard
              title="Search engine (SEO)"
              description="Optional overrides for category listing pages."
            >
              <GoogleSerpPreview
                path={`/products${draft.slug ? `?category=${draft.slug}` : ""}`}
                title={draft.seoTitleEn || draft.nameEn || "Category title"}
                description={
                  draft.seoDescriptionEn ||
                  draft.descriptionEn ||
                  "Meta description preview"
                }
              />
              <div className="h-1" />
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="SEO title (EN)">
                  <input
                    className="admin-input"
                    value={draft.seoTitleEn}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, seoTitleEn: e.target.value }))
                    }
                  />
                </Field>
                <Field label="SEO title (BN)">
                  <input
                    className="admin-input"
                    value={draft.seoTitleBn}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, seoTitleBn: e.target.value }))
                    }
                  />
                </Field>
                <Field label="SEO description (EN)" className="md:col-span-2">
                  <textarea
                    className="admin-input min-h-[72px]"
                    value={draft.seoDescriptionEn}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        seoDescriptionEn: e.target.value,
                      }))
                    }
                  />
                </Field>
                <Field label="SEO description (BN)" className="md:col-span-2">
                  <textarea
                    className="admin-input min-h-[72px]"
                    value={draft.seoDescriptionBn}
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        seoDescriptionBn: e.target.value,
                      }))
                    }
                  />
                </Field>
              </div>
            </PanelCard>

            <PanelCard title="Visibility">
              <Toggle
                label="Active"
                hint="Show this category in navigation and filters"
                checked={draft.isActive}
                onChange={(isActive) => setDraft((d) => ({ ...d, isActive }))}
              />
            </PanelCard>

            <div className="flex flex-wrap gap-2">
              <Button type="submit" loading={saving}>
                Save category
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditingId(null);
                  setDraft(blank);
                }}
              >
                Cancel
              </Button>
              {editingId !== "new" ? (
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => remove(editingId)}
                >
                  Move to recycle bin
                </Button>
              ) : null}
            </div>
          </form>
        ) : (
          <div className="admin-card flex min-h-[20rem] items-center justify-center p-12 text-sm text-muted">
            Select a category to edit, or create a new one.
          </div>
        )}
      </div>
    </div>
  );
}
