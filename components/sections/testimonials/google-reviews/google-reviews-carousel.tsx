"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import type { GoogleReview } from "@/config/google-reviews-fallback";
import { GoogleReviewCard } from "@/components/sections/testimonials/google-reviews/google-review-card";
import { CarouselDots } from "@/components/ui/carousel-dots";
import { cn } from "@/lib/utils";

type GoogleReviewsCarouselProps = {
  reviews: readonly GoogleReview[];
  onOpenReview: (reviewId: string) => void;
  className?: string;
};

type CarouselLayout = {
  cardWidth: number;
  gap: number;
  cardsPerView: number;
};

const CARD_GAP_MOBILE = 12;
const CARD_GAP_DESKTOP = 16;
const MIN_CARD_WIDTH = 260;

function getCardGap(viewportWidth: number): number {
  return viewportWidth >= 640 ? CARD_GAP_DESKTOP : CARD_GAP_MOBILE;
}

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

function getCardsPerView(trackWidth: number, viewportWidth: number): number {
  const gap = getCardGap(viewportWidth);

  if (viewportWidth < 640) {
    return 1;
  }

  if (viewportWidth < 1024) {
    return resolveCardsPerView(trackWidth, gap, 2, MIN_CARD_WIDTH);
  }

  return resolveCardsPerView(trackWidth, gap, 3, MIN_CARD_WIDTH);
}

function computeCarouselLayout(
  trackWidth: number,
  viewportWidth: number,
): CarouselLayout {
  const gap = getCardGap(viewportWidth);
  const cardsPerView = getCardsPerView(trackWidth, viewportWidth);
  const totalGap = gap * Math.max(cardsPerView - 1, 0);
  const cardWidth =
    trackWidth > 0 ? Math.max(0, (trackWidth - totalGap) / cardsPerView) : 0;

  return { cardWidth, gap, cardsPerView };
}

const navButtonClassName =
  "group inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground shadow-sm transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out hover:scale-[1.06] hover:border-brand/35 hover:bg-brand/5 hover:text-brand hover:shadow-[0_4px_14px_-6px_rgba(52,91,167,0.28)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:size-10";

const navIconClassName =
  "size-5 transition-colors duration-200 group-hover:text-brand motion-reduce:transition-none";

export function GoogleReviewsCarousel({
  reviews,
  onOpenReview,
  className,
}: GoogleReviewsCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<CarouselLayout | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const updateScrollState = useCallback(() => {
    const track = trackRef.current;

    if (!track || !layout) {
      return;
    }

    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanScrollPrev(track.scrollLeft > 8);
    setCanScrollNext(maxScroll > 8 && track.scrollLeft < maxScroll - 8);

    const pageWidth = track.clientWidth;
    const newCurrentPage =
      pageWidth > 0 ? Math.round(track.scrollLeft / pageWidth) : 0;

    setCurrentPage(Math.max(0, Math.min(newCurrentPage, pageCount - 1)));
  }, [layout, pageCount]);

  const syncLayout = useCallback(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const nextLayout = computeCarouselLayout(track.clientWidth, window.innerWidth);

    setLayout((currentLayout) => {
      if (
        !currentLayout ||
        Math.abs(currentLayout.cardWidth - nextLayout.cardWidth) > 1 ||
        currentLayout.cardsPerView !== nextLayout.cardsPerView ||
        currentLayout.gap !== nextLayout.gap
      ) {
        return nextLayout;
      }

      return currentLayout;
    });

    const newPageCount =
      nextLayout.cardsPerView > 0
        ? Math.ceil(reviews.length / nextLayout.cardsPerView)
        : 1;

    setPageCount((currentPageCount) =>
      currentPageCount !== newPageCount ? newPageCount : currentPageCount,
    );

    updateScrollState();
  }, [reviews.length, updateScrollState]);

  useLayoutEffect(() => {
    syncLayout();
  }, [reviews.length, syncLayout]);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const observer = new ResizeObserver(syncLayout);
    observer.observe(track);
    window.addEventListener("resize", syncLayout);
    track.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", syncLayout);
      track.removeEventListener("scroll", updateScrollState);
    };
  }, [syncLayout, updateScrollState]);

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

    track.scrollTo({
      left: pageIndex * track.clientWidth,
      behavior: "smooth",
    });
  }, []);

  const handlePointerDown = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;

    if (!track || event.pointerType === "mouse") {
      return;
    }

    isDragging.current = true;
    dragStartX.current = event.clientX;
    dragScrollLeft.current = track.scrollLeft;
    track.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;

    if (!track || !isDragging.current) {
      return;
    }

    const delta = event.clientX - dragStartX.current;
    track.scrollLeft = dragScrollLeft.current - delta;
  }, []);

  const endDrag = useCallback((event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;

    if (!track || !isDragging.current) {
      return;
    }

    isDragging.current = false;

    if (track.hasPointerCapture(event.pointerId)) {
      track.releasePointerCapture(event.pointerId);
    }

    const pageWidth = track.clientWidth;
    const nearestPage = Math.round(track.scrollLeft / pageWidth);

    track.scrollTo({
      left: nearestPage * pageWidth,
      behavior: "smooth",
    });
  }, []);

  if (reviews.length === 0) {
    return null;
  }

  const cardWidth = layout?.cardWidth ?? 0;
  const cardGap = layout?.gap ?? CARD_GAP_MOBILE;
  const hasMultiplePages = pageCount > 1;

  return (
    <div className={cn("relative min-w-0", className)}>
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-x-2 sm:gap-x-3">
        <button
          type="button"
          className={cn(navButtonClassName, "col-start-1 row-start-1")}
          onClick={() => scrollByStep(-1)}
          disabled={!canScrollPrev}
          aria-label="Ver avaliações anteriores"
        >
          <ChevronLeft className={navIconClassName} aria-hidden />
        </button>

        <div
          ref={trackRef}
          className="col-start-2 row-start-1 min-w-0 overflow-x-auto overscroll-x-contain scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="region"
          aria-label="Carrossel de avaliações do Google"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <div className="flex w-max min-w-full touch-pan-y py-0.5">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="shrink-0"
                style={{
                  width: cardWidth > 0 ? cardWidth : "100%",
                  marginRight: cardGap,
                }}
              >
                <GoogleReviewCard review={review} onOpen={onOpenReview} />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={cn(navButtonClassName, "col-start-3 row-start-1")}
          onClick={() => scrollByStep(1)}
          disabled={!canScrollNext}
          aria-label="Ver próximas avaliações"
        >
          <ChevronRight className={navIconClassName} aria-hidden />
        </button>
      </div>

      {hasMultiplePages ? (
        <CarouselDots
          pageCount={pageCount}
          activeIndex={currentPage}
          onSelect={goToPage}
          ariaLabel="Navegação do carrossel de avaliações"
          className="mt-5 sm:mt-6"
          getItemLabel={(index, total) =>
            `Ver grupo de avaliações ${index + 1} de ${total}`
          }
        />
      ) : null}
    </div>
  );
}
