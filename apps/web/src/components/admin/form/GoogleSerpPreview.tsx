"use client";

import { useState } from "react";
import { mediaUrl } from "@/lib/media";

/**
 * Live preview styled to match a real Google organic result
 * (favicon + site + citation, blue title, gray snippet).
 */
export function GoogleSerpPreview({
  path,
  title,
  description,
  siteName = "Rose Glow",
  host = "www.roseglo.studio",
}: {
  path: string;
  title: string;
  description: string;
  siteName?: string;
  host?: string;
}) {
  const [logoFailed, setLogoFailed] = useState(false);

  const crumbs = (path || "/")
    .replace(/^\//, "")
    .replace(/\/$/, "")
    .split(/[/?&=]/)
    .map((c) => c.trim())
    .filter(Boolean);

  const displayTitle = title.trim() || "Page title";
  const displayDescription =
    description.trim() ||
    "Add a meta description to control how this page appears in Google search results.";

  const href = `https://${host}${path.startsWith("/") ? path : `/${path}`}`;

  return (
    <div className="rounded-sm border border-[#dadce0] bg-[#f8f9fa] p-4 sm:p-5">
      <div
        className="max-w-[600px] bg-white px-3 py-3 sm:px-4 sm:py-3.5"
        style={{ fontFamily: "Arial, sans-serif" }}
      >
        <div className="mb-1 flex items-center gap-3">
          <span
            className="flex h-[26px] w-[26px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#ecedef] bg-[#f1f3f4] text-[13px] font-bold text-[#7a4a2a]"
            aria-hidden
          >
            {!logoFailed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={mediaUrl("/brand/logo.png")}
                alt=""
                width={26}
                height={26}
                className="h-full w-full object-cover"
                onError={() => setLogoFailed(true)}
              />
            ) : (
              siteName.slice(0, 1).toUpperCase()
            )}
          </span>
          <div className="min-w-0 leading-[18px]">
            <div className="truncate text-[14px] font-normal text-[#202124]">
              {siteName}
            </div>
            <div className="truncate text-[12px] text-[#4d5156]">
              <span className="text-[#202124]">https://{host}</span>
              {crumbs.map((crumb, i) => (
                <span key={`${i}-${crumb}`}>
                  {" › "}
                  {crumb.length > 28 ? `${crumb.slice(0, 26)}…` : crumb}
                </span>
              ))}
            </div>
          </div>
        </div>

        <a
          href={href}
          className="mt-1 inline-block max-w-full cursor-default truncate text-[20px] leading-[26px] text-[#1a0dab] no-underline hover:underline"
          title={displayTitle}
          tabIndex={-1}
          onClick={(e) => e.preventDefault()}
        >
          {displayTitle}
        </a>

        <p className="m-0 mt-[3px] line-clamp-2 text-[14px] leading-[22px] text-[#4d5156]">
          {displayDescription}
        </p>
      </div>
    </div>
  );
}
