import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/format";

export function AdminTableSkeleton({
  columns = 5,
  rows = 8,
  hasThumb = false,
}: {
  columns?: number;
  rows?: number;
  hasThumb?: boolean;
}) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading list"
      className="admin-card overflow-x-auto"
    >
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-ink/10">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="px-5 py-3">
                <Skeleton className="h-2.5 w-16" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: columns }).map((_, c) => (
                <td key={c} className="px-5 py-3.5">
                  {c === 0 && hasThumb ? (
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-12 w-12 shrink-0" />
                      <div className="space-y-2">
                        <Skeleton className="h-3.5 w-36" />
                        <Skeleton className="h-2.5 w-24" />
                      </div>
                    </div>
                  ) : (
                    <Skeleton
                      className={cn(
                        "h-3.5",
                        c === columns - 1 ? "w-16" : "w-24",
                      )}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function AdminCardListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading"
      className="space-y-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <article key={i} className="admin-card space-y-3 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-[83%]" />
        </article>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function AdminMessagesSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading messages"
      className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
    >
      <div className="admin-card divide-y divide-ink/10 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-3 px-4 py-3.5">
            <Skeleton className="mt-1.5 h-2 w-2 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
        ))}
      </div>
      <div className="admin-card space-y-4 p-5 md:p-6">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[66%]" />
        <Skeleton className="mt-6 h-28 w-full" />
        <Skeleton className="h-10 w-28" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function AdminMediaSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading media"
      className="grid gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
    >
      {Array.from({ length: 15 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square w-full" />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function AdminFormSkeleton({ panels = 2 }: { panels?: number }) {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading form"
      className="space-y-6"
    >
      {Array.from({ length: panels }).map((_, i) => (
        <section key={i} className="admin-card space-y-5 p-5 md:p-6">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-3 w-72 max-w-full" />
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, f) => (
              <div key={f} className={f === 5 ? "md:col-span-2" : undefined}>
                <Skeleton className="mb-1.5 h-2.5 w-20" />
                <Skeleton className={f === 5 ? "h-24 w-full" : "h-10 w-full"} />
              </div>
            ))}
          </div>
        </section>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function AdminPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-10 max-w-md" />
      <AdminTableSkeleton hasThumb />
    </div>
  );
}
