"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { DashboardOverview, Order } from "@/lib/types";
import { formatBdt, formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { StatCard } from "@/components/ui/StatCard";
import { OrderStatusBadge } from "@/components/orders/OrderStatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api<DashboardOverview>("/admin/dashboard")
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  if (error) {
    return (
      <EmptyState
        title="Dashboard unavailable"
        description={error}
      />
    );
  }

  if (!data) {
    return (
      <DashboardLoader />
    );
  }

  const { stats, statusGroups, recentOrders, lowStock } = data;

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title="Atelier pulse"
        description="Revenue, fulfilment rhythm, and catalogue health at a glance."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Revenue" value={stats.revenue} money />
        <StatCard label="Orders" value={stats.orderCount} hint={`${stats.pendingOrders} pending`} />
        <StatCard label="Products" value={stats.productCount} hint={`${stats.publishedProducts} live`} />
        <StatCard label="Published reviews" value={stats.reviewCount} />
        <StatCard label="Pending orders" value={stats.pendingOrders} />
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-5">
        <section className="admin-card lg:col-span-3">
          <div className="border-b border-ink/10 px-5 py-4">
            <h2 className="font-display text-xl text-night">Recent orders</h2>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-8">
              <EmptyState title="No orders yet" description="New orders will appear here." />
            </div>
          ) : (
            <ul className="divide-y divide-ink/10">
              {recentOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </ul>
          )}
        </section>

        <section className="admin-card lg:col-span-2">
          <div className="border-b border-ink/10 px-5 py-4">
            <h2 className="font-display text-xl text-night">Status mix</h2>
          </div>
          <ul className="space-y-3 p-5">
            {statusGroups.length === 0 ? (
              <li className="text-sm text-muted">No order data</li>
            ) : (
              statusGroups.map((row) => (
                <li
                  key={row.status}
                  className="flex items-center justify-between border border-ink/10 bg-paper/40 px-3 py-2"
                >
                  <OrderStatusBadge status={row.status} />
                  <span className="font-display text-lg text-night">{row.count}</span>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      {lowStock.length > 0 ? (
        <section className="admin-card mt-8">
          <div className="border-b border-ink/10 px-5 py-4">
            <h2 className="font-display text-xl text-night">Low stock</h2>
          </div>
          <ul className="divide-y divide-ink/10">
            {lowStock.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <ProductStockLink
                  href={`/products/${p.id}`}
                  name={p.nameEn}
                  sku={p.sku}
                />
                <span className="text-[11px] uppercase tracking-[0.16em] text-rose">
                  {p.stock} left
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm">
      <div>
        <Link
          href={`/orders/${order.id}`}
          className="font-medium text-night hover:text-rose"
        >
          {order.orderNumber}
        </Link>
        <p className="mt-1 text-muted">{order.customerName}</p>
        <p className="text-xs text-muted">{formatDate(order.createdAt)}</p>
      </div>
      <div className="flex items-center gap-4">
        <OrderStatusBadge status={order.status} />
        <span className="font-display text-lg text-night">{formatBdt(order.total)}</span>
      </div>
    </li>
  );
}

function ProductStockLink({
  href,
  name,
  sku,
}: {
  href: string;
  name: string;
  sku: string;
}) {
  return (
    <Link href={href} className="hover:text-rose">
      <span className="text-night">{name}</span>
      <span className="ml-2 text-xs text-muted">{sku}</span>
    </Link>
  );
}

function DashboardLoader() {
  return (
    <div className="flex items-center justify-center py-24">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose border-r-transparent" />
    </div>
  );
}
