"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Category } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

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

export default function CategoriesPage() {
  const [rows, setRows] = useState<Category[]>([]);
  const [draft, setDraft] = useState<CategoryDraft>(blank);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    api<Category[]>("/admin/categories").then(setRows);
  }

  useEffect(() => {
    load();
  }, []);

  function startEdit(c: Category) {
    setEditingId(c.id);
    setDraft({ ...c });
  }

  function startCreate() {
    setEditingId("new");
    setDraft(blank);
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
    if (!confirm("Delete this category?")) return;
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

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="admin-card overflow-hidden lg:col-span-1">
          <ul className="divide-y divide-ink/10">
            {rows.length === 0 ? (
              <li className="p-8">
                <EmptyState title="No categories" />
              </li>
            ) : (
              rows.map((c) => (
                <li
                  key={c.id}
                  className="flex items-center justify-between gap-3 px-5 py-4"
                >
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="text-left hover:text-rose"
                  >
                    <p className="font-medium text-night">{c.nameEn}</p>
                    <p className="text-xs text-muted">{c.slug}</p>
                  </button>
                  <Button variant="ghost" onClick={() => remove(c.id)}>
                    Delete
                  </Button>
                </li>
              ))
            )}
          </ul>
        </div>

        {editingId ? (
          <form onSubmit={onSubmit} className="admin-card space-y-4 p-6 lg:col-span-1">
            <h2 className="font-display text-xl text-night">
              {editingId === "new" ? "New category" : "Edit category"}
            </h2>
            {error ? (
              <p className="text-sm text-red-900">{error}</p>
            ) : null}
            <div className="grid gap-3 md:grid-cols-2">
              {(
                [
                  ["slug", "Slug"],
                  ["nameEn", "Name EN"],
                  ["nameBn", "Name BN"],
                  ["sortOrder", "Sort order", "number"],
                ] as const
              ).map(([key, label, type]) => (
                <label key={key} className={key === "slug" ? "" : ""}>
                  <span className="admin-label">{label}</span>
                  <input
                    className="admin-input"
                    type={type === "number" ? "number" : "text"}
                    value={
                      key === "sortOrder"
                        ? draft.sortOrder
                        : (draft[key as keyof CategoryDraft] as string)
                    }
                    onChange={(e) =>
                      setDraft((d) => ({
                        ...d,
                        [key]:
                          key === "sortOrder"
                            ? Number(e.target.value)
                            : e.target.value,
                      }))
                    }
                    required={key !== "sortOrder"}
                  />
                </label>
              ))}
            </div>
            <label>
              <span className="admin-label">Description EN</span>
              <textarea
                className="admin-input min-h-[72px]"
                value={draft.descriptionEn}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, descriptionEn: e.target.value }))
                }
              />
            </label>
            <label>
              <span className="admin-label">Description BN</span>
              <textarea
                className="admin-input min-h-[72px]"
                value={draft.descriptionBn}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, descriptionBn: e.target.value }))
                }
              />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              {(
                [
                  "seoTitleEn",
                  "seoTitleBn",
                  "seoDescriptionEn",
                  "seoDescriptionBn",
                ] as const
              ).map((key) => (
                <label key={key}>
                  <span className="admin-label">{key}</span>
                  <input
                    className="admin-input"
                    value={draft[key]}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, [key]: e.target.value }))
                    }
                  />
                </label>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, isActive: e.target.checked }))
                }
              />
              Active
            </label>
            <FormActions
              saving={saving}
              onCancel={() => {
                setEditingId(null);
                setDraft(blank);
              }}
            />
          </form>
        ) : (
          <div className="admin-card flex items-center justify-center p-12 text-sm text-muted lg:col-span-1">
            Select a category to edit or create a new one.
          </div>
        )}
      </div>
    </div>
  );
}

function FormActions({
  saving,
  onCancel,
}: {
  saving: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex gap-2 pt-2">
      <Button type="submit" loading={saving}>
        Save
      </Button>
      <Button type="button" variant="secondary" onClick={onCancel}>
        Cancel
      </Button>
    </div>
  );
}
