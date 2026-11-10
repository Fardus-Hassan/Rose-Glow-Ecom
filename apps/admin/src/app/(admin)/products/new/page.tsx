"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { ProductForm } from "@/components/products/ProductForm";

export default function NewProductPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="New product"
        description="Compose a new piece for the Rose Glow collection."
      />
      <ProductForm />
    </div>
  );
}
