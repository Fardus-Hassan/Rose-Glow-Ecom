"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Home,
  Images,
  Inbox,
  Menu,
  Package,
  Palette,
  ShoppingBag,
} from "lucide-react";
import { api } from "@/lib/admin/api";
import { formatBdt, formatDate } from "@/lib/admin/format";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { OrderStatusBadge } from "@/components/admin/orders/OrderStatusBadge";
import type { Order } from "@/lib/admin/types";

type Stats = {
  unread: number;
  messages: number;
  subscribers: number;
  media: number;
  pendingOrders: number;
  orderCount: number;
  productCount: number;
  recentMessages: Array<{
    id: string;
    name: string;
    subject: string | null;
    read: boolean;
    createdAt: string;
    message: string;
  }>;
  recentOrders: Order[];
};

const quickActions = [
  {
    href: "/admin/sections/settings",
    label: "Logo & brand",
    description: "Store name, contact, socials",
    icon: Palette,
  },
  {
    href: "/admin/sections/home",
    label: "Home page",
    description: "Hero, headlines, media",
    icon: Home,
  },
  {
    href: "/admin/sections/navigation",
    label: "Navigation",
    description: "Menu links & featured pick",
    icon: Menu,
  },
  {
    href: "/admin/products/new",
    label: "Add product",
    description: "Create a new ornament",
    icon: Package,
  },
  {
    href: "/admin/media",
    label: "Upload media",
    description: "Images and videos",
    icon: Images,
  },
  {
    href: "/admin/orders",
    label: "Orders",
    description: "Fulfilment queue",
    icon: ShoppingBag,
  },
];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [greeting, setGreeting] = useState("Dashboard");

  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(
      hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening",
    );
    api<Stats>("/admin/stats").then(setStats).catch(() => setStats(null));
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={greeting}
        description="Everything on your store can be changed from here — pages, products, messages, and media."
      />

      {!stats ? (
        <p className="text-sm text-muted">Loading atelier pulse…</p>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              href="/admin/messages"
              label="Unread messages"
              value={stats.unread}
              sub={`${stats.messages} total`}
              highlight={stats.unread > 0}
            />
            <StatCard
              href="/admin/orders"
              label="Pending orders"
              value={stats.pendingOrders}
              sub={`${stats.orderCount} total`}
              highlight={stats.pendingOrders > 0}
            />
            <StatCard
              href="/admin/products"
              label="Live products"
              value={stats.productCount}
              sub="Published"
            />
            <StatCard
              href="/admin/subscribers"
              label="Subscribers"
              value={stats.subscribers}
              sub={`${stats.media} media files`}
            />
          </div>

          <div>
            <h2 className="mb-3 text-sm font-medium text-muted">Quick actions</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map(({ href, label, description, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center gap-3 border border-ink/10 bg-cream/50 p-4 transition hover:border-rose/40"
                >
                  <span className="flex h-10 w-10 items-center justify-center border border-rose/30 text-rose">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-ink">{label}</span>
                    <span className="block truncate text-sm text-muted">
                      {description}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-rose" />
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="admin-card">
              <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
                <h2 className="font-display text-xl">Latest messages</h2>
                <Link
                  href="/admin/messages"
                  className="text-sm text-rose hover:underline"
                >
                  View all
                </Link>
              </div>
              {stats.recentMessages.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-muted">
                  No messages yet.
                </p>
              ) : (
                <ul className="divide-y divide-ink/10">
                  {stats.recentMessages.map((m) => (
                    <li key={m.id}>
                      <Link
                        href={`/admin/messages?id=${m.id}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-paper"
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${m.read ? "bg-transparent" : "bg-rose"}`}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {m.name}
                            {m.subject ? ` · ${m.subject}` : ""}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            {m.message}
                          </span>
                        </span>
                        <Inbox className="h-4 w-4 text-muted" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="admin-card">
              <div className="flex items-center justify-between border-b border-ink/10 px-5 py-4">
                <h2 className="font-display text-xl">Recent orders</h2>
                <Link
                  href="/admin/orders"
                  className="text-sm text-rose hover:underline"
                >
                  View all
                </Link>
              </div>
              {stats.recentOrders.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-muted">
                  No orders yet.
                </p>
              ) : (
                <ul className="divide-y divide-ink/10">
                  {stats.recentOrders.map((order) => (
                    <li key={order.id}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="flex items-center gap-3 px-5 py-3 hover:bg-paper"
                      >
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium">
                            {order.orderNumber}
                          </span>
                          <span className="block text-xs text-muted">
                            {order.customerName} · {formatDate(order.createdAt)}
                          </span>
                        </span>
                        <OrderStatusBadge status={order.status} />
                        <span className="text-sm">
                          {formatBdt(order.total)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  href,
  label,
  value,
  sub,
  highlight,
}: {
  href: string;
  label: string;
  value: number;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`border p-4 transition hover:border-rose/40 ${highlight ? "border-rose/50 bg-rose/10" : "border-ink/10 bg-cream/40"}`}
    >
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl text-ink">{value}</p>
      <p className="mt-1 text-xs text-muted">{sub}</p>
    </Link>
  );
}
