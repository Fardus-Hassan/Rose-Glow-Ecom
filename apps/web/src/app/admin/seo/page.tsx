"use client";

import {
  FormEvent,
  useEffect,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { api } from "@/lib/admin/api";
import type { SeoEntry } from "@/lib/admin/types";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Button";
import { EmptyState } from "@/components/admin/ui/EmptyState";

type SeoDraft = Partial<SeoEntry> & { path: string };

const blank: SeoDraft = {
  path: "/",
  titleEn: "",
  titleBn: "",
  descriptionEn: "",
  descriptionBn: "",
  keywords: "",
  ogImage: "",
  noIndex: false,
  canonicalUrl: "",
};

export default function SeoPage() {
  const [entries, setEntries] = useState<SeoEntry[]>([]);
  const [draft, setDraft] = useState<SeoDraft>(blank);
  const [saving, setSaving] = useState(false);

  function load() {
    api<SeoEntry[]>("/admin/seo").then(setEntries);
  }

  useEffect(() => {
    load();
  }, []);

  function edit(row: SeoEntry) {
    setDraft({ ...row });
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await api("/admin/seo", {
        method: "PUT",
        body: JSON.stringify(draft),
      });
      setDraft(blank);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(path: string) {
    if (!confirm(`Remove SEO for ${path}?`)) return;
    await api(`/admin/seo?path=${encodeURIComponent(path)}`, {
      method: "DELETE",
    });
    load();
  }

  return (
    <div>
      <PageHeader
        eyebrow="Discovery"
        title="SEO manager"
        description="Per-path titles, descriptions, and index settings."
      />

      <form onSubmit={onSubmit} className="admin-card mb-8 space-y-4 p-6">
        <h2 className="font-display text-xl text-night">
          {draft.id ? "Edit entry" : "New / update entry"}
        </h2>
        <label>
          <span className="admin-label">Path</span>
          <input
            className="admin-input"
            value={draft.path}
            onChange={(e) => setDraft((d) => ({ ...d, path: e.target.value }))}
            placeholder="/products"
            required
          />
        </label>
        <SeoFields draft={draft} setDraft={setDraft} />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={!!draft.noIndex}
            onChange={(e) =>
              setDraft((d) => ({ ...d, noIndex: e.target.checked }))
            }
          />
          No index
        </label>
        <Button type="submit" loading={saving}>
          Save SEO
        </Button>
      </form>

      {entries.length === 0 ? (
        <EmptyState
          title="No SEO entries"
          description="Add paths as you grow the storefront."
        />
      ) : (
        <SeoEntriesTable entries={entries} onEdit={edit} onRemove={remove} />
      )}
    </div>
  );
}

function SeoFields({
  draft,
  setDraft,
}: {
  draft: SeoDraft;
  setDraft: Dispatch<SetStateAction<SeoDraft>>;
}) {
  const keys = [
    "titleEn",
    "titleBn",
    "descriptionEn",
    "descriptionBn",
    "keywords",
    "canonicalUrl",
    "ogImage",
  ] as const;

  return (
    <SeoFieldGrid>
      {keys.map((key) => (
        <label
          key={key}
          className={key.startsWith("description") ? "md:col-span-2" : ""}
        >
          <span className="admin-label">{key}</span>
          {key.startsWith("description") ? (
            <textarea
              className="admin-input min-h-[72px]"
              value={(draft[key] as string) ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, [key]: e.target.value }))
              }
            />
          ) : (
            <input
              className="admin-input"
              value={(draft[key] as string) ?? ""}
              onChange={(e) =>
                setDraft((d) => ({ ...d, [key]: e.target.value }))
              }
            />
          )}
        </label>
      ))}
    </SeoFieldGrid>
  );
}

function SeoFieldGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-3 md:grid-cols-2">{children}</div>;
}

function SeoEntriesTable({
  entries,
  onEdit,
  onRemove,
}: {
  entries: SeoEntry[];
  onEdit: (row: SeoEntry) => void;
  onRemove: (path: string) => void;
}) {
  return (
    <div className="admin-card overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink/10 text-[10px] uppercase tracking-[0.16em] text-muted">
            <th className="px-5 py-3 text-left">Path</th>
            <th className="px-5 py-3 text-left">Title</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {entries.map((row) => (
            <tr key={row.id}>
              <td className="px-5 py-3 font-mono text-xs">{row.path}</td>
              <td className="px-5 py-3">{row.titleEn}</td>
              <td className="px-5 py-3 text-right">
                <Button variant="ghost" onClick={() => onEdit(row)}>
                  Edit
                </Button>
                <Button variant="ghost" onClick={() => onRemove(row.path)}>
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
