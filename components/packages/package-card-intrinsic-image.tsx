"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

import { StorageImage } from "@/components/ui/storage-image";
import { computeIntrinsicImageAreaHeight } from "@/lib/package/intrinsic-image-height";
import { cn } from "@/lib/utils";

const FALLBACK_ASPECT_WIDTH = 4;
const FALLBACK_ASPECT_HEIGHT = 3;

type PackageCardIntrinsicImageProps = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  children?: ReactNode;
};

export function PackageCardIntrinsicImage({
  src,
  alt,
  sizes,
  priority = false,
  children,
}: PackageCardIntrinsicImageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width ?? 0;

      if (width > 0) {
        setContainerWidth(width);
      }
    });

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const hasMeasuredWidth = containerWidth > 0;
  const areaHeight = hasMeasuredWidth
    ? naturalSize
      ? computeIntrinsicImageAreaHeight(
          containerWidth,
          naturalSize.width,
          naturalSize.height,
        )
      : computeIntrinsicImageAreaHeight(
          containerWidth,
          FALLBACK_ASPECT_WIDTH,
          FALLBACK_ASPECT_HEIGHT,
        )
    : undefined;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full overflow-hidden bg-muted/30",
        !hasMeasuredWidth && "aspect-[4/3] min-h-[8.75rem]",
      )}
      style={
        hasMeasuredWidth && areaHeight !== undefined
          ? { height: `${areaHeight}px` }
          : undefined
      }
    >
      <StorageImage
        src={src}
        alt=""
        fill
        sizes={sizes}
        aria-hidden
        className="object-contain object-center scale-[1.03] blur-md brightness-[0.96] saturate-[1.05] opacity-75"
        containerClassName="absolute inset-0"
      />
      <StorageImage
        src={src}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        onLoadingComplete={({ naturalWidth, naturalHeight }) => {
          setNaturalSize({ width: naturalWidth, height: naturalHeight });
        }}
        className="z-[1] object-contain object-center transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        containerClassName="absolute inset-0 z-[1]"
      />
      {children}
    </div>
  );
}
