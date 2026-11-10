"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import {
  MEDIA_SIZES,
  mediaUrl,
  mediaVariant,
  type MediaVariantName,
  type MediaVariants,
} from "@/lib/media";
import { cn } from "@/lib/format";

type Preset = keyof typeof MEDIA_SIZES;

type SmartImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  /** Prefer a pre-generated R2 variant when available */
  variant?: MediaVariantName;
  variants?: MediaVariants | null;
  blurDataURL?: string | null;
  sizesPreset?: Preset;
};

/**
 * E-com image: R2 variants + LQIP blur + sensible sizes defaults.
 */
export function SmartImage({
  src,
  alt,
  variant = "full",
  variants,
  blurDataURL,
  sizesPreset,
  sizes,
  className,
  priority,
  loading,
  ...rest
}: SmartImageProps) {
  const [failedVariant, setFailedVariant] = useState(false);
  const resolved =
    failedVariant || variant === "full"
      ? mediaUrl(src)
      : mediaVariant(src, variant, variants);
  const blur = blurDataURL?.startsWith("data:") ? blurDataURL : undefined;

  return (
    <Image
      src={resolved}
      alt={alt}
      sizes={sizes || (sizesPreset ? MEDIA_SIZES[sizesPreset] : undefined)}
      className={cn("bg-[#e2dacf]", className)}
      placeholder={blur ? "blur" : "empty"}
      blurDataURL={blur}
      priority={priority}
      loading={priority ? undefined : loading ?? "lazy"}
      onError={() => {
        if (!failedVariant && variant !== "full") setFailedVariant(true);
      }}
      {...rest}
    />
  );
}
