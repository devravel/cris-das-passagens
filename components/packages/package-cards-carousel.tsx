"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PackageCarouselScrollHint } from "@/components/packages/package-carousel-scroll-hint";
import { PublicPackageCard } from "@/components/packages/public-package-card";
import { CarouselDots } from "@/components/ui/carousel-dots";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type PackageCardsCarouselProps = {
  packages: PublicPackage[];
  departureCity: string;
  ariaLabel: string;
  className?: string;
  variant?: "landing" | "listing";
  showChecklist?: boolean;
  showAirlineBadge?: boolean;
  anchorCards?: boolean;
  cardClassName?: string;
};

type CarouselLayout = {
  cardWidth: number;
  gap: number;
  cardsPerView: number;
};

const CARD_GAP_MOBILE = 12;
const CARD_GAP_DESKTOP = 14;

/** Largura mínima confortável para cards compactos (landing) em desktop. */
const LANDING_MIN_CARD_WIDTH = 160;
/** Largura mínima para cards de listing em desktop (≥1024px). */
const LISTING_MIN_CARD_WIDTH_DESKTOP = 240;
/** Largura mínima em tablet largo (768px–1023px) — permite 3 cards com boa legibilidade. */
const LISTING_MIN_CARD_WIDTH_TABLET = 196;
/** Largura mínima em tablet estreito (640px–767px) — mantém 2 cards com proporções de referência. */
const LISTING_MIN_CARD_WIDTH_SMALL_TABLET = 188;
/** Faixa mobile largo (426px–639px) — alinhada à proporção visual de 640px com 2 colunas. */
const LISTING_MID_VIEWPORT_MIN = 426;
/** Largura típica de card com 2 colunas em viewport de 640px (track ~536px, gap 14px). */
const LISTING_REFERENCE_CARD_WIDTH_AT_640 = 261;

function getListingMinCardWidth(viewportWidth: number): number {
  if (viewportWidth >= 1024) {
    return LISTING_MIN_CARD_WIDTH_DESKTOP;
  }

  if (viewportWidth >= 768) {
    return LISTING_MIN_CARD_WIDTH_TABLET;
  }

  return LISTING_MIN_CARD_WIDTH_SMALL_TABLET;
}

function getCardGap(viewportWidth: number): number {
  return viewportWidth >= 640 ? CARD_GAP_DESKTOP : CARD_GAP_MOBILE;
}

/**
 * A partir de lg (1024px), o número de cards visíveis depende da largura real
 * do track — não do viewport. Evita cards espremidos em colunas estreitas (hero 50%).
 */
function resolveCardsPerView(
  trackWidth: number,
  gap: number,
  maxCards: number,
  minCardWidth: number,
): number {
  for (let count = maxCards; count >= 1; count -= 1) {
    const cardWidth = (trackWidth - gap * (count - 1)) / count;
    if (cardWidth >= minCardWidth) {
      return count;
    }
  }

  return 1;
}

function getCardsPerView(
  trackWidth: number,
  viewportWidth: number,
  variant: "landing" | "listing",
): number {
  if (variant === "listing") {
    if (viewportWidth < LISTING_MID_VIEWPORT_MIN) {
      return 1;
    }

    if (viewportWidth < 640) {
      const gap = getCardGap(viewportWidth);
      return resolveCardsPerView(
        trackWidth,
        gap,
        2,
        LISTING_MIN_CARD_WIDTH_SMALL_TABLET,
      );
    }

    const gap = getCardGap(viewportWidth);
    return resolveCardsPerView(
      trackWidth,
      gap,
      3,
      getListingMinCardWidth(viewportWidth),
    );
  }

  if (viewportWidth < 1024) {
    if (viewportWidth >= 640) return 2;
    return 1;
  }

  const gap = getCardGap(viewportWidth);
  return resolveCardsPerView(trackWidth, gap, 3, LANDING_MIN_CARD_WIDTH);
}

function computeCarouselLayout(
  trackWidth: number,
  viewportWidth: number,
  variant: "landing" | "listing",
): CarouselLayout {
  const gap = getCardGap(viewportWidth);
  const cardsPerView = getCardsPerView(trackWidth, viewportWidth, variant);
  const totalGap = gap * Math.max(cardsPerView - 1, 0);
  let cardWidth = trackWidth > 0 ? Math.max(0, (trackWidth - totalGap) / cardsPerView) : 0;

  if (
    variant === "listing" &&
    viewportWidth >= LISTING_MID_VIEWPORT_MIN &&
    viewportWidth < 640
  ) {
    cardWidth = Math.min(cardWidth, LISTING_REFERENCE_CARD_WIDTH_AT_640);
  }

  return { cardWidth, gap, cardsPerView };
}

const navButtonClassName =
  "group inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground shadow-sm transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out hover:scale-[1.06] hover:border-brand/35 hover:bg-brand/5 hover:text-brand hover:shadow-[0_4px_14px_-6px_rgba(52,91,167,0.28)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:size-10";

const navIconClassName =
  "size-5 transition-colors duration-200 group-hover:text-brand motion-reduce:transition-none";

