"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { isOptimizableRemoteImage, resolvePublicImageSrc } from "@/lib/storage/image-src";
import { cn } from "@/lib/utils";

type ItineraryGalleryProps = {
  title: string;
  cover: string;
  gallery: string[];
};

const SWIPE_MIN_PX = 40;

const navButtonClassName =
  "grid size-10 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition-colors hover:bg-black/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80";

/**
 * Referência: imagem grande + fileira de miniaturas. Navega por setas na
 * tela, teclado (← →) e swipe; clique na grande abre o lightbox.
 */
export function ItineraryGallery({ title, cover, gallery }: ItineraryGalleryProps) {
  const images = [cover, ...gallery].map((url) => url.trim()).filter(Boolean);
  const [selected, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  // Lista encolheu (galeria editada no admin): volta pro início sem efeito.
  const active = selected < images.length ? selected : 0;
  const count = images.length;
  const hasMany = count > 1;

  // Setas do teclado com o lightbox aberto (fechado, o wrapper focado cuida).
  useEffect(() => {
    if (!open || count < 2) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") setActive((index) => (index - 1 + count) % count);
      if (event.key === "ArrowRight") setActive((index) => (index + 1) % count);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, count]);

  if (count === 0) {
    return (
      <div className="flex aspect-[16/9] w-full items-center justify-center rounded-2xl border border-dashed border-border/70 bg-muted/20 text-sm text-muted-foreground">
        A capa do roteiro aparece aqui.
      </div>
    );
  }

  function step(delta: number) {
    if (!hasMany) return;
    setActive((index) => (index + delta + count) % count);
  }

  const current = images[active]!;
  const counter = `${active + 1} / ${count}`;

  const swipeHandlers = {
    onTouchStart: (event: React.TouchEvent) => {
      touchStartX.current = event.touches[0]?.clientX ?? null;
    },
    onTouchEnd: (event: React.TouchEvent) => {
      const start = touchStartX.current;
      touchStartX.current = null;
      if (start === null) return;
      const delta = (event.changedTouches[0]?.clientX ?? start) - start;
      if (Math.abs(delta) >= SWIPE_MIN_PX) step(delta < 0 ? 1 : -1);
    },
  };

  const arrows = (
    <>
      <button
        type="button"
        onClick={() => step(-1)}
        aria-label="Foto anterior"
        className={cn(navButtonClassName, "absolute left-3 top-1/2 z-[2] -translate-y-1/2")}
      >
        <ChevronLeft className="size-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => step(1)}
        aria-label="Próxima foto"
        className={cn(navButtonClassName, "absolute right-3 top-1/2 z-[2] -translate-y-1/2")}
      >
        <ChevronRight className="size-5" aria-hidden />
      </button>
    </>
  );

  return (
    <div
      className="space-y-3 rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
      tabIndex={hasMany ? 0 : -1}
      aria-label="Galeria de fotos. Use as setas do teclado para navegar."
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          step(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      <div className="group relative isolate aspect-[16/9] w-full overflow-hidden rounded-2xl bg-brand-navy text-white" {...swipeHandlers}>
        <GalleryImage
          src={current}
          alt={title}
          sizes="(max-width: 1024px) 100vw, 760px"
          priority
          className="transition-transform duration-700 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
        />
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-brand-navy/70 via-transparent to-transparent" />

        <button
          type="button"
          onClick={() => setOpen(true)}
          tabIndex={-1}
          className="absolute inset-0 z-[1] cursor-zoom-in outline-none"
          aria-label={`Ampliar foto ${counter}`}
        />

        {hasMany ? arrows : null}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-3 p-4">
          <span className="rounded-full bg-black/45 px-2.5 py-1 text-xs font-semibold tabular-nums backdrop-blur">
            {counter}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-black/45 px-2.5 py-1 text-xs font-semibold backdrop-blur">
            <Expand className="size-3.5" aria-hidden />
            Ampliar
          </span>
        </div>
      </div>

      {hasMany ? (
        <ul className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:thin]" aria-label="Miniaturas">
          {images.map((url, index) => (
            <li key={`${url}-${index}`} className="shrink-0">
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setActive(index)}
                aria-label={`Foto ${index + 1} de ${count}`}
                aria-current={index === active}
                className={cn(
                  "relative block size-16 overflow-hidden rounded-lg border-2 bg-muted/30 transition-[border-color,opacity] sm:size-20",
                  index === active ? "border-brand" : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <GalleryImage src={url} alt="" sizes="80px" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[min(96vw,1100px)] border-0 bg-transparent p-0 shadow-none ring-0 sm:max-w-[min(96vw,1100px)]"
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-brand-navy" {...swipeHandlers}>
            <GalleryImage src={current} alt={title} sizes="96vw" className="object-contain" />
          </div>
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-semibold tabular-nums text-white">
            {counter}
          </span>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            className={cn(navButtonClassName, "absolute right-3 top-3")}
          >
            <X className="size-5" aria-hidden />
          </button>
          {hasMany ? arrows : null}
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
