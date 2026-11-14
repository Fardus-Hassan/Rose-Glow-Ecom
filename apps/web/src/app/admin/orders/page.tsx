"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/admin/api";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin/constants";
import type { Order } from "@/lib/admin/types";
import { formatBdt, formatDate } from "@/lib/admin/format";
import {
  ADMIN_PAGE_SIZE,
  pageQuery,
  type Paginated,
} from "@/lib/admin/pagination";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminPagination } from "@/components/admin/ui/AdminPagination";
import { AdminTableSkeleton } from "@/components/skeletons/AdminSkeletons";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = ADMIN_PAGE_SIZE.orders;

  useEffect(() => {
    setPage(1);
  }, [status, q]);

  const load = useCallback(() => {
    setLoading(true);
    api<Paginated<Order>>(
      `/admin/orders${pageQuery(page, pageSize, {
        status: status || undefined,
        q: q.trim() || undefined,
      })}`,
    )
      .then((res) => {
        setOrders(res.items);
        setTotalPages(res.totalPages);
        setTotal(res.total);
        if (res.page !== page) setPage(res.page);
        setError(null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [status, q, page, pageSize]);

  useEffect(() => {
    const t = setTimeout(load, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [load, q]);

  return (
    <div>
      <PageHeader
        eyebrow="Commerce"
        title="Orders"
        description="Search and filter the fulfilment queue."
      />
      <div className="mb-6 flex flex-row flex-wrap items-center gap-3">
        <input
          className="admin-input min-w-0 flex-1 max-w-md"
          placeholder="Search name, phone, order #…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="admin-input max-w-xs shrink-0"
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus | "")}
        >
          <option value="">All statuses</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <EmptyState title="Could not load orders" description={error} />
      ) : loading ? (
        <AdminTableSkeleton columns={5} rows={8} />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No matching orders"
          description="Try clearing filters or check back later."
        />
      ) : (
        <>
          <div className="admin-card overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink/10 text-[10px] uppercase tracking-[0.18em] text-muted">
                  <th className="px-5 py-3 font-medium">Order</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Total</th>
                  <th className="px-5 py-3 font-medium">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-paper/60">
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-night hover:text-rose"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <p>{order.customerName}</p>
                      <p className="text-xs text-muted">{order.customerPhone}</p>
                    </td>
                    <td className="px-5 py-4">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-4 font-display text-lg text-night">
                      {formatBdt(order.total)}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {formatDate(order.createdAt)}
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
