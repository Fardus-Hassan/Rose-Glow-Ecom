"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Product } from "@/data/products";
import { fetchProductBySlug } from "@/lib/catalog";
import { useBag } from "@/store/bag";
import { useCatalog } from "@/store/catalog";

type CartLine = { slug: string; qty: number; optionId?: string };

export type ResolvedCartLine = {
  line: CartLine;
  product: Product;
};

/**
 * Resolves bag lines against the catalog, fetching any missing slugs.
 * Stale/deleted products are pruned so the header badge stays in sync.
 */
export function useCartLines() {
  const { cart, removeFromCart } = useBag();
  const { ready, getBySlug } = useCatalog();
  const [fetched, setFetched] = useState<Record<string, Product>>({});
  const [resolving, setResolving] = useState(false);
  const attempted = useRef<Set<string>>(new Set());

  const resolve = (slug: string) => getBySlug(slug) || fetched[slug];

  const unresolvedSlugs = useMemo(() => {
    return Array.from(
      new Set(cart.map((line) => line.slug).filter((slug) => !resolve(slug))),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, getBySlug, fetched]);

  useEffect(() => {
    if (!ready) return;

    const missing = unresolvedSlugs.filter(
      (slug) => !attempted.current.has(slug),
    );
    if (missing.length === 0) return;

    let cancelled = false;
    missing.forEach((slug) => attempted.current.add(slug));
    setResolving(true);

    void (async () => {
      const next: Record<string, Product> = {};
      const gone: string[] = [];

      await Promise.all(
        missing.map(async (slug) => {
          const product = await fetchProductBySlug(slug);
          if (product) next[slug] = product;
          else gone.push(slug);
        }),
      );

      if (cancelled) return;

      if (Object.keys(next).length) {
        setFetched((prev) => ({ ...prev, ...next }));
      }

      for (const slug of gone) {
        for (const line of cart.filter((item) => item.slug === slug)) {
          removeFromCart(line.slug, line.optionId);
        }
      }

      setResolving(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [ready, unresolvedSlugs, cart, removeFromCart]);

  const lines = useMemo(() => {
    return cart
      .map((line) => {
        const product = resolve(line.slug);
        if (!product) return null;
        return { line, product };
      })
      .filter(Boolean) as ResolvedCartLine[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart, getBySlug, fetched]);

  const pending =
    !ready || resolving || (cart.length > 0 && unresolvedSlugs.length > 0);

  return { lines, pending, cart };
}
