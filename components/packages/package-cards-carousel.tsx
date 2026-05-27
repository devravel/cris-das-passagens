"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PublicPackageCard } from "@/components/packages/public-package-card";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

const SCROLL_STEP = 280;

type PackageCardsCarouselProps = {
  packages: PublicPackage[];
  departureCity: string;
  ariaLabel: string;
  className?: string;
};

const navButtonClassName =
  "group inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground shadow-sm transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out hover:scale-[1.06] hover:border-brand/35 hover:bg-brand/5 hover:text-brand hover:shadow-[0_4px_14px_-6px_rgba(52,91,167,0.28)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:size-10";

const navIconClassName =
  "size-5 transition-colors duration-200 group-hover:text-brand motion-reduce:transition-none";

export function PackageCardsCarousel({
  packages,
  departureCity,
  ariaLabel,
  className,
}: PackageCardsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    updateScrollState();

    const track = trackRef.current;

    if (!track) {
      return;
    }

    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);

    return () => {
      observer.disconnect();
    };
  }, [packages.length, updateScrollState]);

  const scrollByStep = useCallback((direction: -1 | 1) => {
    trackRef.current?.scrollBy({
      left: direction * SCROLL_STEP,
      behavior: "smooth",
    });
  }, []);

  if (packages.length === 0) {
    return null;
  }

  const hasOverflow = packages.length > 1;

  return (
    <div className={cn("relative min-w-0", className)}>
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          className={cn(navButtonClassName, "hidden sm:inline-flex")}
          onClick={() => scrollByStep(-1)}
          disabled={!canScrollPrev}
          aria-label="Ver pacotes anteriores"
        >
          <ChevronLeft className={navIconClassName} aria-hidden />
        </button>

        <div
          ref={trackRef}
          className="min-w-0 flex-1 overflow-x-auto overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="region"
          aria-roledescription="carousel"
          aria-label={ariaLabel}
          onScroll={updateScrollState}
        >
          <div className="flex w-max items-stretch gap-3 px-0.5 py-1 sm:gap-4">
            {packages.map((pkg, index) => (
              <PublicPackageCard
                key={pkg.id}
                pkg={pkg}
                departureCity={departureCity}
                priority={index === 0}
                className="h-full"
              />
            ))}
          </div>
        </div>

        <button
          type="button"
          className={cn(navButtonClassName, "hidden sm:inline-flex")}
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
