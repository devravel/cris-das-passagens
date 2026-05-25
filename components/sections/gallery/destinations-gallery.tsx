"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import type { GalleryPhoto } from "@/lib/google-places/gallery-photos";
import { cn } from "@/lib/utils";

type DestinationsGalleryProps = {
  photos: GalleryPhoto[];
  emptyMessage: string;
};

function getWrappedIndex(index: number, length: number) {
  if (length === 0) {
    return 0;
  }

  return (index + length) % length;
}

export function DestinationsGallery({
  photos,
  emptyMessage,
}: DestinationsGalleryProps) {
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  const isOpen = activeIndex !== null;
  const currentPhoto =
    activeIndex !== null ? photos[getWrappedIndex(activeIndex, photos.length)] : null;

  const openPhoto = React.useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  const closeLightbox = React.useCallback(() => {
    setActiveIndex(null);
  }, []);

  const showPrevious = React.useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : getWrappedIndex(current - 1, photos.length),
    );
  }, [photos.length]);

  const showNext = React.useCallback(() => {
    setActiveIndex((current) =>
      current === null ? null : getWrappedIndex(current + 1, photos.length),
    );
  }, [photos.length]);

  React.useEffect(() => {
    if (!isOpen) {
      return;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowLeft") {
        showPrevious();
      }

      if (event.key === "ArrowRight") {
        showNext();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeLightbox, isOpen, showNext, showPrevious]);

  if (photos.length === 0) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-border/60 bg-muted/20 px-6 py-14 text-center shadow-sm">
        <p className="text-base text-muted-foreground sm:text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      <ul
        className="grid list-none grid-cols-2 gap-3 p-0 sm:gap-4 md:grid-cols-3 lg:grid-cols-4"
        role="list"
      >
        {photos.map((photo, index) => (
          <li key={photo.id}>
            <button
              type="button"
              onClick={() => openPhoto(index)}
              className={cn(
                "group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-muted ring-1 ring-border/60",
                "transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_40px_-16px_rgba(52,91,167,0.22)]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              )}
              aria-label={`Expandir foto ${index + 1} de ${photos.length}: ${photo.alt}`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <span className="pointer-events-none absolute inset-0 bg-brand-navy/0 transition-colors duration-300 group-hover:bg-brand-navy/10" />
            </button>
          </li>
        ))}
      </ul>

      {isOpen && currentPhoto ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label="Visualização ampliada da galeria"
        >
          <button
            type="button"
            className="absolute inset-0 bg-brand-navy/80 backdrop-blur-sm"
            aria-label="Fechar visualização ampliada"
            onClick={closeLightbox}
          />

          <div
            className="relative z-10 flex w-full max-w-5xl flex-col items-center gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeLightbox}
              className="absolute -top-2 right-0 flex size-10 items-center justify-center rounded-full bg-background/95 text-foreground shadow-md transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy sm:-top-3 sm:right-0"
              aria-label="Fechar galeria ampliada"
            >
              <X className="size-5" aria-hidden />
            </button>

            <div className="relative aspect-[4/5] w-full max-w-3xl overflow-hidden rounded-2xl bg-background shadow-2xl ring-1 ring-white/15 sm:aspect-[16/11]">
              <Image
                src={currentPhoto.src}
                alt={currentPhoto.alt}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 900px"
                className="object-contain bg-black/20"
              />
            </div>

            <div className="flex w-full max-w-3xl items-center justify-between gap-3">
              <button
                type="button"
                onClick={showPrevious}
                className="inline-flex items-center gap-2 rounded-xl bg-background/95 px-3 py-2 text-sm font-medium text-foreground shadow-md transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="size-4" aria-hidden />
                Anterior
              </button>

              <p className="text-center text-sm text-white/80">
                {getWrappedIndex(activeIndex ?? 0, photos.length) + 1} / {photos.length}
              </p>

              <button
                type="button"
                onClick={showNext}
                className="inline-flex items-center gap-2 rounded-xl bg-background/95 px-3 py-2 text-sm font-medium text-foreground shadow-md transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
                aria-label="Próxima foto"
              >
                Próxima
                <ChevronRight className="size-4" aria-hidden />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