export function PackageCardsCarousel({
  packages,
  departureCity,
  ariaLabel,
  className,
  variant = "landing",
  showChecklist = false,
  showAirlineBadge = false,
  anchorCards = false,
  cardClassName,
}: PackageCardsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<CarouselLayout | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;

    if (!track || !layout) {
      return;
    }

    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollPrev(track.scrollLeft > 8);
    setCanScrollNext(maxScroll > 8 && track.scrollLeft < maxScroll - 8);

    // Calculate current page based on scroll position
    const scrollPosition = track.scrollLeft;
    const pageWidth = track.clientWidth;
    const newCurrentPage = Math.round(scrollPosition / pageWidth);
    setCurrentPage(Math.max(0, Math.min(newCurrentPage, pageCount - 1)));
  }, [layout, pageCount]);

  const syncLayout = useCallback(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const nextLayout = computeCarouselLayout(
      track.clientWidth,
      window.innerWidth,
      variant,
    );

    setLayout((currentLayout) => {
      // Only update if there's a meaningful change
      if (!currentLayout || 
          Math.abs(currentLayout.cardWidth - nextLayout.cardWidth) > 1 ||
          currentLayout.cardsPerView !== nextLayout.cardsPerView ||
          currentLayout.gap !== nextLayout.gap) {
        return nextLayout;
      }
      return currentLayout;
    });

    // Calculate page count based on packages and cards per view
    const newPageCount = nextLayout.cardsPerView > 0 
      ? Math.ceil(packages.length / nextLayout.cardsPerView)
      : 1;
    
    setPageCount((currentPageCount) => {
      if (currentPageCount !== newPageCount) {
        return newPageCount;
      }
      return currentPageCount;
    });

    updateScrollState();
  }, [updateScrollState, variant, packages.length]);

  useLayoutEffect(() => {
    syncLayout();
  }, [packages.length, syncLayout]);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const observer = new ResizeObserver(syncLayout);
    observer.observe(track);
    window.addEventListener("resize", syncLayout);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncLayout);
    };
  }, [syncLayout]);

  const scrollByStep = useCallback((direction: -1 | 1) => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    track.scrollBy({
      left: direction * track.clientWidth,
      behavior: "smooth",
    });
  }, []);

  const goToPage = useCallback((pageIndex: number) => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const pageWidth = track.clientWidth;
    const targetScrollLeft = pageIndex * pageWidth;

    track.scrollTo({
      left: targetScrollLeft,
      behavior: "smooth",
    });
  }, []);

  if (packages.length === 0) {
    return null;
  }

  const hasOverflow = packages.length > 1;
  const cardWidth = layout?.cardWidth ?? 0;
  const cardGap = layout?.gap ?? CARD_GAP_MOBILE;

  return (
    <div className={cn("relative min-w-0", className)}>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className={navButtonClassName}
          onClick={() => scrollByStep(-1)}
          disabled={!canScrollPrev}
          aria-label="Ver pacotes anteriores"
        >
          <ChevronLeft className={navIconClassName} aria-hidden />
        </button>

        <div
          ref={trackRef}
          className="min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
          role="region"
          aria-roledescription="carousel"
          aria-label={ariaLabel}
          onScroll={updateScrollState}
        >
          <div
            className="flex w-max items-stretch px-0.5 py-1"
            style={{ gap: `${cardGap}px` }}
          >
            {packages.map((pkg, index) => (
              <div
                key={pkg.id}
                id={anchorCards ? `pacote-${pkg.slug}` : undefined}
                tabIndex={anchorCards ? -1 : undefined}
                style={{ width: cardWidth > 0 ? `${cardWidth}px` : undefined }}
                className={cn(
                  "flex shrink-0 snap-start scroll-mt-28 items-stretch outline-none",
                  cardWidth === 0 && "invisible",
                  anchorCards && "package-card-anchor",
                )}
              >
                <PublicPackageCard
                  pkg={pkg}
                  departureCity={departureCity}
                  layout="carousel"
                  variant={variant}
                  size={variant === "landing" ? "compact" : "default"}
                  priority={index < 4}
                  showChecklist={showChecklist}
                  showAirlineBadge={showAirlineBadge}
                  className={cn("h-full min-w-0", cardClassName)}
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={navButtonClassName}
          onClick={() => scrollByStep(1)}
          disabled={!canScrollNext}
          aria-label="Ver próximos pacotes"
        >
          <ChevronRight className={navIconClassName} aria-hidden />
        </button>
      </div>

      {hasOverflow && pageCount > 1 ? (
        <CarouselDots
          pageCount={pageCount}
          activeIndex={currentPage}
          onSelect={goToPage}
          ariaLabel="Navegar pacotes"
          getItemLabel={(index, total) => `Ver página ${index + 1} de ${total} dos pacotes`}
          className="mt-4 lg:hidden"
        />
      ) : null}

      {hasOverflow ? (
        <PackageCarouselScrollHint className="mt-2 text-xs" />
      ) : null}
    </div>
  );
}
