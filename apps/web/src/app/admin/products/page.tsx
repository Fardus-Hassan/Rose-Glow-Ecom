"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/admin/api";
import type { Product } from "@/lib/admin/types";
import { formatBdt } from "@/lib/admin/format";
import {
  ADMIN_PAGE_SIZE,
  pageQuery,
  type Paginated,
} from "@/lib/admin/pagination";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminPagination } from "@/components/admin/ui/AdminPagination";
import { AdminTableSkeleton } from "@/components/skeletons/AdminSkeletons";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = ADMIN_PAGE_SIZE.products;

  useEffect(() => {
    setPage(1);
  }, [q]);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      api<Paginated<Product>>(
        `/admin/products${pageQuery(page, pageSize, {
          q: q.trim() || undefined,
        })}`,
      )
        .then((res) => {
          setProducts(res.items);
          setTotalPages(res.totalPages);
          setTotal(res.total);
          if (res.page !== page) setPage(res.page);
        })
        .finally(() => setLoading(false));
    }, q ? 300 : 0);
    return () => clearTimeout(t);
  }, [q, page, pageSize]);

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Products"
        description="Curate ornaments, pricing, and visibility."
        actions={
          <Link
            href="/admin/products/new"
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
        <AdminTableSkeleton columns={5} rows={8} hasThumb />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products"
          description="Create your first piece for the catalogue."
          action={
            <Link
              href="/admin/products/new"
              className="inline-flex bg-night px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-cream"
            >
              Add product
            </Link>
          }
        />
      ) : (
        <>
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
                {products.map((p) => {
                  const thumb =
                    p.media?.find(
                      (m) => m.type === "IMAGE" || m.type === "image",
                    )?.src ||
                    p.ogImage ||
                    "";
                  return (
                    <tr key={p.id} className="hover:bg-paper/50">
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="flex items-center gap-3 font-medium text-night hover:text-rose"
                        >
                          <span className="h-12 w-12 shrink-0 overflow-hidden border border-ink/10 bg-paper-deep">
                            {thumb ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={thumb}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            ) : null}
                          </span>
                          <span>
                            <span className="block">{p.nameEn}</span>
                            <span className="block text-xs font-normal text-muted">
                              {p.slug}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-muted">{p.sku}</td>
                      <td className="px-5 py-4 text-right font-display text-lg">
                        {formatBdt(p.price)}
                      </td>
                      <td className="px-5 py-4 text-right">{p.stock}</td>
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={
                              p.published
                                ? "text-[10px] uppercase tracking-[0.16em] text-emerald-900"
                                : "text-[10px] uppercase tracking-[0.16em] text-muted"
                            }
                          >
                            {p.published ? "Live" : "Draft"}
                          </span>
                          {p.landingEnabled && p.landingSlug ? (
                            <Link
                              href={`/en/l/${p.landingSlug}`}
                              target="_blank"
                              className="text-[10px] uppercase tracking-[0.14em] text-rose hover:underline"
                            >
                              Landing ↗
                            </Link>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
