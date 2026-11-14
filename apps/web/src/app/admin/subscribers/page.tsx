"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/format";
import {
  ADMIN_PAGE_SIZE,
  pageQuery,
  type Paginated,
} from "@/lib/admin/pagination";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Button";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminPagination } from "@/components/admin/ui/AdminPagination";
import { AdminTableSkeleton } from "@/components/skeletons/AdminSkeletons";

type Row = { id: string; email: string; createdAt: string };

export default function SubscribersPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = ADMIN_PAGE_SIZE.subscribers;

  useEffect(() => {
    setLoading(true);
    api<Paginated<Row>>(`/admin/subscribers${pageQuery(page, pageSize)}`)
      .then((res) => {
        setRows(res.items);
        setTotalPages(res.totalPages);
        setTotal(res.total);
        if (res.page !== page) setPage(res.page);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [page, pageSize]);

  async function exportCsv() {
    try {
      const res = await api<Paginated<Row>>("/admin/subscribers?export=1");
      const csv = [
        "email,createdAt",
        ...res.items.map((r) => `${r.email},${r.createdAt}`),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "rose-glow-subscribers.csv";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Subscribers"
        description="Newsletter emails collected from the storefront footer."
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={exportCsv}
            disabled={!total}
          >
            Export CSV
          </Button>
        }
      />

      {loading ? (
        <AdminTableSkeleton columns={2} rows={8} />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No subscribers yet"
          description="When someone joins from the footer newsletter, they appear here."
        />
      ) : (
        <>
          <div className="admin-card overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-ink/10 text-[10px] uppercase tracking-[0.16em] text-muted">
                <tr>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3 text-muted">
                      {formatDate(row.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        className="text-[11px] uppercase tracking-[0.14em] text-red-900/80 hover:text-red-900"
                        onClick={async () => {
                          if (
                            !confirm(
                              "Move this subscriber to the recycle bin? Restorable for 30 days.",
                            )
                          ) {
                            return;
                          }
                          try {
                            await api("/admin/subscribers", {
                              method: "DELETE",
                              body: JSON.stringify({ id: row.id }),
                            });
                            toast.success("Moved to recycle bin");
                            setPage(1);
                            setLoading(true);
                            const res = await api<Paginated<Row>>(
                              `/admin/subscribers${pageQuery(1, pageSize)}`,
                            );
                            setRows(res.items);
                            setTotalPages(res.totalPages);
                            setTotal(res.total);
                          } catch (err) {
                            toast.error(
                              err instanceof Error
                                ? err.message
                                : "Delete failed",
                            );
                          } finally {
                            setLoading(false);
                          }
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <AdminPagination
            page={page}
            totalPages={totalPages}
            total={total}
            pageSize={pageSize}
            onChange={setPage}
          />
        </>
      )}
    </div>
  );
}
