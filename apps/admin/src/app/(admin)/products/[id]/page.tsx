"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Product } from "@/lib/types";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductForm } from "@/components/products/ProductForm";
import { EmptyState } from "@/components/ui/EmptyState";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    api<Product>(`/admin/products/${id}`)
      .then(setProduct)
      .catch((e) => setError(e instanceof Error ? e.message : "Not found"));
  }, [id]);

  if (error) {
    return <EmptyState title="Product not found" description={error} />;
  }

  if (!product) {
    return <p className="text-muted">Loading…</p>;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title={product.nameEn}
        description={`SKU ${product.sku}`}
      />
      <ProductForm productId={product.id} initial={product} />
    </div>
  );
}
