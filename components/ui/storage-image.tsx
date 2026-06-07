import Image, { type ImageProps } from "next/image";

import { isOptimizableRemoteImage, resolvePublicImageSrc } from "@/lib/storage/image-src";
import { cn } from "@/lib/utils";

type StorageImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  containerClassName?: string;
};

/** Imagem estática para páginas públicas — renderiza no servidor, sem hidratação. */
export function StorageImage({
  src,
  alt,
  className,
  containerClassName,
  ...props
}: StorageImageProps) {
  const resolvedSrc = resolvePublicImageSrc(src);

  return (
    <div className={cn("relative overflow-hidden bg-muted/30", containerClassName)}>
      <Image
        {...props}
        src={resolvedSrc}
        alt={alt}
        unoptimized={!isOptimizableRemoteImage(resolvedSrc)}
        className={cn("object-cover", className)}
      />
    </div>
  );
}
