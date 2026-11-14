"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { RotateCcw, Trash2 } from "lucide-react";
import { api } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/format";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Button";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminCardListSkeleton } from "@/components/skeletons/AdminSkeletons";

type TrashKind =
  | "product"
  | "category"
  | "review"
  | "subscriber"
  | "order";

type TrashItem = {
  kind: TrashKind;
  id: string;
  title: string;
  subtitle?: string;
  deletedAt: string;
  expiresAt: string;
  daysLeft: number;
};

const KIND_LABEL: Record<TrashKind, string> = {
  product: "Product",
  category: "Category",
  review: "Review",
  subscriber: "Subscriber",
  order: "Order",
};

export default function RecycleBinPage() {
  const [items, setItems] = useState<TrashItem[] | null>(null);
  const [retentionDays, setRetentionDays] = useState(30);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await api<{
        items: TrashItem[];
        retentionDays: number;
      }>("/admin/recycle-bin");
      setItems(res.items);
      setRetentionDays(res.retentionDays);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't load trash");
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function restore(item: TrashItem) {
    const key = `${item.kind}:${item.id}`;
    setBusyKey(key);
    try {
      await api("/admin/recycle-bin", {
        method: "POST",
        body: JSON.stringify({
          action: "restore",
          kind: item.kind,
          id: item.id,
        }),
      });
      toast.success("Restored");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Restore failed");
    } finally {
      setBusyKey(null);
    }
  }

  async function destroy(item: TrashItem) {
    const ok = window.confirm(
      `Permanently delete “${item.title}”? This cannot be undone.`,
    );
    if (!ok) return;
    const key = `${item.kind}:${item.id}`;
    setBusyKey(key);
    try {
      await api(
        `/admin/recycle-bin?kind=${encodeURIComponent(item.kind)}&id=${encodeURIComponent(item.id)}`,
        { method: "DELETE" },
      );
      toast.success("Deleted forever");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        eyebrow="Library"
        title="Recycle bin"
        description={`Soft-deleted items stay here for ${retentionDays} days, then are removed automatically.`}
      />

      {items === null ? (
        <AdminCardListSkeleton count={4} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Recycle bin is empty"
          description="Deleted products, categories, reviews, and subscribers appear here."
        />
      ) : (
        <div className="admin-card divide-y divide-ink/10">
          {items.map((item) => {
            const key = `${item.kind}:${item.id}`;
            const busy = busyKey === key;
            return (
              <article
                key={key}
                className="flex flex-row flex-wrap items-center justify-between gap-4 px-5 py-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-ink/5 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-muted">
                      {KIND_LABEL[item.kind]}
                    </span>
                    <span
                      className={
                        item.daysLeft <= 3
                          ? "text-[10px] uppercase tracking-[0.14em] text-red-800"
                          : "text-[10px] uppercase tracking-[0.14em] text-muted"
                      }
                    >
                      {item.daysLeft} day{item.daysLeft === 1 ? "" : "s"} left
                    </span>
                  </div>
                  <h2 className="mt-2 truncate font-display text-xl text-night">
                    {item.title}
                  </h2>
                  {item.subtitle ? (
                    <p className="mt-0.5 truncate text-sm text-muted">
                      {item.subtitle}
                    </p>
                  ) : null}
                  <p className="mt-2 text-xs text-muted">
                    Deleted {formatDate(item.deletedAt)} · Auto-purge{" "}
                    {formatDate(item.expiresAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    loading={busy}
                    onClick={() => restore(item)}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Restore
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    loading={busy}
                    onClick={() => destroy(item)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete forever
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
