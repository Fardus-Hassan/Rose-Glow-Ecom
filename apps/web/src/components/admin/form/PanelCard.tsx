import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export function PanelCard({
  id,
  title,
  description,
  children,
  className,
}: {
  id?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={cn("admin-card scroll-mt-28 overflow-hidden", className)}
    >
      <div className="border-b border-ink/10 px-5 py-4 sm:px-6">
        <h2 className="font-display text-xl text-ink">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-muted">{description}</p>
        ) : null}
      </div>
      <div className="space-y-5 p-5 sm:p-6">{children}</div>
    </section>
  );
}

export function Field({
  label,
  children,
  className,
  hint,
}: {
  label: string;
  children: ReactNode;
  className?: string;
  hint?: string;
}) {
  return (
    <label className={cn("block min-w-0", className)}>
      <span className="admin-label">{label}</span>
      {children}
      {hint ? <span className="mt-1.5 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function Toggle({
  label,
  checked,
  onChange,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  hint?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-start justify-between gap-3 border px-3 py-3 text-left transition",
        checked ? "border-rose/40 bg-rose/10" : "border-ink/10 bg-paper/40",
      )}
    >
      <span>
        <span className="block text-sm text-ink">{label}</span>
        {hint ? <span className="mt-0.5 block text-xs text-muted">{hint}</span> : null}
      </span>
      <span
        className={cn(
          "mt-0.5 inline-flex h-6 w-10 shrink-0 items-center rounded-full border px-0.5 transition",
          checked ? "border-night bg-night" : "border-ink/20 bg-cream",
        )}
      >
        <span
          className={cn(
            "h-4 w-4 rounded-full bg-cream transition",
            checked ? "translate-x-4" : "translate-x-0 bg-ink/30",
          )}
        />
      </span>
    </button>
  );
}
