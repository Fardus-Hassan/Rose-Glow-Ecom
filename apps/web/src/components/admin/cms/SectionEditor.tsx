"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Save } from "lucide-react";
import { toast, Toaster } from "sonner";
import { api } from "@/lib/admin/api";
import { getSectionSchema } from "@/lib/cms/schema";
import { sectionDefaults } from "@/lib/cms/defaults";
import type { SeoData, SectionKey } from "@/lib/cms/types";
import { FieldsGrid } from "./fields";
import { SeoCard } from "./SeoCard";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Button";
import { AdminFormSkeleton } from "@/components/skeletons/AdminSkeletons";

function getAt(obj: Record<string, unknown>, path?: string) {
  if (!path) return obj;
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const part of parts) {
    if (!cur || typeof cur !== "object") return {};
    cur = (cur as Record<string, unknown>)[part];
  }
  return (cur && typeof cur === "object" ? cur : {}) as Record<string, unknown>;
}

function setAt(
  obj: Record<string, unknown>,
  path: string | undefined,
  value: Record<string, unknown>,
) {
  if (!path) return { ...obj, ...value };
  const parts = path.split(".");
  const clone = structuredClone(obj);
  let cur: Record<string, unknown> = clone;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!cur[key] || typeof cur[key] !== "object") cur[key] = {};
    cur = cur[key] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
  return clone;
}

export function SectionEditor({ sectionKey }: { sectionKey: SectionKey }) {
  const schema = getSectionSchema(sectionKey);
  const [data, setData] = useState<Record<string, unknown>>(
    sectionDefaults[sectionKey] || {},
  );
  const [seo, setSeo] = useState<SeoData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api<{ data: Record<string, unknown>; seo?: SeoData | null }>(
      `/admin/cms/sections/${sectionKey}`,
    )
      .then((row) => {
        if (cancelled) return;
        setData(row.data || sectionDefaults[sectionKey] || {});
        setSeo(row.seo || {});
      })
      .catch((err) => toast.error(err.message))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sectionKey]);

  const fallbackTitle = useMemo(() => {
    const home = data as { hero?: { headlineEn?: string }; titleEn?: string };
    return (
      home.hero?.headlineEn ||
      home.titleEn ||
      schema?.label ||
      "Rose Glow"
    );
  }, [data, schema?.label]);

  if (!schema) {
    return <p className="text-sm text-muted">Unknown section.</p>;
  }

  async function save() {
    setSaving(true);
    try {
      await api(`/admin/cms/sections/${sectionKey}`, {
        method: "PUT",
        body: JSON.stringify({ data, seo }),
      });
      toast.success("Saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Toaster position="top-right" />
      <PageHeader
        title={schema.label}
        description={schema.description}
        actions={
          <div className="flex flex-wrap gap-2">
            {schema.path ? (
              <Link
                href={`/en${schema.path === "/" ? "" : schema.path}`}
                target="_blank"
                className="inline-flex min-h-10 items-center gap-2 border border-ink/15 px-4 text-[11px] uppercase tracking-[0.16em] text-ink"
              >
                View page <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            ) : null}
            <Button type="button" loading={saving} onClick={save}>
              <Save className="mr-2 h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        }
      />

      {loading ? (
        <AdminFormSkeleton panels={2} />
      ) : (
        <div className="space-y-6">
          {schema.panels.map((panel) => {
            const panelValue = getAt(data, panel.path);
            return (
              <section key={panel.title} className="admin-card p-5 md:p-6">
                <h2 className="font-display text-2xl text-ink">{panel.title}</h2>
                {panel.description ? (
                  <p className="mt-1 text-sm text-muted">{panel.description}</p>
                ) : null}
                <div className="mt-5">
                  <FieldsGrid
                    fields={panel.fields}
                    value={panelValue}
                    onChange={(next) =>
                      setData((prev) => setAt(prev, panel.path, next))
                    }
                  />
                </div>
              </section>
            );
          })}

          {schema.seo ? (
            <SeoCard
              value={seo}
              onChange={setSeo}
              fallbackTitle={String(fallbackTitle)}
              fallbackDescription={schema.description}
              path={schema.path || "/"}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
