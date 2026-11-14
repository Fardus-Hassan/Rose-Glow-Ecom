"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/admin/api";
import type { Review } from "@/lib/admin/types";
import { formatDate } from "@/lib/admin/format";
import {
  ADMIN_PAGE_SIZE,
  pageQuery,
  type Paginated,
} from "@/lib/admin/pagination";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Button";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminPagination } from "@/components/admin/ui/AdminPagination";
import { AdminCardListSkeleton } from "@/components/skeletons/AdminSkeletons";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = ADMIN_PAGE_SIZE.reviews;

  function load(nextPage = page) {
    setLoading(true);
    api<Paginated<Review>>(
      `/admin/reviews${pageQuery(nextPage, pageSize)}`,
    )
      .then((res) => {
        setReviews(res.items);
        setTotalPages(res.totalPages);
        setTotal(res.total);
        setPage(res.page);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function togglePublish(review: Review) {
    await api(`/admin/reviews/${review.id}`, {
      method: "PATCH",
      body: JSON.stringify({ isPublished: !review.isPublished }),
    });
    load(page);
  }

  return (
    <div>
      <PageHeader
        eyebrow="Social proof"
        title="Reviews"
        description="Curate testimonials shown on the storefront."
      />
      {loading ? (
        <AdminCardListSkeleton count={4} />
      ) : reviews.length === 0 ? (
        <EmptyState
          title="No reviews"
          description="Customer stories will appear here."
        />
      ) : (
        <>
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
                  <p className="mt-3 text-sm leading-relaxed text-ink">
                    {r.bodyEn}
                  </p>
                  {r.bodyBn ? (
                    <p className="mt-2 text-sm text-muted">{r.bodyBn}</p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <Button
                    variant={r.isPublished ? "secondary" : "primary"}
                    onClick={() => togglePublish(r)}
                  >
                    {r.isPublished ? "Unpublish" : "Publish"}
                  </Button>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      if (
                        !confirm(
                          "Move this review to the recycle bin? Restorable for 30 days.",
                        )
                      ) {
                        return;
                      }
                      await api(`/admin/reviews/${r.id}`, {
                        method: "DELETE",
                      });
                      load(page);
                    }}
                  >
                    Move to bin
                  </Button>
                </div>
              </article>
            ))}
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
