"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/constants";
import type { Order } from "@/lib/types";
import { formatBdt, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [status, setStatus] = useState<OrderStatus | "">("");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (q.trim()) params.set("q", q.trim());
    const qs = params.toString();
    api<Order[]>(`/admin/orders${qs ? `?${qs}` : ""}`)
      .then(setOrders)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [status, q]);

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
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          className="admin-input max-w-md"
          placeholder="Search name, phone, order #…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <select
          className="admin-input max-w-xs"
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
        <div className="py-20 text-center text-sm text-muted">Loading…</div>
      ) : orders.length === 0 ? (
        <EmptyState
          title="No matching orders"
          description="Try clearing filters or check back later."
        />
      ) : (
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
                      href={`/orders/${order.id}`}
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
      )}
    </div>
  );
}
