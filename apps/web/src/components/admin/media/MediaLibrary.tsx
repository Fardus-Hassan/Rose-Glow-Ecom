"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  FileText,
  Film,
  ImageIcon,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/admin/api";
import { formatDate } from "@/lib/admin/format";
import {
  ADMIN_PAGE_SIZE,
  pageQuery,
  type Paginated,
} from "@/lib/admin/pagination";
import { Dialog } from "@/components/admin/ui/Dialog";
import { Button } from "@/components/admin/ui/Button";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { AdminPagination } from "@/components/admin/ui/AdminPagination";
import { AdminMediaSkeleton } from "@/components/skeletons/AdminSkeletons";
import { cn } from "@/lib/format";

export type MediaKind = "image" | "video" | "document";

export type MediaAsset = {
  id: string;
  kind: MediaKind | string;
  url: string;
  filename: string;
  mime: string;
  size: number;
  width?: number | null;
  height?: number | null;
  alt: string;
  createdAt: string;
};

type FilterKind = "all" | MediaKind;

const acceptMap: Record<FilterKind, string> = {
  all: "image/*,video/mp4,video/webm,video/quicktime,application/pdf",
  image: "image/*",
  video: "video/mp4,video/webm,video/quicktime",
  document: "application/pdf",
};

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function MediaThumb({
  media,
  className,
}: {
  media: MediaAsset;
  className?: string;
}) {
  if (media.kind === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={media.url}
        alt={media.alt || media.filename}
        loading="lazy"
        className={cn("h-full w-full object-cover", className)}
      />
    );
  }
  if (media.kind === "video") {
    return (
      <div className={cn("relative h-full w-full bg-night", className)}>
        <video
          src={`${media.url}#t=0.5`}
          preload="metadata"
          muted
          className="h-full w-full object-cover opacity-80"
        />
        <Film className="absolute top-2 left-2 h-4 w-4 text-cream drop-shadow" />
      </div>
    );
  }
  return (
    <div
      className={cn(
        "flex h-full w-full items-center justify-center bg-paper-deep text-muted",
        className,
      )}
    >
      <FileText className="h-8 w-8" />
    </div>
  );
}

