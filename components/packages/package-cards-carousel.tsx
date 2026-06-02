"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PublicPackageCard } from "@/components/packages/public-package-card";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type PackageCardsCarouselProps = {
  packages: PublicPackage[];
  departureCity: string;
  ariaLabel: string;
  className?: string;
  variant?: "landing" | "listing";
  showChecklist?: boolean;
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
/** Largura mínima confortável para cards detalhados (listing) em desktop. */
const LISTING_MIN_CARD_WIDTH = 240;

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
  if (viewportWidth < 1024) {
    if (variant === "listing") {
      if (viewportWidth >= 640) return 2;
      return 1;
    }

    if (viewportWidth >= 640) return 2;
    return 1;
  }

  const gap = getCardGap(viewportWidth);
  const maxCards =
    variant === "listing" ? (viewportWidth >= 1280 ? 4 : 3) : 3;
  const minCardWidth =
    variant === "landing" ? LANDING_MIN_CARD_WIDTH : LISTING_MIN_CARD_WIDTH;

  return resolveCardsPerView(trackWidth, gap, maxCards, minCardWidth);
}

function computeCarouselLayout(
  trackWidth: number,
  viewportWidth: number,
  variant: "landing" | "listing",
): CarouselLayout {
  const gap = getCardGap(viewportWidth);
  const cardsPerView = getCardsPerView(trackWidth, viewportWidth, variant);
  const totalGap = gap * Math.max(cardsPerView - 1, 0);
  const cardWidth = trackWidth > 0 ? Math.max(0, (trackWidth - totalGap) / cardsPerView) : 0;

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
  anchorCards = false,
  cardClassName,
}: PackageCardsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<CarouselLayout | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollPrev(track.scrollLeft > 8);
    setCanScrollNext(maxScroll > 8 && track.scrollLeft < maxScroll - 8);
  }, []);

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

    setLayout(nextLayout);
    updateScrollState();
  }, [updateScrollState, variant]);

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
          className="min-w-0 flex-1 snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
                  priority={variant === "listing" ? index < 4 : index === 0}
                  showChecklist={showChecklist}
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

      {hasOverflow ? (
        <p className="mt-2 text-center text-xs text-muted-foreground sm:hidden">
          Deslize para ver mais ofertas
        </p>
      ) : null}
    </div>
  );
}
