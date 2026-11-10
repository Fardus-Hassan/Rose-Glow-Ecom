import { formatBdt } from "@/lib/format";

export function StatCard({
  label,
  value,
  hint,
  money,
}: {
  label: string;
  value: number | string;
  hint?: string;
  money?: boolean;
}) {
  const display =
    typeof value === "number" && money ? formatBdt(value) : String(value);

  return (
    <div className="admin-card p-5">
      <p className="text-[10px] uppercase tracking-[0.22em] text-muted">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl text-night">{display}</p>
      {hint ? <p className="mt-2 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
