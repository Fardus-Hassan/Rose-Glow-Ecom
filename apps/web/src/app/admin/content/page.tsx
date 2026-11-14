"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/admin/api";
import type { ContentBlock } from "@/lib/admin/types";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Button";
import clsx from "clsx";

export default function ContentPage() {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [selected, setSelected] = useState<ContentBlock | null>(null);
  const [label, setLabel] = useState("");
  const [group, setGroup] = useState("");
  const [fields, setFields] = useState<Record<string, string>>({});
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState("{}");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    api<ContentBlock[]>("/admin/content/blocks").then((rows) => {
      setBlocks(rows);
      if (rows[0]) selectBlock(rows[0]);
    });
  }, []);

  function selectBlock(block: ContentBlock) {
    setSelected(block);
    setLabel(block.label);
    setGroup(block.group ?? "");
    setJsonText(JSON.stringify(block.value, null, 2));
    setJsonMode(!["hero", "contact", "social"].includes(block.key));
    if (block.key === "hero") {
      const v = block.value as Record<string, unknown>;
      const img = (
        block.value as { image?: { desktop?: string; mobile?: string } }
      ).image;
      setFields({
        brand: String(v.brand ?? ""),
        headlineEn: String(v.headlineEn ?? ""),
        headlineBn: String(v.headlineBn ?? ""),
        bodyEn: String(v.bodyEn ?? ""),
        bodyBn: String(v.bodyBn ?? ""),
        ctaEn: String(v.ctaEn ?? ""),
        ctaBn: String(v.ctaBn ?? ""),
        overlayDesktop:
          v.overlayDesktop === false ||
          v.overlayDesktop === "false" ||
          (v.overlayDesktop == null &&
            (v.overlayEnabled === false || v.overlayEnabled === "false"))
            ? "false"
            : "true",
        overlayMobile:
          v.overlayMobile === false ||
          v.overlayMobile === "false" ||
          (v.overlayMobile == null &&
            (v.overlayEnabled === false || v.overlayEnabled === "false"))
            ? "false"
            : "true",
        imageDesktop: img?.desktop ?? "",
        imageMobile: img?.mobile ?? "",
      });
    } else if (block.key === "contact") {
      const v = block.value as Record<string, string>;
      setFields({
        email: String(v.email ?? ""),
        phone: String(v.phone ?? ""),
        whatsapp: String(v.whatsapp ?? ""),
        addressEn: String(v.addressEn ?? ""),
        addressBn: String(v.addressBn ?? ""),
        hoursEn: String(v.hoursEn ?? ""),
        hoursBn: String(v.hoursBn ?? ""),
      });
    } else if (block.key === "social") {
      const v = block.value as Record<string, string>;
      setFields({
        instagram: String(v.instagram ?? ""),
        facebook: String(v.facebook ?? ""),
        whatsapp: String(v.whatsapp ?? ""),
        tiktok: String(v.tiktok ?? ""),
      });
    }
  }

  async function save() {
    if (!selected) return;
    setSaving(true);
    setMessage(null);
    let value: Record<string, unknown>;
    try {
      if (jsonMode) {
        value = JSON.parse(jsonText) as Record<string, unknown>;
      } else if (selected.key === "hero") {
        value = {
          brand: fields.brand,
          headlineEn: fields.headlineEn,
          headlineBn: fields.headlineBn,
          bodyEn: fields.bodyEn,
          bodyBn: fields.bodyBn,
          ctaEn: fields.ctaEn,
          ctaBn: fields.ctaBn,
          mode: "image",
          overlayDesktop: fields.overlayDesktop !== "false",
          overlayMobile: fields.overlayMobile !== "false",
          image: {
            desktop: fields.imageDesktop,
            mobile: fields.imageMobile,
          },
        };
      } else {
        value = { ...fields };
      }
      await api(`/admin/content/blocks/${selected.key}`, {
        method: "PUT",
        body: JSON.stringify({ label, group, value }),
      });
      setMessage("Saved");
      const rows = await api<ContentBlock[]>("/admin/content/blocks");
      setBlocks(rows);
      const fresh = rows.find((b) => b.key === selected.key);
      if (fresh) selectBlock(fresh);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  const structuredKeys =
    selected?.key === "hero"
      ? [
          ["brand", "Brand"],
          ["headlineEn", "Headline EN"],
          ["headlineBn", "Headline BN"],
          ["bodyEn", "Body EN"],
          ["bodyBn", "Body BN"],
          ["ctaEn", "CTA EN"],
          ["ctaBn", "CTA BN"],
          ["overlayDesktop", "Overlay laptop (true/false)"],
          ["overlayMobile", "Overlay mobile (true/false)"],
          ["imageDesktop", "Desktop image"],
          ["imageMobile", "Mobile image"],
        ]
      : selected?.key === "contact"
        ? [
            ["email", "Email"],
            ["phone", "Phone"],
            ["whatsapp", "WhatsApp"],
            ["addressEn", "Address EN"],
            ["addressBn", "Address BN"],
            ["hoursEn", "Hours EN"],
            ["hoursBn", "Hours BN"],
          ]
        : selected?.key === "social"
          ? [
              ["instagram", "Instagram"],
              ["facebook", "Facebook"],
              ["whatsapp", "WhatsApp"],
              ["tiktok", "TikTok"],
            ]
          : [];

  return (
    <div>
      <PageHeader
        eyebrow="CMS"
        title="Content blocks"
        description="Hero, contact, social, and flexible JSON blocks."
      />
      <div className="grid gap-6 lg:grid-cols-3">
        <ul className="admin-card divide-y divide-ink/10 lg:col-span-1">
          {blocks.map((b) => (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => selectBlock(b)}
                className={clsx(
                  "w-full px-5 py-4 text-left transition hover:bg-paper/60",
                  selected?.key === b.key && "bg-paper/80",
                )}
              >
                <p className="font-medium text-night">{b.label}</p>
                <p className="text-xs text-muted">{b.key}</p>
              </button>
            </li>
          ))}
        </ul>

        {selected ? (
          <div className="admin-card space-y-4 p-6 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-2xl text-night">{selected.key}</h2>
              <label className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-muted">
                <input
                  type="checkbox"
                  checked={jsonMode}
                  onChange={(e) => setJsonMode(e.target.checked)}
                />
                JSON editor
              </label>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <label>
                <span className="admin-label">Label</span>
                <input
                  className="admin-input"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                />
              </label>
              <label>
                <span className="admin-label">Group</span>
                <input
                  className="admin-input"
                  value={group}
                  onChange={(e) => setGroup(e.target.value)}
                />
              </label>
            </div>
            {jsonMode ? (
              <textarea
                className="admin-input min-h-[320px] font-mono text-xs"
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
              />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {structuredKeys.map(([key, labelText]) => (
                  <label
                    key={key}
                    className={key.startsWith("body") || key.startsWith("headline") ? "md:col-span-2" : ""}
                  >
                    <span className="admin-label">{labelText}</span>
                    {key.startsWith("body") ? (
                      <textarea
                        className="admin-input min-h-[72px]"
                        value={fields[key] ?? ""}
                        onChange={(e) =>
                          setFields((f) => ({ ...f, [key]: e.target.value }))
                        }
                      />
                    ) : (
                      <input
                        className="admin-input"
                        value={fields[key] ?? ""}
                        onChange={(e) =>
                          setFields((f) => ({ ...f, [key]: e.target.value }))
                        }
                      />
                    )}
                  </label>
                ))}
              </div>
            )}
            {message ? (
              <p className="text-sm text-muted">{message}</p>
            ) : null}
            <Button onClick={save} loading={saving}>
              Save block
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