export function MediaLibrary({
  kind: fixedKind,
  onSelect,
  selectLabel = "Use this file",
}: {
  kind?: MediaKind;
  onSelect?: (media: MediaAsset) => void;
  selectLabel?: string;
}) {
  const [items, setItems] = useState<MediaAsset[] | null>(null);
  const [kind, setKind] = useState<FilterKind>(fixedKind ?? "all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const pageSize = ADMIN_PAGE_SIZE.media;
  const activeKind = fixedKind ?? kind;

  useEffect(() => {
    setPage(1);
  }, [query, activeKind]);

  const load = useCallback(async () => {
    try {
      const res = await api<Paginated<MediaAsset>>(
        `/admin/media${pageQuery(page, pageSize, {
          kind: activeKind === "all" ? undefined : activeKind,
          q: query.trim() || undefined,
        })}`,
      );
      setItems(res.items);
      setTotalPages(res.totalPages);
      setTotal(res.total);
      if (res.page !== page) setPage(res.page);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't load media");
      setItems([]);
      setTotal(0);
      setTotalPages(1);
    }
  }, [activeKind, page, pageSize, query]);

  useEffect(() => {
    const t = setTimeout(() => void load(), query ? 250 : 0);
    return () => clearTimeout(t);
  }, [load, query]);

  const selected = items?.find((m) => m.id === selectedId) ?? null;

  async function upload(files: File[]) {
    if (!files.length) return;
    setUploading(true);
    try {
      const created: MediaAsset[] = [];
      for (const file of files) {
        const body = new FormData();
        body.append("file", file);
        const row = await api<MediaAsset>("/admin/media", {
          method: "POST",
          body,
        });
        created.push(row);
      }
      setSelectedId(created[0]?.id ?? null);
      if (page !== 1) setPage(1);
      else await load();
      toast.success(
        created.length > 1 ? `${created.length} files uploaded` : "Uploaded",
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function saveAlt(media: MediaAsset, alt: string) {
    if (alt === media.alt) return;
    setItems(
      (list) =>
        list?.map((m) => (m.id === media.id ? { ...m, alt } : m)) ?? null,
    );
    try {
      await api(`/admin/media/${media.id}`, {
        method: "PATCH",
        body: JSON.stringify({ alt }),
      });
      toast.success("Description saved");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed");
    }
  }

  async function remove(media: MediaAsset) {
    const ok = window.confirm(`Delete “${media.filename}”? This can't be undone.`);
    if (!ok) return;
    try {
      await api(`/admin/media/${media.id}`, { method: "DELETE" });
      setSelectedId(null);
      await load();
      toast.success("Deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function copyUrl(media: MediaAsset) {
    const absolute = new URL(media.url, window.location.origin).href;
    await navigator.clipboard.writeText(absolute);
    setCopied(true);
    toast.success("URL copied");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className="relative flex min-h-[28rem] flex-col"
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setDragging(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        void upload(Array.from(e.dataTransfer.files));
      }}
    >
      <div className="space-y-3 border-b border-ink/10 p-3 sm:p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 z-[1] h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files…"
            className="w-full border border-ink/15 bg-paper/80 py-2.5 pr-3 pl-10 text-sm text-ink outline-none transition placeholder:text-muted focus:border-rose/70 focus:ring-1 focus:ring-rose/30"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!fixedKind ? (
            <div className="flex min-w-0 flex-1 overflow-x-auto border border-ink/15">
              {(
                [
                  ["all", "All"],
                  ["image", "Images"],
                  ["video", "Videos"],
                  ["document", "Docs"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setKind(value)}
                  className={cn(
                    "shrink-0 px-3 py-2 text-[10px] uppercase tracking-[0.16em]",
                    kind === value
                      ? "bg-night text-cream"
                      : "text-muted hover:text-ink",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex-1" />
          )}
          <Button
            type="button"
            loading={uploading}
            onClick={() => fileInput.current?.click()}
            className="shrink-0"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            Upload
          </Button>
        </div>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept={acceptMap[fixedKind ?? kind]}
          className="hidden"
          onChange={(e) => {
            void upload(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto p-3 sm:p-4">
          {items === null ? (
            <AdminMediaSkeleton />
          ) : items.length === 0 ? (
            <EmptyState
              title={total ? "No files match" : "No files yet"}
              description="Drag & drop files here, or click Upload."
            />
          ) : (
            <>
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {items.map((media) => (
                  <li key={media.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(media.id)}
                      onDoubleClick={() => onSelect?.(media)}
                      className={cn(
                        "group relative block aspect-square w-full overflow-hidden border-2 bg-paper-deep text-left transition",
                        selectedId === media.id
                          ? "border-rose ring-2 ring-rose/25"
                          : "border-transparent hover:border-ink/20",
                      )}
                    >
                      <MediaThumb media={media} />
                      <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pt-6 pb-1.5 text-[0.7rem] text-white">
                        {media.filename}
                      </span>
                      {selectedId === media.id ? (
                        <span className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose text-cream shadow">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
              <AdminPagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onChange={setPage}
                className="mt-4"
              />
            </>
          )}
        </div>

        {selected ? (
          <aside className="max-h-[22rem] shrink-0 overflow-y-auto border-t border-ink/10 bg-cream p-4 lg:max-h-none lg:w-72 lg:border-t-0 lg:border-l">
            <div className="mb-3 flex items-center justify-between lg:hidden">
              <p className="text-sm font-medium text-ink">File details</p>
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="border border-ink/10 p-1.5 text-muted hover:text-ink"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="aspect-video overflow-hidden border border-ink/10 bg-paper-deep">
              {selected.kind === "video" ? (
                <video
                  src={selected.url}
                  controls
                  preload="metadata"
                  className="h-full w-full bg-night object-contain"
                />
              ) : selected.kind === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={selected.url}
                  alt={selected.alt || selected.filename}
                  className="h-full w-full object-contain"
                />
              ) : (
                <MediaThumb media={selected} />
              )}
            </div>
            <p className="mt-3 break-all text-sm font-medium text-ink">
              {selected.filename}
            </p>
            <p className="mt-0.5 text-xs text-muted">
              {formatBytes(selected.size)}
              {selected.width && selected.height
                ? ` · ${selected.width}×${selected.height}`
                : ""}{" "}
              · {formatDate(selected.createdAt)}
            </p>

            {selected.kind === "image" ? (
              <label className="mt-4 block">
                <span className="admin-label">Description (alt text)</span>
                <textarea
                  key={selected.id}
                  defaultValue={selected.alt}
                  rows={2}
                  placeholder="What's in this image?"
                  onBlur={(e) => saveAlt(selected, e.target.value.trim())}
                  className="admin-input mt-1 min-h-0 resize-none py-2"
                />
              </label>
            ) : null}

            <div className="mt-4 flex flex-col gap-2">
              {onSelect ? (
                <Button type="button" onClick={() => onSelect(selected)}>
                  <Check className="h-3.5 w-3.5" />
                  {selectLabel}
                </Button>
              ) : null}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => copyUrl(selected)}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy link"}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => remove(selected)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </aside>
        ) : null}
      </div>

      {dragging ? (
        <div className="pointer-events-none absolute inset-2 z-20 flex flex-col items-center justify-center border-2 border-dashed border-rose bg-rose/10 backdrop-blur-sm">
          <UploadCloud className="h-10 w-10 text-rose" />
          <p className="mt-2 text-sm font-medium text-ink">Drop files to upload</p>
        </div>
      ) : null}
    </div>
  );
}

export function MediaPickerDialog({
  open,
  onClose,
  kind,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  kind?: MediaKind;
  onSelect: (media: MediaAsset) => void;
}) {
  const label =
    kind === "video" ? "video" : kind === "image" ? "image" : "file";
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title={`Choose ${label === "image" ? "an" : "a"} ${label}`}
      description="Pick from your library or upload a new one. Double-click to select quickly."
    >
      <MediaLibrary
        kind={kind}
        selectLabel={`Use this ${label}`}
        onSelect={(media) => {
          onSelect(media);
          onClose();
        }}
      />
    </Dialog>
  );
}

export function MediaField({
  value,
  onChange,
  kind = "image",
}: {
  value: string;
  onChange: (value: string) => void;
  kind?: MediaKind;
}) {
  const [open, setOpen] = useState(false);
  const isVideo = kind === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(value);

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          className="admin-input min-w-0 flex-1"
          value={value}
          placeholder={
            kind === "video"
              ? "https://…r2.dev/…mp4"
              : "https://…r2.dev/…webp"
          }
          onChange={(e) => onChange(e.target.value)}
        />
        <Button
          type="button"
          variant="secondary"
          className="shrink-0"
          onClick={() => setOpen(true)}
        >
          <ImageIcon className="h-3.5 w-3.5" />
          Library
        </Button>
      </div>
      {value ? (
        <div className="flex items-center gap-3">
          <div className="h-16 w-16 overflow-hidden border border-ink/10 bg-paper-deep">
            {isVideo ? (
              <video
                src={`${value}#t=0.1`}
                muted
                preload="metadata"
                className="h-full w-full object-cover"
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <button
            type="button"
            className="text-[11px] uppercase tracking-[0.16em] text-muted hover:text-ink"
            onClick={() => onChange("")}
          >
            Clear
          </button>
        </div>
      ) : null}
      <MediaPickerDialog
        open={open}
        onClose={() => setOpen(false)}
        kind={kind}
        onSelect={(media) => onChange(media.url)}
      />
    </div>
  );
}
