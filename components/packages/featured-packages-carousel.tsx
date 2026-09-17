"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { PublicPackageCard } from "@/components/packages/public-package-card";
import { CarouselArrow } from "@/components/ui/carousel-arrow";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type FeaturedPackagesCarouselProps = {
  packages: PublicPackage[];
  departureCity: string;
  /** Cards visíveis no track em viewports largas. */
  visibleCards?: number;
  className?: string;
};

const CARD_GAP_MOBILE = 12;
const CARD_GAP_DESKTOP = 12;
/** Abaixo deste viewport, card tem largura fixa (não espreme 3 no track). */
const NARROW_VIEWPORT_PX = 600;
const NARROW_CARD_MAX_PX = 220;
const NARROW_CARD_VW_RATIO = 0.78;

function getCardGap(): number {
  return window.innerWidth >= 640 ? CARD_GAP_DESKTOP : CARD_GAP_MOBILE;
}

function resolveCardWidth(trackWidth: number, gap: number, visible: number): number {
  if (window.innerWidth <= NARROW_VIEWPORT_PX) {
    return Math.min(NARROW_CARD_MAX_PX, window.innerWidth * NARROW_CARD_VW_RATIO);
  }

  if (trackWidth <= 0) return 0;

  // Tablet fica em 3; `visible` só vale a partir de lg.
  const count = window.innerWidth >= 1024 ? visible : 3;
  return Math.max(0, (trackWidth - gap * (count - 1)) / count);
}

export function FeaturedPackagesCarousel({
  packages,
  departureCity,
  visibleCards = 3,
  className,
}: FeaturedPackagesCarouselProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const cardWidthRef = useRef(0);
  const cardGapRef = useRef(CARD_GAP_MOBILE);

  const [cardWidth, setCardWidth] = useState(0);
  const [cardGap, setCardGap] = useState(CARD_GAP_MOBILE);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

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
    const width = resolveCardWidth(track.clientWidth, gap, visibleCards);

    cardGapRef.current = gap;
    cardWidthRef.current = width;
    setCardGap(gap);
    setCardWidth(width);

    requestAnimationFrame(updateNav);
  }, [updateNav, visibleCards]);

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
        {/* Mobile/tablet: sobre os cards (seta branca). Desktop: fora do trilho (seta azul). */}
        <CarouselArrow
          side="left"
          visible={canScrollPrev}
          onClick={() => scrollByStep(-1)}
          ariaLabel="Ver pacote anterior"
          className="absolute left-1 top-1/2 z-10 -translate-y-1/2 sm:left-2 xl:left-0 xl:-translate-x-full xl:text-brand xl:drop-shadow-none"
        />

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

        <CarouselArrow
          side="right"
          visible={canScrollNext}
          onClick={() => scrollByStep(1)}
          ariaLabel="Ver próximo pacote"
          className="absolute right-1 top-1/2 z-10 -translate-y-1/2 sm:right-2 xl:right-0 xl:translate-x-full xl:text-brand xl:drop-shadow-none"
        />
      </div>
    </div>
  );
}
