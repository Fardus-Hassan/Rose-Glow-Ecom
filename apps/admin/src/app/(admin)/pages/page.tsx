"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { CmsPage } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import clsx from "clsx";

export default function PagesAdminPage() {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [active, setActive] = useState<CmsPage | null>(null);
  const [draft, setDraft] = useState<Partial<CmsPage>>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api<CmsPage[]>("/admin/pages").then((rows) => {
      setPages(rows);
      if (rows[0]) pick(rows[0]);
    });
  }, []);

  function pick(page: CmsPage) {
    setActive(page);
    setDraft({ ...page });
    setMessage(null);
  }

  async function save() {
    if (!active) return;
    setSaving(true);
    setMessage(null);
    try {
      const updated = await api<CmsPage>(`/admin/pages/${active.slug}`, {
        method: "PUT",
        body: JSON.stringify(draft),
      });
      setActive(updated);
      const rows = await api<CmsPage[]>("/admin/pages");
      setPages(rows);
      setMessage("Saved");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  function field<K extends keyof CmsPage>(key: K, value: CmsPage[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  return (
    <div>
      <PageHeader
        eyebrow="CMS"
        title="Pages"
        description="About, contact, and editorial pages with bilingual SEO."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <ul className="admin-card divide-y divide-ink/10">
          {pages.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => pick(p)}
                className={clsx(
                  "w-full px-5 py-4 text-left",
                  active?.slug === p.slug && "bg-paper/80",
                )}
              >
                <p className="font-medium text-night">{p.titleEn}</p>
                <p className="text-xs text-muted">/{p.slug}</p>
              </button>
            </li>
          ))}
        </ul>

        {active ? (
          <PageEditor
            draft={draft}
            field={field}
            message={message}
            saving={saving}
            save={save}
          />
        ) : null}
      </div>
    </div>
  );
}

function PageEditor({
  draft,
  field,
  message,
  saving,
  save,
}: {
  draft: Partial<CmsPage>;
  field: <K extends keyof CmsPage>(key: K, value: CmsPage[K]) => void;
  message: string | null;
  saving: boolean;
  save: () => void;
}) {
  return (
    <div className="admin-card space-y-4 p-6 lg:col-span-2">
      {(
        [
          ["titleEn", "Title EN"],
          ["titleBn", "Title BN"],
          ["bodyEn", "Body EN", true],
          ["bodyBn", "Body BN", true],
          ["seoTitleEn", "SEO title EN"],
          ["seoTitleBn", "SEO title BN"],
          ["seoDescriptionEn", "SEO description EN", true],
          ["seoDescriptionBn", "SEO description BN", true],
          ["ogImage", "OG image URL"],
        ] as const
      ).map(([key, label, multiline]) => (
        <label key={key}>
          <span className="admin-label">{label}</span>
          {multiline ? (
            <textarea
              className="admin-input min-h-[96px]"
              value={(draft[key] as string) ?? ""}
              onChange={(e) => field(key, e.target.value)}
            />
          ) : (
            <input
              className="admin-input"
              value={(draft[key] as string) ?? ""}
              onChange={(e) => field(key, e.target.value)}
            />
          )}
        </label>
      ))}
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={!!draft.isPublished}
          onChange={(e) => field("isPublished", e.target.checked)}
        />
        Published
      </label>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
      <Button onClick={save} loading={saving}>
        Save page
      </Button>
    </div>
  );
}
