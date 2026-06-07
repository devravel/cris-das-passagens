"use client";

import { useState } from "react";
import Image, { type ImageProps } from "next/image";

import { BLOG_IMAGE_FALLBACK } from "@/lib/blog/image-url";
import { isOptimizableRemoteImage, resolvePublicImageSrc } from "@/lib/storage/image-src";
import { cn } from "@/lib/utils";

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
  const resolvedSrc = isLocalPreviewSource ? src : resolvePublicImageSrc(src);
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
        unoptimized={!isOptimizableRemoteImage(currentSrc)}
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
