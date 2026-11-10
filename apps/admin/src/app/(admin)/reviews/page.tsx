"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Review } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    api<Review[]>("/admin/reviews")
      .then(setReviews)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function togglePublish(review: Review) {
    await api(`/admin/reviews/${review.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isPublished: !review.isPublished }),
    });
    load();
  }

  return (
    <div>
      <PageHeader
        eyebrow="Social proof"
        title="Reviews"
        description="Curate testimonials shown on the storefront."
      />
      {loading ? (
        <p className="text-muted">Loading…</p>
      ) : reviews.length === 0 ? (
        <EmptyState title="No reviews" description="Customer stories will appear here." />
      ) : (
        <div className="admin-card divide-y divide-ink/10">
          {reviews.map((r) => (
            <article
              key={r.id}
              className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-start md:justify-between"
            >
              <div className="min-w-0 flex-1">
                <ReviewHeading name={r.authorName} published={r.isPublished} />
                <p className="mt-1 text-xs text-muted">
                  {r.rating}★ · {formatDate(r.createdAt)}
                  {r.product?.nameEn ? ` · ${r.product.nameEn}` : ""}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink">{r.bodyEn}</p>
                {r.bodyBn ? (
                  <p className="mt-2 text-sm text-muted">{r.bodyBn}</p>
                ) : null}
              </div>
              <Button
                variant={r.isPublished ? "secondary" : "primary"}
                onClick={() => togglePublish(r)}
              >
                {r.isPublished ? "Unpublish" : "Publish"}
              </Button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewHeading({
  name,
  published,
}: {
  name: string;
  published: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <h2 className="font-display text-xl text-night">{name}</h2>
      <span
        className={
          published
            ? "text-[10px] uppercase tracking-[0.16em] text-emerald-900"
            : "text-[10px] uppercase tracking-[0.16em] text-muted"
        }
      >
        {published ? "Live" : "Hidden"}
      </span>
    </div>
  );
}
