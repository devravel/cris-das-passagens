"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PublicPackageCard } from "@/components/packages/public-package-card";
import { CarouselDots } from "@/components/ui/carousel-dots";
import {
  applyAutoplayScrollOffset,
  syncScrollerToAutoplayOffset,
} from "@/lib/carousel-autoplay-scroll";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type PackageCardsContinuousCarouselProps = {
  packages: PublicPackage[];
  departureCity: string;
  ariaLabel: string;
  className?: string;
  variant?: "landing" | "listing";
  showChecklist?: boolean;
  cardClassName?: string;
  /** Exibe dots de navegação abaixo do carrossel (padrão: true). */
  showDots?: boolean;
  /** Exibe "Deslize para ver mais ofertas" em todos os breakpoints (padrão: só mobile). */
  scrollHintAlwaysVisible?: boolean;
  /** Botões anterior/próximo em desktop (>= md). */
  showNavButtons?: boolean;
};

type CarouselLayout = {
  cardWidth: number;
  gap: number;
  cardsPerView: number;
};

const CARD_GAP_MOBILE = 12;
const CARD_GAP_DESKTOP = 14;
/** Largura máxima (inclusive) para autoplay contínuo — alinhado ao breakpoint sm (640px). */
const MOBILE_AUTOPLAY_MAX_WIDTH_PX = 640;
/** Mesma velocidade da seção de parceiros (PartnersLogosCarousel). */
const MOBILE_AUTOPLAY_SPEED_PX_PER_MS = 0.036;
/** Destrava pausa presa no Safari iOS (ex.: touchcancel sem touchend). */
const PAUSE_RECOVERY_MS = 2500;
/** Limite de cópias renderizadas para o loop infinito (mobile). */
const MAX_COPIES = 8;
/** Tentativas de remedição quando layout/overflow ainda não está pronto (Safari iOS). */
const MAX_MEASURE_RETRIES = 12;
/** Largura mínima confortável para cards compactos (landing) em desktop. */
const LANDING_MIN_CARD_WIDTH = 160;
/** Hero "Confira nossos melhores pacotes": mais cards visíveis entre 425px e 1023px para cards mais estreitos. */
const LANDING_FEATURED_NARROW_MIN_VIEWPORT = 425;
const LANDING_FEATURED_NARROW_MAX_VIEWPORT = 1024;
/**
 * Hero em grid 50% (lg): a coluna fica estreita e resolveCardsPerView(160px) cai para 2 cards.
 * Força 3 cards visíveis apenas nesta faixa de viewport.
 */
const LANDING_FEATURED_HERO_COLUMN_MIN_VIEWPORT = 1024;
const LANDING_FEATURED_HERO_COLUMN_MAX_VIEWPORT = 1130;
/** Largura mínima confortável para cards detalhados (listing) em desktop. */
const LISTING_MIN_CARD_WIDTH = 240;

const navButtonClassName =
  "group absolute top-1/2 z-10 hidden size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground shadow-sm transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out hover:scale-[1.06] hover:border-brand/35 hover:bg-brand/5 hover:text-brand hover:shadow-[0_4px_14px_-6px_rgba(52,91,167,0.28)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 md:inline-flex sm:size-10";

const navIconClassName =
  "size-5 transition-colors duration-200 group-hover:text-brand motion-reduce:transition-none";

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

function getLandingFeaturedCardsPerView(viewportWidth: number): number {
  if (viewportWidth < LANDING_FEATURED_NARROW_MIN_VIEWPORT) {
    return 1;
  }

  if (viewportWidth >= 640) {
    return 3;
  }

  return 2;
}

