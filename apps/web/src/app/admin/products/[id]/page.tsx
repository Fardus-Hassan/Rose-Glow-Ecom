"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/admin/api";
import type { Product } from "@/lib/admin/types";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { ProductForm } from "@/components/admin/products/ProductForm";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminFormSkeleton } from "@/components/skeletons/AdminSkeletons";

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
    return <AdminFormSkeleton panels={3} />;
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
