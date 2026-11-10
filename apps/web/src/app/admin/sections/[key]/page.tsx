"use client";

import { useParams } from "next/navigation";
import { SectionEditor } from "@/components/admin/cms/SectionEditor";
import type { SectionKey } from "@/lib/cms/types";

export default function AdminSectionPage() {
  const params = useParams<{ key: string }>();
  return <SectionEditor sectionKey={params.key as SectionKey} />;
}
