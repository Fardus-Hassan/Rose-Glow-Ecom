"use client";

import { ProductLanding } from "@/components/landing/ProductLanding";

/** @deprecated Use ProductLanding with productSlug — kept for compatibility. */
export function PearlBloomLanding() {
  return (
    <ProductLanding
      productSlug="pearl-bloom-earrings"
      relatedSlugs={[
        "soft-hoop-earrings",
        "rose-veil-necklace",
        "petal-ring",
      ]}
    />
  );
}
