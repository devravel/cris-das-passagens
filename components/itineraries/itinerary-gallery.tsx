"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { isOptimizableRemoteImage, resolvePublicImageSrc } from "@/lib/storage/image-src";
import { cn } from "@/lib/utils";

type ItineraryGalleryProps = {
  title: string;
  cover: string;
  gallery: string[];
};

/**
 * Referência: fileira de miniaturas + imagem grande com o título por cima.
 * A capa é sempre a primeira; clique na grande abre o lightbox.
 */
export function ItineraryGallery({ title, cover, gallery }: ItineraryGalleryProps) {
  const images = [cover, ...gallery].map((url) => url.trim()).filter(Boolean);
  const [selected, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  // Lista encolheu (galeria editada no admin): volta pro início sem efeito.
  const active = selected < images.length ? selected : 0;

  if (images.length === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground">
        A capa do roteiro aparece aqui.
      </div>
    );
  }

  const current = images[active]!;

  function step(delta: number) {
    setActive((index) => (index + delta + images.length) % images.length);
  }

  return (
    <div className="space-y-3">
      {images.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]" aria-label="Fotos do roteiro">
          {images.map((url, index) => (
            <li key={`${url}-${index}`} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Foto ${index + 1} de ${images.length}`}
                aria-current={index === active}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-lg border-2 bg-muted/30 transition-[border-color,opacity] sm:size-20",
                  index === active
                    ? "border-brand"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <GalleryImage src={url} alt="" sizes="80px" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative isolate block aspect-[16/9] w-full overflow-hidden rounded-2xl bg-brand-navy text-left text-white outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label={`Ampliar foto ${active + 1} de ${images.length}`}
      >
        <GalleryImage
          src={current}
          alt={title}
          sizes="(max-width: 768px) 100vw, 900px"
          priority
          className="transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-brand-navy/90 via-brand-navy/20 to-transparent"
        />
        <span className="absolute inset-x-0 bottom-0 p-5 font-heading text-2xl font-bold leading-tight tracking-tight drop-shadow sm:p-7 sm:text-3xl">
          {title}
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[min(96vw,1100px)] border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-[min(96vw,1100px)]"
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-brand-navy">
            <GalleryImage src={current} alt={title} sizes="96vw" className="object-contain" />
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
          >
            <X className="size-5" aria-hidden />
          </button>
          {images.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Foto anterior"
                className="absolute left-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Próxima foto"
                className="absolute right-3 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GalleryImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const resolved = resolvePublicImageSrc(src);

  return (
    <Image
      src={resolved}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      unoptimized={!isOptimizableRemoteImage(resolved)}
      className={cn("object-cover", className)}
    />
  );
}
