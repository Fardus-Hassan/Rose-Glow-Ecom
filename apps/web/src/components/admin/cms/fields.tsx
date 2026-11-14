"use client";

import { useId } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import type { Field } from "@/lib/cms/schema";
import { emptyForField } from "@/lib/cms/schema";
import { cn } from "@/lib/format";
import { MediaField } from "@/components/admin/media/MediaLibrary";

type Obj = Record<string, unknown>;

export function FieldShell({
  field,
  htmlFor,
  children,
}: {
  field: Pick<Field, "label" | "help" | "width">;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "min-w-0",
        field.width === "half" ? "col-span-2 sm:col-span-1" : "col-span-2",
      )}
    >
      {field.label ? (
        <label htmlFor={htmlFor} className="admin-label">
          {field.label}
        </label>
      ) : null}
      {children}
      {field.help ? (
        <p className="mt-1.5 text-xs text-muted">{field.help}</p>
      ) : null}
    </div>
  );
}

export function FieldsGrid({
  fields,
  value,
  onChange,
}: {
  fields: Field[];
  value: Obj;
  onChange: (value: Obj) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-5">
      {fields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={value?.[field.name]}
          onChange={(v) => onChange({ ...value, [field.name]: v })}
        />
      ))}
    </div>
  );
}

export function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: Field;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const id = useId();
  const str = typeof value === "string" ? value : value == null ? "" : String(value);

  if (field.type === "textarea") {
    return (
      <FieldShell field={field} htmlFor={id}>
        <textarea
          id={id}
          className="admin-input min-h-[5.5rem] resize-y"
          rows={field.rows ?? 3}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        />
      </FieldShell>
    );
  }

  if (field.type === "toggle") {
    return (
      <FieldShell field={field}>
        <button
          type="button"
          onClick={() => onChange(!value)}
          className={cn(
            "inline-flex h-9 items-center rounded-full border px-3 text-xs uppercase tracking-[0.16em] transition",
            value
              ? "border-rose bg-rose/15 text-ink"
              : "border-ink/15 text-muted",
          )}
        >
          {value ? "On" : "Off"}
        </button>
      </FieldShell>
    );
  }

  if (field.type === "number") {
    const num = typeof value === "number" ? value : Number(value || 0);
    const hasRange =
      typeof field.min === "number" && typeof field.max === "number";
    return (
      <FieldShell field={field} htmlFor={id}>
        <div className="space-y-2">
          {hasRange ? (
            <div className="flex items-center gap-3">
              <input
                id={id}
                type="range"
                className="h-2 w-full cursor-pointer accent-[color:var(--rg-pink,#e891a8)]"
                min={field.min}
                max={field.max}
                value={Number.isFinite(num) ? num : field.min}
                onChange={(e) => onChange(Number(e.target.value))}
              />
              <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted">
                {Number.isFinite(num) ? Math.round(num) : field.min}
              </span>
            </div>
          ) : null}
          <input
            id={hasRange ? `${id}-num` : id}
            type="number"
            className="admin-input"
            min={field.min}
            max={field.max}
            value={Number.isFinite(num) ? num : 0}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        </div>
      </FieldShell>
    );
  }

  if (field.type === "select") {
    return (
      <FieldShell field={field} htmlFor={id}>
        <select
          id={id}
          className="admin-input"
          value={str}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </FieldShell>
    );
  }

  if (field.type === "image") {
    return (
      <FieldShell field={field}>
        <MediaField value={str} onChange={(v) => onChange(v)} kind="image" />
      </FieldShell>
    );
  }

  if (field.type === "video") {
    return (
      <FieldShell field={field}>
        <MediaField value={str} onChange={(v) => onChange(v)} kind="video" />
      </FieldShell>
    );
  }

  if (field.type === "link") {
    const obj = (value && typeof value === "object" ? value : {}) as Obj;
    return (
      <FieldShell field={field}>
        <div className="grid grid-cols-2 gap-3">
          <input
            className="admin-input"
            placeholder="Label"
            value={String(obj.label || "")}
            onChange={(e) => onChange({ ...obj, label: e.target.value })}
          />
          <input
            className="admin-input"
            placeholder="/path or https://"
            value={String(obj.href || "")}
            onChange={(e) => onChange({ ...obj, href: e.target.value })}
          />
        </div>
      </FieldShell>
    );
  }

  if (field.type === "group") {
    const obj = (value && typeof value === "object" ? value : {}) as Obj;
    return (
      <FieldShell field={field}>
        <div className="rounded-sm border border-ink/10 bg-paper/50 p-4">
          <FieldsGrid
            fields={field.fields}
            value={obj}
            onChange={(next) => onChange(next)}
          />
        </div>
      </FieldShell>
    );
  }

  if (field.type === "list") {
    const items = Array.isArray(value) ? (value as string[]) : [];
    return (
      <FieldShell field={field}>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                className="admin-input"
                value={item}
                onChange={(e) => {
                  const next = [...items];
                  next[index] = e.target.value;
                  onChange(next);
                }}
              />
              <button
                type="button"
                className="border border-ink/15 px-3 text-muted hover:text-ink"
                onClick={() => onChange(items.filter((_, i) => i !== index))}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-rose"
            onClick={() => onChange([...items, ""])}
          >
            <Plus className="h-3.5 w-3.5" />
            {field.addLabel || "Add item"}
          </button>
        </div>
      </FieldShell>
    );
  }

  if (field.type === "repeater") {
    const items = Array.isArray(value) ? (value as Obj[]) : [];
    return (
      <FieldShell field={field}>
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-sm border border-ink/10 bg-paper/60 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-muted">
                  <GripVertical className="h-3.5 w-3.5" />
                  Item {index + 1}
                </p>
                <button
                  type="button"
                  className="text-muted hover:text-ink"
                  onClick={() =>
                    onChange(items.filter((_, i) => i !== index))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <FieldsGrid
                fields={field.fields}
                value={item}
                onChange={(next) => {
                  const copy = [...items];
                  copy[index] = next;
                  onChange(copy);
                }}
              />
            </div>
          ))}
          <button
            type="button"
            disabled={field.max ? items.length >= field.max : false}
            className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-rose disabled:opacity-40"
            onClick={() => {
              const blank: Obj = {};
              for (const f of field.fields) blank[f.name] = emptyForField(f);
              onChange([...items, blank]);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
            {field.addLabel || "Add item"}
          </button>
        </div>
      </FieldShell>
    );
  }

  return (
    <FieldShell field={field} htmlFor={id}>
      <input
        id={id}
        type={field.type === "url" ? "url" : "text"}
        className="admin-input"
        placeholder={field.placeholder}
        value={str}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

