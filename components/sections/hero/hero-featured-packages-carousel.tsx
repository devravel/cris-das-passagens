"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PublicPackageCard } from "@/components/packages/public-package-card";
import { CarouselNavOutline } from "@/components/ui/carousel-nav-outline";
import { useCarouselNavOutlineHint } from "@/hooks/use-carousel-nav-outline-hint";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type HeroFeaturedPackagesCarouselProps = {
  packages: PublicPackage[];
  departureCity: string;
  className?: string;
};

const CARD_GAP_MOBILE = 12;
const CARD_GAP_DESKTOP = 12;
/** Abaixo deste viewport, card tem largura fixa (não espreme 3 no track). */
const NARROW_VIEWPORT_PX = 600;
const NARROW_CARD_MAX_PX = 220;
const NARROW_CARD_VW_RATIO = 0.78;

const navButtonClassName =
  "group absolute top-1/2 z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center overflow-visible rounded-full border border-border/80 bg-background/95 text-muted-foreground shadow-md backdrop-blur-sm transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out hover:scale-[1.06] hover:border-brand/35 hover:bg-brand/5 hover:text-brand hover:shadow-[0_4px_14px_-6px_rgba(52,91,167,0.28)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:size-10";

const navIconClassName =
  "relative z-10 size-5 transition-colors duration-200 group-hover:text-brand motion-reduce:transition-none";

function getCardGap(): number {
  return window.innerWidth >= 640 ? CARD_GAP_DESKTOP : CARD_GAP_MOBILE;
}

function resolveCardWidth(trackWidth: number, gap: number): number {
  if (window.innerWidth <= NARROW_VIEWPORT_PX) {
    return Math.min(NARROW_CARD_MAX_PX, window.innerWidth * NARROW_CARD_VW_RATIO);
  }

  if (trackWidth <= 0) return 0;

  // No máximo 3 cards visíveis no track.
  return Math.max(0, (trackWidth - gap * 2) / 3);
}

export function HeroFeaturedPackagesCarousel({
  packages,
  departureCity,
  className,
}: HeroFeaturedPackagesCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const cardWidthRef = useRef(0);
  const cardGapRef = useRef(CARD_GAP_MOBILE);

  const [cardWidth, setCardWidth] = useState(0);
  const [cardGap, setCardGap] = useState(CARD_GAP_MOBILE);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const { hintPrev, hintNext, pulseKey } = useCarouselNavOutlineHint({
    canScrollPrev,
    canScrollNext,
    getRoot: () => rootRef.current,
  });

  const hasMultiple = packages.length > 1;

  const updateNav = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const max = Math.max(0, track.scrollWidth - track.clientWidth);
    setCanScrollPrev(track.scrollLeft > 1);
    setCanScrollNext(track.scrollLeft < max - 1);
  }, []);

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const gap = getCardGap();
    const width = resolveCardWidth(track.clientWidth, gap);

    cardGapRef.current = gap;
    cardWidthRef.current = width;
    setCardGap(gap);
    setCardWidth(width);

    requestAnimationFrame(updateNav);
  }, [updateNav]);

  useLayoutEffect(() => {
    measure();
  }, [measure, packages.length]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const ro = new ResizeObserver(() => {
      measure();
    });
    ro.observe(track);
    window.addEventListener("resize", measure);
    track.addEventListener("scroll", updateNav, { passive: true });

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      track.removeEventListener("scroll", updateNav);
    };
  }, [measure, updateNav]);

  const scrollByStep = useCallback((direction: -1 | 1) => {
    const track = trackRef.current;
    const width = cardWidthRef.current;
    const gap = cardGapRef.current;

    if (!track || width <= 0) return;

    track.scrollBy({ left: direction * (width + gap), behavior: "smooth" });
  }, []);

  if (packages.length === 0) return null;

  return (
    <div ref={rootRef} className={cn("relative min-w-0", className)}>
      <div className="relative min-w-0">
        <button
          type="button"
          className={cn(
            navButtonClassName,
            // Mobile: sobre os cards. Desktop: fora, no meio vertical.
            "left-1 sm:left-2 lg:left-0 lg:-translate-x-[calc(100%+0.35rem)]",
          )}
          onClick={() => scrollByStep(-1)}
          disabled={!canScrollPrev}
          aria-label="Ver pacote anterior"
        >
          <CarouselNavOutline active={hintPrev} pulseKey={pulseKey} />
          <ChevronLeft className={navIconClassName} aria-hidden />
        </button>

        {/*
          Sem touch-action explícito (usa o padrão "auto"): o browser detecta o
          eixo naturalmente. overflow-x: auto com elemento não-scrollável
          verticalmente faz o arrasto vertical propagar para a página. O arrasto
          horizontal fica no carrossel com inércia nativa — sem nenhum handler
          manual de toque.
        */}
        <div
          ref={trackRef}
          className="min-w-0 overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="region"
          aria-roledescription="carousel"
          aria-label="Pacotes em destaque"
        >
          <div
            className={cn(
              "flex w-max items-stretch px-0.5 py-1",
              !hasMultiple && "min-w-full justify-center",
            )}
            style={{ gap: `${cardGap}px` }}
          >
            {packages.map((pkg, pkgIndex) => (
              <div
                key={pkg.id}
                style={{ width: cardWidth > 0 ? `${cardWidth}px` : undefined }}
                className={cn(
                  "flex shrink-0 items-stretch",
                  cardWidth === 0 && "invisible",
                )}
              >
                <PublicPackageCard
                  pkg={pkg}
                  departureCity={departureCity}
                  layout="carousel"
                  variant="landing"
                  size="compact"
                  narrowMobileTypography
                  priority={pkgIndex < 2}
                  className="h-full min-w-0"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={cn(
            navButtonClassName,
            "right-1 sm:right-2 lg:right-0 lg:translate-x-[calc(100%+0.35rem)]",
          )}
          onClick={() => scrollByStep(1)}
          disabled={!canScrollNext}
          aria-label="Ver próximo pacote"
        >
          <CarouselNavOutline
            active={hintNext}
            pulseKey={pulseKey}
            delayMs={hintPrev && hintNext ? 110 : 0}
          />
          <ChevronRight className={navIconClassName} aria-hidden />
        </button>
      </div>
    </div>
  );
}
