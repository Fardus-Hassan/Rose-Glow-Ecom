"use client";

import {
  IconFacebook,
  IconInstagram,
  IconTikTok,
  IconWhatsApp,
} from "@/components/icons";
import type { SocialLink } from "@/data/social";
import { cn } from "@/lib/format";
import { useCatalog } from "@/store/catalog";

const icons = {
  instagram: IconInstagram,
  facebook: IconFacebook,
  whatsapp: IconWhatsApp,
  tiktok: IconTikTok,
} as const;

export function SocialLinks({
  tone = "light",
  className,
  links,
  showLabels = false,
}: {
  tone?: "light" | "dark";
  className?: string;
  links?: SocialLink[];
  showLabels?: boolean;
}) {
  const { ready, social } = useCatalog();
  const resolved = links ?? social;

  if (!links && !ready) {
    return (
      <ul
        className={cn("flex flex-wrap items-center gap-2", className)}
        aria-hidden
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <li
            key={i}
            className={cn(
              "animate-pulse",
              showLabels ? "h-4 w-16" : "h-10 w-10 border border-transparent",
              tone === "light" ? "bg-white/15" : "bg-[#1c1a19]/10",
            )}
          />
        ))}
      </ul>
    );
  }

  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {resolved.map((link) => {
        const Icon = icons[link.id];
        return (
          <li key={link.id}>
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className={cn(
                "inline-flex items-center gap-2 transition",
                showLabels
                  ? "text-[11px] uppercase tracking-[0.16em]"
                  : "h-10 w-10 items-center justify-center border",
                tone === "light"
                  ? showLabels
                    ? "text-[#f4efe8]/55 hover:text-[#f4efe8]"
                    : "border-white/15 text-[#f4efe8]/70 hover:border-[#c9a08a]/50 hover:text-[#f4efe8]"
                  : showLabels
                    ? "text-[#1c1a19]/45 hover:text-[#1c1a19]"
                    : "border-[#1c1a19]/12 text-[#1c1a19]/55 hover:border-[#c9a08a]/55 hover:text-[#1c1a19]",
              )}
            >
              <Icon className="h-[18px] w-[18px]" />
              {showLabels ? <span>{link.label}</span> : null}
            </a>
          </li>
        );
      })}
    </ul>
  );
}
