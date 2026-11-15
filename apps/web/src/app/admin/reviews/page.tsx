"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/admin/api";
import type { Product, Review } from "@/lib/admin/types";
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
import { Field, PanelCard, Toggle } from "@/components/admin/form/PanelCard";
import { MediaField } from "@/components/admin/media/MediaLibrary";
import { AdminCardListSkeleton } from "@/components/skeletons/AdminSkeletons";

type ReviewFormState = {
  authorName: string;
  locationEn: string;
  locationBn: string;
  bodyEn: string;
  bodyBn: string;
  rating: number;
  productId: string;
  imageUrls: string[];
  isPublished: boolean;
  sortOrder: number;
};

const emptyForm = (): ReviewFormState => ({
  authorName: "",
  locationEn: "",
  locationBn: "",
  bodyEn: "",
  bodyBn: "",
  rating: 5,
  productId: "",
  imageUrls: [""],
  isPublished: true,
  sortOrder: 0,
});

function asImageList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v || "")).filter(Boolean);
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ReviewFormState>(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const pageSize = ADMIN_PAGE_SIZE.reviews;

  function load(nextPage = page) {
    setLoading(true);
    api<Paginated<Review>>(`/admin/reviews${pageQuery(nextPage, pageSize)}`)
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

  useEffect(() => {
    api<Paginated<Product>>(
      `/admin/products${pageQuery(1, 100)}`,
    )
      .then((res) => setProducts(res.items))
      .catch(() => setProducts([]));
  }, []);

  function startCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
  }

  function startEdit(review: Review) {
    const images = asImageList(review.imageUrls);
    setEditingId(review.id);
    setForm({
      authorName: review.authorName,
      locationEn: review.locationEn || "",
      locationBn: review.locationBn || "",
      bodyEn: review.bodyEn,
      bodyBn: review.bodyBn || "",
      rating: review.rating,
      productId: review.productId || review.product?.id || "",
      imageUrls: images.length ? images : [""],
      isPublished: review.isPublished,
      sortOrder: review.sortOrder ?? 0,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function save() {
    if (!form.authorName.trim() || !form.bodyEn.trim()) {
      toast.error("Author name and English review text are required");
      return;
    }
    setSaving(true);
    const payload = {
      authorName: form.authorName.trim(),
      locationEn: form.locationEn.trim(),
      locationBn: form.locationBn.trim(),
      bodyEn: form.bodyEn.trim(),
      bodyBn: form.bodyBn.trim(),
      rating: Math.min(5, Math.max(1, Number(form.rating) || 5)),
      productId: form.productId || null,
      imageUrls: form.imageUrls.map((u) => u.trim()).filter(Boolean),
      isPublished: form.isPublished,
      sortOrder: Number(form.sortOrder) || 0,
    };
    try {
      if (editingId) {
        await api(`/admin/reviews/${editingId}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
        toast.success("Review updated");
      } else {
        await api(`/admin/reviews`, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        toast.success("Review created");
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
      load(page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

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
        description="Product reviews show on that product/landing. Leave product empty for homepage (global) testimonials."
        actions={
          <Button type="button" onClick={startCreate}>
            <Plus className="h-3.5 w-3.5" />
            New review
          </Button>
        }
      />

      {showForm ? (
        <div className="mb-8">
          <PanelCard
            title={editingId ? "Edit review" : "New review"}
            description="Images: use Library to upload/pick. Global = no product selected → home page."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Author name">
                <input
                  className="admin-input"
                  value={form.authorName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, authorName: e.target.value }))
                  }
                  required
                />
              </Field>
              <Field label="Rating (1–5)">
                <input
                  type="number"
                  min={1}
                  max={5}
                  className="admin-input"
                  value={form.rating}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, rating: Number(e.target.value) }))
                  }
                />
              </Field>
              <Field label="Location (EN)">
                <input
                  className="admin-input"
                  value={form.locationEn}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, locationEn: e.target.value }))
                  }
                  placeholder="Dhaka"
                />
              </Field>
              <Field label="Location (BN)">
                <input
                  className="admin-input"
                  value={form.locationBn}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, locationBn: e.target.value }))
                  }
                  placeholder="ঢাকা"
                />
              </Field>
              <Field
                label="Product (optional)"
                className="md:col-span-2"
                hint="Blank = global homepage review. Pick a product for product page + landing."
              >
                <select
                  className="admin-input"
                  value={form.productId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, productId: e.target.value }))
                  }
                >
                  <option value="">— Global (home page) —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nameEn} ({p.sku})
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Review text (EN)" className="md:col-span-2">
                <textarea
                  className="admin-input min-h-[6rem]"
                  value={form.bodyEn}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bodyEn: e.target.value }))
                  }
                  required
                />
              </Field>
              <Field label="Review text (BN)" className="md:col-span-2">
                <textarea
                  className="admin-input min-h-[6rem]"
                  value={form.bodyBn}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, bodyBn: e.target.value }))
                  }
                />
              </Field>
              <Field label="Sort order">
                <input
                  type="number"
                  className="admin-input"
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      sortOrder: Number(e.target.value),
                    }))
                  }
                />
              </Field>
              <div className="flex items-end">
                <Toggle
                  label="Published"
                  checked={form.isPublished}
                  onChange={(v) =>
                    setForm((f) => ({ ...f, isPublished: v }))
                  }
                  hint="Only published reviews show on the storefront."
                />
              </div>
            </div>

            <div className="mt-2 space-y-3">
              <p className="admin-label">Photos</p>
              {form.imageUrls.map((url, index) => (
                <div key={`img-${index}`} className="flex gap-2">
                  <div className="min-w-0 flex-1">
                    <MediaField
                      value={url}
                      onChange={(next) =>
                        setForm((f) => {
                          const imageUrls = [...f.imageUrls];
                          imageUrls[index] = next;
                          return { ...f, imageUrls };
                        })
                      }
                    />
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    className="mt-0 shrink-0 self-start"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        imageUrls: f.imageUrls.filter((_, i) => i !== index),
                      }))
                    }
                    disabled={form.imageUrls.length <= 1}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    imageUrls: [...f.imageUrls, ""],
                  }))
                }
              >
                <Plus className="h-3.5 w-3.5" />
                Add photo
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button type="button" loading={saving} onClick={() => void save()}>
                {editingId ? "Save changes" : "Create review"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </PanelCard>
        </div>
      ) : null}

      {loading ? (
        <AdminCardListSkeleton count={4} />
      ) : reviews.length === 0 ? (
        <EmptyState
          title="No reviews"
          description="Create a global review for the homepage, or link one to a product."
          action={
            <Button type="button" onClick={startCreate}>
              <Plus className="h-3.5 w-3.5" />
              New review
            </Button>
          }
        />
      ) : (
        <>
          <div className="admin-card divide-y divide-ink/10">
            {reviews.map((r) => {
              const photos = asImageList(r.imageUrls);
              return (
                <article
                  key={r.id}
                  className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-start md:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <ReviewHeading
                      name={r.authorName}
                      published={r.isPublished}
                      scope={
                        r.product?.nameEn
                          ? `Product · ${r.product.nameEn}`
                          : "Global · Home page"
                      }
                    />
                    <p className="mt-1 text-xs text-muted">
                      {r.rating}★ · {formatDate(r.createdAt)}
                      {photos.length ? ` · ${photos.length} photo(s)` : ""}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-ink">
                      {r.bodyEn}
                    </p>
                    {r.bodyBn ? (
                      <p className="mt-2 text-sm text-muted">{r.bodyBn}</p>
                    ) : null}
                    {photos.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {photos.slice(0, 4).map((src) => (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            key={src}
                            src={src}
                            alt=""
                            className="h-12 w-10 border border-ink/10 object-cover"
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex shrink-0 flex-row flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => startEdit(r)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant={r.isPublished ? "secondary" : "primary"}
                      onClick={() => void togglePublish(r)}
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
              );
            })}
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
  scope,
}: {
  name: string;
  published: boolean;
  scope: string;
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
      <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
        {scope}
      </span>
    </div>
  );
}
