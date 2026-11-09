"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/format";

/** Soft enter/exit fade for swapped panels (tabs, modals). */
export function FadePanel({
  activeKey,
  children,
  className,
}: {
  activeKey: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [visible, setVisible] = useState(true);
  const [key, setKey] = useState(activeKey);
  const [content, setContent] = useState(children);

  useEffect(() => {
    if (activeKey === key) {
      setContent(children);
      return;
    }
    setVisible(false);
    const id = window.setTimeout(() => {
      setKey(activeKey);
      setContent(children);
      requestAnimationFrame(() => setVisible(true));
    }, 180);
    return () => window.clearTimeout(id);
  }, [activeKey, children, key]);

  return (
    <div
      className={cn(
        "transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        visible ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
        className,
      )}
    >
      {content}
    </div>
  );
}