function getCardsPerView(
  trackWidth: number,
  viewportWidth: number,
  variant: "landing" | "listing",
): number {
  if (viewportWidth < LANDING_FEATURED_NARROW_MAX_VIEWPORT) {
    if (variant === "listing") {
      if (viewportWidth >= 640) return 2;
      return 1;
    }

    return getLandingFeaturedCardsPerView(viewportWidth);
  }

  if (
    variant === "landing" &&
    viewportWidth >= LANDING_FEATURED_HERO_COLUMN_MIN_VIEWPORT &&
    viewportWidth <= LANDING_FEATURED_HERO_COLUMN_MAX_VIEWPORT
  ) {
    return 3;
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

/**
 * Estimativa quando o container ainda não tem largura (ex.: coluna 50% da hero no primeiro paint).
 * Evita cards com `invisible` até o ResizeObserver rodar.
 */
function getFallbackTrackWidth(
  viewportWidth: number,
  variant: "landing" | "listing",
): number {
  if (variant !== "landing" || viewportWidth <= 0) {
    return 0;
  }

  if (viewportWidth >= 1024) {
    return Math.max(LANDING_MIN_CARD_WIDTH * 2, Math.floor(viewportWidth * 0.42));
  }

  if (viewportWidth >= 640) {
    return Math.max(LANDING_MIN_CARD_WIDTH * 2, viewportWidth - 48);
  }

  return Math.max(LANDING_MIN_CARD_WIDTH, viewportWidth - 32);
}

export function PackageCardsContinuousCarousel({
  packages,
  departureCity,
  ariaLabel,
  className,
  variant = "landing",
  showChecklist = false,
  cardClassName,
  showDots = true,
  scrollHintAlwaysVisible = false,
  showNavButtons = false,
}: PackageCardsContinuousCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLDivElement | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  const [layout, setLayout] = useState<CarouselLayout | null>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);

  /** <= 640px: autoplay contínuo (parceiros). > 640px: carrossel manual. */
  const [isMobileAutoplay, setIsMobileAutoplay] = useState(false);
  const [copies, setCopies] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const loopSegmentRef = useRef(0);
  const reduceMotionRef = useRef(false);
  const isPausedRef = useRef(false);
  const isInteractingRef = useRef(false);

  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const measureRetriesRef = useRef(0);
  const measureLayoutRef = useRef<() => void>(() => undefined);
  const virtualScrollLeftRef = useRef(0);

  const hasOverflow = packages.length > 1;
  const useInfiniteTrack = isMobileAutoplay && copies > 1;
  const trackCopyCount = isMobileAutoplay ? Math.max(copies, 1) : 1;

  const applyPaused = useCallback(() => {
    const paused =
      isInteractingRef.current ||
      (typeof document !== "undefined" && document.hidden);

    isPausedRef.current = paused;
    setIsPaused((current) => (current === paused ? current : paused));
  }, []);

  const startInteraction = useCallback(() => {
    isInteractingRef.current = true;
    applyPaused();
  }, [applyPaused]);

  const endInteraction = useCallback(() => {
    isInteractingRef.current = false;
    applyPaused();
  }, [applyPaused]);

  const updateScrollState = useCallback(() => {
    const container = containerRef.current;

    if (!container || !layout || isMobileAutoplay) {
      return;
    }

    const maxScroll = container.scrollWidth - container.clientWidth;
    setCanScrollPrev(container.scrollLeft > 8);
    setCanScrollNext(maxScroll > 8 && container.scrollLeft < maxScroll - 8);

    const pageWidth = container.clientWidth;

    if (pageWidth <= 0) {
      return;
    }

    const nextIndex = Math.max(
      0,
      Math.min(pageCount - 1, Math.round(container.scrollLeft / pageWidth)),
    );

    setActivePage((current) => (current === nextIndex ? current : nextIndex));
  }, [layout, pageCount, isMobileAutoplay]);

  const measureLayout = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    const first = firstItemRef.current;
    const last = lastItemRef.current;

    if (!container) {
      return;
    }

    const containerWidth = container.clientWidth;
    const viewportWidth = window.innerWidth;
    const mobileAutoplay =
      viewportWidth <= MOBILE_AUTOPLAY_MAX_WIDTH_PX;

    setIsMobileAutoplay((current) =>
      current === mobileAutoplay ? current : mobileAutoplay,
    );

    const trackWidth =
      containerWidth > 0
        ? containerWidth
        : getFallbackTrackWidth(viewportWidth, variant);

    const nextLayout = computeCarouselLayout(trackWidth, viewportWidth, variant);

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

    if (containerWidth <= 0) {
      if (measureRetriesRef.current < MAX_MEASURE_RETRIES) {
        measureRetriesRef.current += 1;
        requestAnimationFrame(() => {
          measureLayoutRef.current();
        });
      }

      return;
    }

    let resolvedCopies = 1;

    if (mobileAutoplay && content && first && last) {
      const styles = window.getComputedStyle(content);
      const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
      const oneCopyWidth =
        last.offsetLeft + last.offsetWidth - first.offsetLeft;
      const loopSegment = oneCopyWidth + gap;

      loopSegmentRef.current = loopSegment;

      if (!reduceMotionRef.current && loopSegment > 0 && containerWidth > 0) {
        resolvedCopies = Math.min(
          MAX_COPIES,
          Math.max(2, 1 + Math.ceil((containerWidth + gap) / loopSegment)),
        );
      }

      setCopies((current) =>
        current === resolvedCopies ? current : resolvedCopies,
      );
    } else if (mobileAutoplay) {
      if (measureRetriesRef.current < MAX_MEASURE_RETRIES) {
        measureRetriesRef.current += 1;
        requestAnimationFrame(() => {
          measureLayoutRef.current();
        });
      }

      return;
    } else {
      loopSegmentRef.current = 0;
      setCopies((current) => (current === 1 ? current : 1));

      const nextPageCount =
        nextLayout.cardsPerView > 0
          ? Math.max(1, Math.ceil(packages.length / nextLayout.cardsPerView))
          : 1;

      setPageCount((current) =>
        current === nextPageCount ? current : nextPageCount,
      );
      updateScrollState();
      measureRetriesRef.current = 0;
      return;
    }

    const lacksScrollOverflow =
      resolvedCopies > 1 &&
      loopSegmentRef.current > 0 &&
      container.scrollWidth <= container.clientWidth + 1;

    if (
      (loopSegmentRef.current <= 0 || lacksScrollOverflow) &&
      measureRetriesRef.current < MAX_MEASURE_RETRIES
    ) {
      measureRetriesRef.current += 1;
      requestAnimationFrame(() => {
        measureLayoutRef.current();
      });
      return;
    }

    measureRetriesRef.current = 0;
  }, [variant, packages.length, updateScrollState]);

  useLayoutEffect(() => {
    measureLayoutRef.current = measureLayout;
  }, [measureLayout]);

  useLayoutEffect(() => {
    measureLayout();
  }, [packages.length, copies, reduceMotion, isMobileAutoplay, measureLayout]);

  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container) {
      return;
    }

    const observer = new ResizeObserver(measureLayout);
    observer.observe(container);

    if (content) {
      observer.observe(content);
    }

    window.addEventListener("resize", measureLayout);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureLayout);
    };
  }, [measureLayout]);

  useEffect(() => {
    reduceMotionRef.current = reduceMotion;
  }, [reduceMotion]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reduceMotionRef.current = media.matches;
      setReduceMotion(media.matches);
    };

    update();
    media.addEventListener("change", update);

    return () => {
      media.removeEventListener("change", update);
    };
  }, []);

  // Autoplay mobile: mesma estratégia de PartnersLogosCarousel (RAF + scrollLeft + loop).
  // isPausedRef controla pausa dentro do tick — o RAF permanece ativo para retomar sem remount.
  useEffect(() => {
    if (!isMobileAutoplay || reduceMotion || packages.length === 0) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      lastFrameTimeRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      const container = containerRef.current;

      if (!container) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (isPausedRef.current || document.hidden) {
        lastFrameTimeRef.current = null;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const loop = loopSegmentRef.current;

      if (loop <= 0) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = timestamp;
      }

      const deltaMs = Math.min(timestamp - lastFrameTimeRef.current, 48);
      lastFrameTimeRef.current = timestamp;

      let next = container.scrollLeft + MOBILE_AUTOPLAY_SPEED_PX_PER_MS * deltaMs;

      while (next >= loop) {
        next -= loop;
      }

      virtualScrollLeftRef.current = next;
      applyAutoplayScrollOffset(container, contentRef.current, next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      lastFrameTimeRef.current = null;
    };
  }, [isMobileAutoplay, reduceMotion, packages.length]);

  // Safety net: destrava isInteractingRef preso após gestos cancelados no Safari iOS.
  useEffect(() => {
    if (!isMobileAutoplay || !isPaused || reduceMotion || packages.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (isInteractingRef.current) {
        isInteractingRef.current = false;
      }

      applyPaused();
    }, PAUSE_RECOVERY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isMobileAutoplay, isPaused, reduceMotion, packages.length, applyPaused]);

  useEffect(() => {
    function handleVisibilityChange() {
      if (!document.hidden) {
        lastFrameTimeRef.current = null;
      }

      applyPaused();
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [applyPaused]);

  const scrollByStep = useCallback((direction: -1 | 1) => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    container.scrollBy({
      left: direction * container.clientWidth,
      behavior: "smooth",
    });
  }, []);

  const goToPage = useCallback(
    (index: number) => {
      const container = containerRef.current;

      if (!container) {
        return;
      }

      const pageWidth = container.clientWidth;

      if (pageWidth <= 0) {
        return;
      }

      const clampedIndex = Math.max(0, Math.min(index, pageCount - 1));
      container.scrollTo({
        left: clampedIndex * pageWidth,
        behavior: "smooth",
      });
      setActivePage(clampedIndex);
    },
    [pageCount],
  );

  function handleTouchStart() {
    if (!isMobileAutoplay) {
      return;
    }

    const container = containerRef.current;

    if (container) {
      syncScrollerToAutoplayOffset(
        container,
        contentRef.current,
        virtualScrollLeftRef.current,
      );
    }

    startInteraction();
  }

  function handleTouchEnd() {
    if (!isMobileAutoplay) {
      return;
    }

    const container = containerRef.current;

    if (container) {
      virtualScrollLeftRef.current = container.scrollLeft;
    }

    endInteraction();
  }

  function handleTouchCancel() {
    if (!isMobileAutoplay) {
      return;
    }

    const container = containerRef.current;

    if (container) {
      virtualScrollLeftRef.current = container.scrollLeft;
    }

    endInteraction();
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (!isMobileAutoplay || event.pointerType !== "touch") {
      return;
    }

    endInteraction();
  }

  if (packages.length === 0) {
    return null;
  }

  const cardWidth = layout?.cardWidth ?? 0;
  const cardGap = layout?.gap ?? CARD_GAP_MOBILE;
  const clampedActivePage = Math.min(activePage, Math.max(0, pageCount - 1));

  return (
    <div
      className={cn("relative min-w-0", showNavButtons && "overflow-visible", className)}
    >
      <div
        ref={containerRef}
        className={cn(
          "min-w-0",
          useInfiniteTrack || hasOverflow
            ? "touch-pan-x overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] scrollbar-none [&::-webkit-scrollbar]:hidden"
            : "overflow-hidden",
          useInfiniteTrack && "cursor-grab active:cursor-grabbing",
        )}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onPointerCancel={handlePointerCancel}
        onScroll={isMobileAutoplay ? undefined : updateScrollState}
      >
        <div
          ref={contentRef}
          className={cn(
            "flex w-max items-stretch px-0.5 py-1",
            useInfiniteTrack || hasOverflow ? "justify-start" : "min-w-full justify-center",
          )}
          style={{ gap: `${cardGap}px` }}
        >
          {Array.from({ length: trackCopyCount }, (_, copyIndex) => (
            <Fragment key={copyIndex}>
              {packages.map((pkg, packageIndex) => (
                <div
                  key={
                    isMobileAutoplay
                      ? `${copyIndex}-${packageIndex}-${pkg.id}`
                      : pkg.id
                  }
                  ref={
                    isMobileAutoplay && copyIndex === 0
                      ? (element) => {
                          if (packageIndex === 0) {
                            firstItemRef.current = element;
                          }

                          if (packageIndex === packages.length - 1) {
                            lastItemRef.current = element;
                          }
                        }
                      : undefined
                  }
                  style={{
                    width:
                      cardWidth > 0
                        ? `${cardWidth}px`
                        : variant === "landing"
                          ? `${LANDING_MIN_CARD_WIDTH}px`
                          : undefined,
                  }}
                  className="flex shrink-0 items-stretch"
                  aria-hidden={isMobileAutoplay && copyIndex !== 0}
                >
                  <PublicPackageCard
                    pkg={pkg}
                    departureCity={departureCity}
                    layout="carousel"
                    variant={variant}
                    size={variant === "landing" ? "compact" : "default"}
                    priority={copyIndex === 0 && packageIndex < 4}
                    showChecklist={showChecklist}
                    className={cn("h-full min-w-0", cardClassName)}
                  />
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      {showNavButtons ? (
        <>
          <button
            type="button"
            className={cn(navButtonClassName, "left-0 md:-left-10")}
            onClick={() => scrollByStep(-1)}
            disabled={!canScrollPrev}
            aria-label="Ver pacotes anteriores"
          >
            <ChevronLeft className={navIconClassName} aria-hidden />
          </button>
          <button
            type="button"
            className={cn(navButtonClassName, "right-0 md:-right-10")}
            onClick={() => scrollByStep(1)}
            disabled={!canScrollNext}
            aria-label="Ver próximos pacotes"
          >
            <ChevronRight className={navIconClassName} aria-hidden />
          </button>
        </>
      ) : null}

      {showDots && !isMobileAutoplay && hasOverflow && pageCount > 1 ? (
        <CarouselDots
          pageCount={pageCount}
          activeIndex={clampedActivePage}
          onSelect={goToPage}
          ariaLabel="Navegar pacotes em destaque"
          getItemLabel={(index, total) =>
            `Ver página ${index + 1} de ${total} dos pacotes em destaque`
          }
          className="mt-4 lg:hidden"
        />
      ) : null}

      {hasOverflow || scrollHintAlwaysVisible ? (
        <p
          className={cn(
            "text-center text-muted-foreground",
            scrollHintAlwaysVisible
              ? "mt-[0.525rem] text-[0.7725rem] sm:mt-[0.65625rem] md:mt-[0.7875rem]"
              : "mt-2 text-xs sm:hidden",
          )}
        >
          Deslize para ver mais ofertas
        </p>
      ) : null}
    </div>
  );
}
