"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/constants";
import type { Order } from "@/lib/types";
import { formatBdt, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<OrderStatus>("PENDING");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api<Order>(`/admin/orders/${id}`)
      .then((o) => {
        setOrder(o);
        setStatus(o.status);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Not found"));
  }, [id]);

  async function saveStatus() {
    if (!order) return;
    setSaving(true);
    try {
      const updated = await api<Order>(`/admin/orders/${order.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrder(updated);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setSaving(false);
    }
  }

  if (error && !order) {
    return (
      <EmptyState
        title="Order not found"
        description={error}
        action={
          <Button variant="secondary" onClick={() => router.push("/orders")}>
            Back to orders
          </Button>
        }
      />
    );
  }

  if (!order) {
    return <div className="py-20 text-center text-muted">Loading…</div>;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Order"
        title={order.orderNumber}
        description={`Placed ${formatDate(order.createdAt)}`}
        actions={<OrderStatusBadge status={order.status} />}
      />

      <div className="mb-8 flex flex-wrap items-end gap-3 admin-card p-5">
        <div>
          <label className="admin-label">Update status</label>
          <select
            className="admin-input min-w-[200px]"
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
          >
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={saveStatus} loading={saving} disabled={status === order.status}>
          Save status
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="admin-card p-5 lg:col-span-1">
          <h2 className="font-display text-xl text-night">Customer</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">Name</dt>
              <dd className="mt-1">{order.customerName}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">Phone</dt>
              <dd className="mt-1">{order.customerPhone}</dd>
            </div>
            {order.customerEmail ? (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">Email</dt>
                <dd className="mt-1">{order.customerEmail}</dd>
              </div>
            ) : null}
            <div>
              <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">Address</dt>
              <dd className="mt-1 leading-relaxed">
                {order.addressLine}
                <br />
                {order.city}, {order.district}
              </dd>
            </div>
            {order.note ? (
              <div>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-muted">Note</dt>
                <dd className="mt-1 text-muted">{order.note}</dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="admin-card lg:col-span-2">
          <div className="border-b border-ink/10 px-5 py-4">
            <h2 className="font-display text-xl text-night">Line items</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.16em] text-muted">
                <th className="px-5 py-3 text-left font-medium">Item</th>
                <th className="px-5 py-3 text-right font-medium">Qty</th>
                <th className="px-5 py-3 text-right font-medium">Unit</th>
                <th className="px-5 py-3 text-right font-medium">Line</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {(order.items ?? []).map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3">
                    <p>{item.productName}</p>
                    <p className="text-xs text-muted">{item.productSku}</p>
                  </td>
                  <td className="px-5 py-3 text-right">{item.quantity}</td>
                  <td className="px-5 py-3 text-right">{formatBdt(item.unitPrice)}</td>
                  <td className="px-5 py-3 text-right font-medium">
                    {formatBdt(item.lineTotal)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="space-y-2 border-t border-ink/10 px-5 py-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd>{formatBdt(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Shipping</dt>
              <dd>{formatBdt(order.shippingFee)}</dd>
            </div>
            {order.discount > 0 ? (
              <div className="flex justify-between">
                <dt className="text-muted">Discount</dt>
                <dd>-{formatBdt(order.discount)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-ink/10 pt-3 font-display text-xl text-night">
              <dt>Total</dt>
              <dd>{formatBdt(order.total)}</dd>
            </div>
            <div className="flex justify-between text-xs text-muted">
              <dt>Payment</dt>
              <dd>
                {order.paymentMethod} · {order.paymentStatus}
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
