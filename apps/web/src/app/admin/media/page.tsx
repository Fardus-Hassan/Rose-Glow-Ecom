"use client";

import { PageHeader } from "@/components/admin/ui/PageHeader";
import { MediaLibrary } from "@/components/admin/media/MediaLibrary";

export default function MediaPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Media library"
        description="Upload, search, and manage images and videos used across the storefront and catalogue."
      />
      <div className="admin-card overflow-hidden">
        <MediaLibrary />
      </div>
    </div>
  );
}
