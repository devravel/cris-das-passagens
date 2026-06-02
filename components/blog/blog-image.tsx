"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

import { BLOG_IMAGE_FALLBACK, normalizeBlogImageUrl } from "@/lib/blog/image-url";
import { resolveStorageImageSrc } from "@/lib/storage/media-url";
import { cn } from "@/lib/utils";

function isUnoptimizedImage(src: string) {
  if (src.startsWith("/api/media/")) {
    return true;
  }

  try {
    const hostname = new URL(src).hostname;
    return !(
      hostname === "images.unsplash.com" ||
      hostname.endsWith(".supabase.co") ||
      hostname.endsWith(".googleusercontent.com")
    );
  } catch {
    return true;
  }
}

type BlogImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  fallbackSrc?: string;
  containerClassName?: string;
};

export function BlogImage({
  src,
  alt,
  fallbackSrc = BLOG_IMAGE_FALLBACK,
  className,
  containerClassName,
  onError,
  ...props
}: BlogImageProps) {
  const isLocalPreviewSource = src.startsWith("blob:") || src.startsWith("data:");
  const resolvedSrc = isLocalPreviewSource
    ? src
    : resolveStorageImageSrc(normalizeBlogImageUrl(src));
  const [erroredSrc, setErroredSrc] = useState<string | null>(null);
  const hasErrored = erroredSrc === resolvedSrc;
  const currentSrc = hasErrored ? fallbackSrc : resolvedSrc;

  return (
    <div className={cn("relative overflow-hidden bg-muted/30", containerClassName)}>
      <Image
        {...props}
        key={resolvedSrc}
        src={currentSrc}
        alt={alt}
        unoptimized={isUnoptimizedImage(currentSrc)}
        className={cn("object-cover", className)}
        onError={(event) => {
          if (!hasErrored) {
            setErroredSrc(resolvedSrc);
          }
          onError?.(event);
        }}
      />
    </div>
  );
}
