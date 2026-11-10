"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { formatBdt } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      const qs = q.trim() ? `?q=${encodeURIComponent(q.trim())}` : "";
      api<Product[]>(`/admin/products${qs}`)
        .then(setProducts)
        .finally(() => setLoading(false));
    }, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Curate ornaments, pricing, and visibility."
        actions={
          <Link
            href="/products/new"
            className="inline-flex items-center justify-center gap-2 bg-night px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cream"
          >
            New product
          </Link>
        }
      />
      <input
        className="admin-input mb-6 max-w-md"
        placeholder="Search name, SKU, slug…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products"
          description="Create your first piece for the catalogue."
          action={
            <Link
              href="/products/new"
              className="inline-flex bg-night px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cream"
            >
              Add product
            </Link>
          }
        />
      ) : (
        <div className="admin-card overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-[10px] uppercase tracking-[0.18em] text-muted">
                <th className="px-5 py-3 text-left font-medium">Product</th>
                <th className="px-5 py-3 text-left font-medium">SKU</th>
                <th className="px-5 py-3 text-right font-medium">Price</th>
                <th className="px-5 py-3 text-right font-medium">Stock</th>
                <th className="px-5 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-paper/50">
                  <td className="px-5 py-4">
                    <Link
                      href={`/products/${p.id}`}
                      className="font-medium text-night hover:text-rose"
                    >
                      {p.nameEn}
                    </Link>
                    <p className="text-xs text-muted">{p.slug}</p>
                  </td>
                  <td className="px-5 py-4 text-muted">{p.sku}</td>
                  <td className="px-5 py-4 text-right font-display text-lg">
                    {formatBdt(p.price)}
                  </td>
                  <td className="px-5 py-4 text-right">{p.stock}</td>
                  <td className="px-5 py-4">
                    <span
                      className={
                        p.published
                          ? "text-[10px] uppercase tracking-[0.16em] text-emerald-900"
                          : "text-[10px] uppercase tracking-[0.16em] text-muted"
                      }
                    >
                      {p.published ? "Live" : "Draft"}
                    </span>
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
