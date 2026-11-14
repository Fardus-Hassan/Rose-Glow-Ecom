"use client";

import { useEffect, useRef } from "react";
import { trackViewContent } from "@/lib/meta-pixel";

export function MetaViewContent({
  contentId,
  contentName,
  value,
}: {
  contentId: string;
  contentName: string;
  value: number;
}) {
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackViewContent({ contentId, contentName, value });
  }, [contentId, contentName, value]);

  return null;
}
