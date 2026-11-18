"use client";

import { useMemo, useState } from "react";
import {
  chosenOffer,
  defaultOptionId,
  galleryForOffer,
  type Product,
} from "@/data/products";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductInfo } from "@/components/product/ProductInfo";

export function ProductShowcase({ product }: { product: Product }) {
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
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-start lg:gap-10 xl:gap-14">
      <div className="lg:sticky lg:top-28">
        <ProductGallery
          key={offer.optionId || "product"}
          media={media}
          discount={discount}
        />
      </div>
      <ProductInfo product={product} optionId={optionId} onOptionId={setOptionId} />
    </div>
  );
}
