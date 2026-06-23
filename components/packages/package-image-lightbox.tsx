"use client";

import Image from "next/image";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { isOptimizableRemoteImage, resolvePublicImageSrc } from "@/lib/storage/image-src";
import { cn } from "@/lib/utils";

type PackageImageLightboxProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  imageAlt: string;
};

export function PackageImageLightbox({
  open,
  onOpenChange,
  imageSrc,
  imageAlt,
}: PackageImageLightboxProps) {
  const resolvedSrc = resolvePublicImageSrc(imageSrc);
  const unoptimized = !isOptimizableRemoteImage(resolvedSrc);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/55 backdrop-blur-md duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex items-center justify-center p-4 outline-none sm:p-6",
            "duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
          )}
          onClick={() => onOpenChange(false)}
        >
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-3 right-3 z-10 bg-background/90 text-foreground shadow-md hover:bg-background sm:top-4 sm:right-4"
              aria-label="Fechar imagem ampliada"
              onClick={(event) => event.stopPropagation()}
            >
              <XIcon />
            </Button>
          </DialogPrimitive.Close>

          <DialogTitle className="sr-only">{imageAlt}</DialogTitle>

          <div
            className="relative max-h-[min(88dvh,900px)] max-w-[min(96vw,1200px)]"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={resolvedSrc}
              alt={imageAlt}
              width={1200}
              height={900}
              sizes="(max-width: 768px) 96vw, 1200px"
              unoptimized={unoptimized}
              className="max-h-[min(88dvh,900px)] w-auto max-w-full rounded-xl object-contain shadow-2xl ring-1 ring-white/10"
            />
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
