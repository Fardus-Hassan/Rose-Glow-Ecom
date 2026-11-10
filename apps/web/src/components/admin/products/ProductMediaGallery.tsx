"use client";

import { Reorder, useDragControls } from "motion/react";
import {
  Film,
  GripVertical,
  ImageIcon,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { MediaField } from "@/components/admin/media/MediaLibrary";
import { Button } from "@/components/admin/ui/Button";
import { cn } from "@/lib/format";

export type GalleryItem = {
  key: string;
  type: "IMAGE" | "VIDEO";
  src: string;
  poster: string;
  altEn: string;
  altBn: string;
};

function newItem(type: "IMAGE" | "VIDEO" = "IMAGE"): GalleryItem {
  return {
    key: `m-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    src: "",
    poster: "",
    altEn: "",
    altBn: "",
  };
}

export function ProductMediaGallery({
  value,
  onChange,
}: {
  value: GalleryItem[];
  onChange: (value: GalleryItem[]) => void;
}) {
  function update(key: string, patch: Partial<GalleryItem>) {
    onChange(value.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  }

  function remove(key: string) {
    onChange(value.filter((item) => item.key !== key));
  }

  function makeThumbnail(key: string) {
    const target = value.find((item) => item.key === key);
    if (!target) return;
    onChange([target, ...value.filter((item) => item.key !== key)]);
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted">
        First item is the catalogue thumbnail. Drag to reorder. Videos can have
        an optional poster image.
      </p>

      {value.length === 0 ? (
        <div className="border border-dashed border-ink/15 bg-paper/40 px-6 py-10 text-center">
          <ImageIcon className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-3 text-sm text-muted">No media yet.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button type="button" onClick={() => onChange([newItem("IMAGE")])}>
              <Plus className="h-3.5 w-3.5" /> Add image
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onChange([newItem("VIDEO")])}
            >
              <Film className="h-3.5 w-3.5" /> Add video
            </Button>
          </div>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={value}
          onReorder={onChange}
          className="space-y-3"
        >
          {value.map((item, index) => (
            <GalleryRow
              key={item.key}
              item={item}
              index={index}
              onUpdate={(patch) => update(item.key, patch)}
              onRemove={() => remove(item.key)}
              onMakeThumbnail={() => makeThumbnail(item.key)}
            />
          ))}
        </Reorder.Group>
      )}

      {value.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onChange([...value, newItem("IMAGE")])}
          >
            <Plus className="h-3.5 w-3.5" /> Add image
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onChange([...value, newItem("VIDEO")])}
          >
            <Film className="h-3.5 w-3.5" /> Add video
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function GalleryRow({
  item,
  index,
  onUpdate,
  onRemove,
  onMakeThumbnail,
}: {
  item: GalleryItem;
  index: number;
  onUpdate: (patch: Partial<GalleryItem>) => void;
  onRemove: () => void;
  onMakeThumbnail: () => void;
}) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="border border-ink/10 bg-paper/50"
    >
      <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-3 py-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="cursor-grab touch-none p-1 text-muted hover:text-ink active:cursor-grabbing"
            onPointerDown={(e) => controls.start(e)}
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <span className="text-[10px] uppercase tracking-[0.16em] text-muted">
            {item.type === "VIDEO" ? "Video" : "Image"} · {index + 1}
          </span>
          {index === 0 ? (
            <span className="inline-flex items-center gap-1 bg-night px-2 py-0.5 text-[10px] uppercase tracking-[0.14em] text-cream">
              <Star className="h-3 w-3" /> Thumbnail
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-1">
          {index > 0 ? (
            <button
              type="button"
              onClick={onMakeThumbnail}
              className="px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-muted hover:text-ink"
            >
              Use as thumbnail
            </button>
          ) : null}
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 text-muted hover:text-red-800"
            aria-label="Remove media"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          <div className="flex gap-2">
            {(["IMAGE", "VIDEO"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onUpdate({ type })}
                className={cn(
                  "px-3 py-1.5 text-[10px] uppercase tracking-[0.16em]",
                  item.type === type
                    ? "bg-night text-cream"
                    : "border border-ink/15 text-muted hover:text-ink",
                )}
              >
                {type === "IMAGE" ? "Image" : "Video"}
              </button>
            ))}
          </div>
          <div>
            <span className="admin-label">
              {item.type === "VIDEO" ? "Video file" : "Image file"}
            </span>
            <MediaField
              value={item.src}
              onChange={(src) => onUpdate({ src })}
              kind={item.type === "VIDEO" ? "video" : "image"}
            />
          </div>
          {item.type === "VIDEO" ? (
            <div>
              <span className="admin-label">Poster image (optional)</span>
              <MediaField
                value={item.poster}
                onChange={(poster) => onUpdate({ poster })}
                kind="image"
              />
            </div>
          ) : null}
        </div>
        <div className="space-y-3">
          <label className="block">
            <span className="admin-label">Alt text (EN)</span>
            <input
              className="admin-input"
              value={item.altEn}
              onChange={(e) => onUpdate({ altEn: e.target.value })}
              placeholder="Describe the piece"
            />
          </label>
          <label className="block">
            <span className="admin-label">Alt text (BN)</span>
            <input
              className="admin-input"
              value={item.altBn}
              onChange={(e) => onUpdate({ altBn: e.target.value })}
            />
          </label>
        </div>
      </div>
    </Reorder.Item>
  );
}

export function galleryFromProduct(
  media?: Array<{
    type?: string;
    src: string;
    poster?: string | null;
    altEn?: string;
    altBn?: string;
    sortOrder?: number;
  }>,
): GalleryItem[] {
  if (!media?.length) return [];
  return [...media]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map((m, i) => ({
      key: `existing-${i}-${m.src}`,
      type: String(m.type).toUpperCase() === "VIDEO" ? "VIDEO" : "IMAGE",
      src: m.src || "",
      poster: m.poster || "",
      altEn: m.altEn || "",
      altBn: m.altBn || "",
    }));
}

export function galleryToPayload(items: GalleryItem[]) {
  return items
    .filter((item) => item.src.trim())
    .map((item, i) => ({
      type: item.type,
      src: item.src.trim(),
      poster: item.type === "VIDEO" && item.poster.trim() ? item.poster.trim() : null,
      altEn: item.altEn,
      altBn: item.altBn,
      sortOrder: i,
    }));
}
