"use client";

import type { SeoData } from "@/lib/cms/types";
import { MediaField } from "@/components/admin/media/MediaLibrary";
import { GoogleSerpPreview } from "@/components/admin/form/GoogleSerpPreview";

export function SeoCard({
  value,
  onChange,
  fallbackTitle,
  fallbackDescription,
  path,
}: {
  value: SeoData;
  onChange: (value: SeoData) => void;
  fallbackTitle: string;
  fallbackDescription: string;
  path: string;
}) {
  const title = value.title || fallbackTitle;
  const description = value.description || fallbackDescription;

  return (
    <div className="admin-card overflow-hidden">
      <div className="border-b border-ink/10 px-5 py-4">
        <h2 className="font-display text-xl text-ink">Search engine (SEO)</h2>
        <p className="mt-1 text-sm text-muted">
          How this page looks on Google. Empty fields use page content.
        </p>
      </div>
      <div className="space-y-5 p-5">
        <GoogleSerpPreview
          path={path}
          title={title}
          description={description}
        />
        <label className="block">
          <span className="admin-label">SEO title</span>
          <input
            className="admin-input"
            value={value.title || ""}
            maxLength={70}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="admin-label">SEO description</span>
          <textarea
            className="admin-input min-h-[5rem] resize-y"
            value={value.description || ""}
            maxLength={180}
            onChange={(e) =>
              onChange({ ...value, description: e.target.value })
            }
          />
        </label>
        <div>
          <span className="admin-label">OG image</span>
          <MediaField
            value={value.ogImage || ""}
            onChange={(ogImage) => onChange({ ...value, ogImage })}
            kind="image"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={!!value.noIndex}
            onChange={(e) => onChange({ ...value, noIndex: e.target.checked })}
          />
          Hide from search engines (noindex)
        </label>
      </div>
    </div>
  );
}
