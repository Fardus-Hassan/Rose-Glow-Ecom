"use client";

import { cn } from "@/lib/format";

/** Height + fade accordion panel — keeps children mounted for smooth close. */
export function SmoothCollapse({
  open,
  children,
  className,
  durationClass = "duration-500",
}: {
  open: boolean;
  children: React.ReactNode;
  className?: string;
  durationClass?: string;
}) {
  return (
    <div
      className={cn(
        "grid transition-[grid-template-rows,opacity] ease-[cubic-bezier(0.22,1,0.36,1)]",
        durationClass,
        open
          ? "grid-rows-[1fr] opacity-100"
          : "pointer-events-none grid-rows-[0fr] opacity-0",
      )}
      aria-hidden={!open}
    >
      <div className="min-h-0 overflow-hidden">
        <div
          className={cn(
            "origin-top transition-[transform,opacity] ease-[cubic-bezier(0.22,1,0.36,1)]",
            durationClass,
            open
              ? "translate-y-0 opacity-100"
              : "-translate-y-1 opacity-0",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
