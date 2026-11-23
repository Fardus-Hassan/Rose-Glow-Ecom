"use client";

import { useMemo, useState } from "react";
import {
  chosenOffer,
  defaultOptionId,
  galleryForOffer,
  type Product,
} from "@/data/products";
import type { SocialLink } from "@/data/social";
import type { ContactContent } from "@/lib/catalog";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";

/**
 * Desktop: balanced 50/50 — gallery capped so jewelry stays full-frame.
 * Mobile: stacked (unchanged feel).
 */
export function ProductShowcase({
  product,
  contact,
  social,
}: {
  product: Product;
  contact?: ContactContent;
  social?: SocialLink[];
}) {
  const [optionId, setOptionId] = useState(defaultOptionId(product));
  const offer = chosenOffer(product, optionId);
  const media = useMemo(
    () => galleryForOffer(product, offer.media),
    [product, offer.media],
  );
  const compare = offer.compareAtPrice;
  const discount =
    compare && compare > offer.price
      ? Math.round(((compare - offer.price) / compare) * 100)
      : 0;

  return (
    <section className="relative grid w-full gap-8 md:gap-10 lg:grid-cols-2 lg:items-start lg:gap-10 xl:gap-14">
      <div className="relative min-w-0 lg:sticky lg:top-[6.5rem] lg:self-start">
        <div className="overflow-hidden">
          <ProductGallery
            key={offer.optionId || "product"}
            media={media}
            discount={discount}
          />
        </div>
      </div>

      <div className="min-w-0">
        <ProductInfo
          product={product}
          optionId={optionId}
          onOptionId={setOptionId}
          contact={contact}
          social={social}
        />
      </div>
    </section>
  );
}
