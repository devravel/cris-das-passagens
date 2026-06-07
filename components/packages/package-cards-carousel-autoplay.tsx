"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
} from "react";

import { PackageCarouselScrollHint } from "@/components/packages/package-carousel-scroll-hint";
import { PublicPackageCard } from "@/components/packages/public-package-card";
import {
  advanceAutoplayScrollOffset,
  isCoarsePointerDevice,
  readAutoplayScrollOffset,
  syncScrollerToAutoplayOffset,
} from "@/lib/carousel-autoplay-scroll";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

/** ~14.4px/s — velocidade 2.5x mais lenta que os parceiros para leitura confortável. */
const AUTOPLAY_SPEED_PX_PER_MS = 0.0144;
/** Janela curta em que o autoplay não avança durante um scroll suave por clique no dot. */
const PROGRAMMATIC_SCROLL_MS = 550;
/** Limite de cópias renderizadas para o loop infinito. */
const MAX_COPIES = 8;

const CARD_GAP_MOBILE = 12;
const CARD_GAP_DESKTOP = 14;
/** Largura mínima confortável para cards compactos (landing) em desktop. */
const LANDING_MIN_CARD_WIDTH = 160;
/** Largura mínima confortável para cards detalhados (listing) em desktop. */
const LISTING_MIN_CARD_WIDTH = 240;

type PackageCardsCarouselAutoplayProps = {
  packages: PublicPackage[];
  departureCity: string;
  ariaLabel: string;
  className?: string;
  variant?: "landing" | "listing";
  showChecklist?: boolean;
  cardClassName?: string;
  /** Exibe dots de navegação abaixo do carrossel (padrão: true). */
  showDots?: boolean;
  /** Exibe o hint do carrossel em todos os breakpoints (padrão: só quando há overflow). */
  scrollHintAlwaysVisible?: boolean;
};

type CarouselLayout = {
  cardWidth: number;
  gap: number;
};

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

  return { cardWidth, gap };
}

function PackageCarouselDots({
  pageCount,
  activeIndex,
  onSelect,
}: {
  pageCount: number;
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const hasMultiple = pageCount > 1;

  return (
    <div
      className="mt-5 flex items-center justify-center gap-2 sm:mt-6"
      role="tablist"
      aria-label="Navegar pacotes"
    >
      {Array.from({ length: pageCount }, (_, index) => {
        const isActive = index === activeIndex;

        return (
          <button
            key={index}
            type="button"
            role="tab"
            disabled={!hasMultiple}
            aria-selected={isActive}
            aria-disabled={!hasMultiple}
            aria-label={`Ver grupo de pacotes ${index + 1} de ${pageCount}`}
            className={cn(
              "h-2 rounded-full transition-all duration-300 motion-reduce:transition-none",
              isActive ? "w-7 bg-brand" : "w-2 bg-border",
              hasMultiple
                ? "hover:bg-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                : "cursor-default opacity-70",
            )}
            onClick={() => {
              if (hasMultiple) {
                onSelect(index);
              }
            }}
          />
        );
      })}
    </div>
  );
}

export function PackageCardsCarouselAutoplay({
  packages,
  departureCity,
  ariaLabel,
  className,
  variant = "landing",
  showChecklist = false,
  cardClassName,
  showDots = true,
  scrollHintAlwaysVisible = false,
}: PackageCardsCarouselAutoplayProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const firstItemRef = useRef<HTMLDivElement | null>(null);
  const lastItemRef = useRef<HTMLDivElement | null>(null);

  // Estado que afeta render (mantido enxuto para evitar re-renders).
  const [copies, setCopies] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [layout, setLayout] = useState<CarouselLayout | null>(null);

  // Medições e flags vivem em refs — o autoplay nunca dispara re-render.
  const loopSegmentRef = useRef(0);
  const oneCopyWidthRef = useRef(0);
  const pageCountRef = useRef(1);
  const reduceMotionRef = useRef(false);

  const isPausedRef = useRef(false);
  const isInteractingRef = useRef(false);
  const isHoverRef = useRef(false);
  const isFocusRef = useRef(false);

  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const programmaticUntilRef = useRef(0);
  const pauseForHoverFocusRef = useRef(true);
  const virtualScrollLeftRef = useRef(0);

  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragScrollLeft = useRef(0);

  const clampedActivePage = Math.min(activePage, Math.max(0, pageCount - 1));

  const applyPaused = useCallback(() => {
    const paused =
      isInteractingRef.current ||
      (typeof document !== "undefined" && document.hidden) ||
      (pauseForHoverFocusRef.current &&
        (isHoverRef.current || isFocusRef.current));

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

  const syncActivePageFromScroll = useCallback(() => {
    const track = trackRef.current;
    const loop = loopSegmentRef.current;
    const pages = pageCountRef.current;

    if (!track || loop <= 0 || pages <= 1) {
      return;
    }

    const viewport = track.clientWidth;

    if (viewport <= 0) {
      return;
    }

    const scrollLeft = readAutoplayScrollOffset(
      track,
      contentRef.current,
      virtualScrollLeftRef.current,
    );
    const offsetInLoop = ((scrollLeft % loop) + loop) % loop;
    const nextIndex = Math.max(
      0,
      Math.min(pages - 1, Math.floor(offsetInLoop / viewport)),
    );

    setActivePage((current) => (current === nextIndex ? current : nextIndex));
  }, []);

  const measureLayout = useCallback(() => {
    const track = trackRef.current;
    const content = contentRef.current;
    const first = firstItemRef.current;
    const last = lastItemRef.current;

    if (!track || !content || !first || !last) {
      return;
    }

    const viewport = track.clientWidth;
    const viewportWidth = window.innerWidth;
    
    // Calcula layout dos cards
    const nextLayout = computeCarouselLayout(
      viewport,
      viewportWidth,
      variant,
    );
    
    setLayout((currentLayout) => {
      // Only update if there's a meaningful change
      if (!currentLayout || 
          Math.abs(currentLayout.cardWidth - nextLayout.cardWidth) > 1 ||
          currentLayout.gap !== nextLayout.gap) {
        return nextLayout;
      }
      return currentLayout;
    });

    const styles = window.getComputedStyle(content);
    const gap = parseFloat(styles.columnGap || styles.gap || "0") || 0;
    const oneCopyWidth =
      last.offsetLeft + last.offsetWidth - first.offsetLeft;
    const loopSegment = oneCopyWidth + gap;

    oneCopyWidthRef.current = oneCopyWidth;
    loopSegmentRef.current = loopSegment;

    const nextPageCount =
      viewport > 0 && oneCopyWidth > 0
        ? Math.max(1, Math.ceil(oneCopyWidth / viewport))
        : 1;

    pageCountRef.current = nextPageCount;
    setPageCount((current) =>
      current === nextPageCount ? current : nextPageCount,
    );

    // Cópias suficientes para preencher viewport + um segmento de loop,
    // garantindo continuidade sem espaços vazios. Reduced-motion = 1 cópia.
    let nextCopies = 1;

    if (!reduceMotionRef.current && loopSegment > 0 && viewport > 0) {
      nextCopies = Math.min(
        MAX_COPIES,
        Math.max(2, 1 + Math.ceil((viewport + gap) / loopSegment)),
      );
    }

    setCopies((current) => (current === nextCopies ? current : nextCopies));
    syncActivePageFromScroll();
  }, [syncActivePageFromScroll, variant]);

  const goToPage = useCallback((index: number) => {
    const track = trackRef.current;
    const loop = loopSegmentRef.current;
    const oneCopyWidth = oneCopyWidthRef.current;
    const pages = pageCountRef.current;

    if (!track || loop <= 0 || pages <= 1) {
      return;
    }

    const viewport = track.clientWidth;

    if (viewport <= 0) {
      return;
    }

    const clampedIndex = Math.max(0, Math.min(index, pages - 1));
    const scrollLeft = readAutoplayScrollOffset(
      track,
      contentRef.current,
      virtualScrollLeftRef.current,
    );
    const offsetInLoop = ((scrollLeft % loop) + loop) % loop;
    const cycleBase = scrollLeft - offsetInLoop;
    const maxOffset = Math.max(0, oneCopyWidth - viewport);
    const targetOffset = Math.min(clampedIndex * viewport, maxOffset);

    programmaticUntilRef.current = performance.now() + PROGRAMMATIC_SCROLL_MS;
    track.scrollTo({ left: cycleBase + targetOffset, behavior: "smooth" });
    setActivePage(clampedIndex);
  }, []);

  // Sincroniza refs auxiliares.
  useEffect(() => {
    reduceMotionRef.current = reduceMotion;
  }, [reduceMotion]);

  // Preferência de movimento reduzido.
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

  useLayoutEffect(() => {
    pauseForHoverFocusRef.current = !isCoarsePointerDevice();
  }, []);

  // Mede o layout no mount e sempre que o conteúdo/cópias mudarem.
  useLayoutEffect(() => {
    measureLayout();
  }, [packages, copies, reduceMotion, measureLayout]);

  // Recalcula quando o track ou o conteúdo mudam de tamanho (inclui load de imagens).
  useEffect(() => {
    const track = trackRef.current;
    const content = contentRef.current;

    if (!track || !content) {
      return;
    }

    const observer = new ResizeObserver(() => {
      measureLayout();
    });

    observer.observe(track);
    observer.observe(content);
    window.addEventListener("resize", measureLayout);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureLayout);
    };
  }, [measureLayout]);

  // Loop de animação: fluxo horizontal constante via scrollLeft (sem re-render).
  // isPausedRef controla pausa dentro do tick — o RAF permanece ativo para retomar sem remount.
  useEffect(() => {
    if (reduceMotion || packages.length === 0) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      lastFrameTimeRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      const track = trackRef.current;

      if (!track) {
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

      if (timestamp >= programmaticUntilRef.current) {
        virtualScrollLeftRef.current = advanceAutoplayScrollOffset(
          track,
          contentRef.current,
          virtualScrollLeftRef.current,
          AUTOPLAY_SPEED_PX_PER_MS * deltaMs,
          loop,
        );
      }

      syncActivePageFromScroll();
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
  }, [reduceMotion, packages.length, syncActivePageFromScroll]);

  // Pausa quando a aba fica oculta.
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

  function handleTouchStart() {
    const track = trackRef.current;

    if (track) {
      syncScrollerToAutoplayOffset(
        track,
        contentRef.current,
        virtualScrollLeftRef.current,
      );
    }

    startInteraction();
  }

  function handleTouchEnd() {
    const track = trackRef.current;

    if (track) {
      virtualScrollLeftRef.current = track.scrollLeft;
    }

    syncActivePageFromScroll();
    endInteraction();
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      return;
    }

    startInteraction();

    const track = trackRef.current;

    if (!track) {
      return;
    }

    isDragging.current = true;
    dragStartX.current = event.clientX;
    dragScrollLeft.current = track.scrollLeft;
    track.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isDragging.current) {
      return;
    }

    const track = trackRef.current;

    if (!track) {
      return;
    }

    const deltaX = event.clientX - dragStartX.current;
    track.scrollLeft = dragScrollLeft.current - deltaX;
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      return;
    }

    const track = trackRef.current;

    if (isDragging.current) {
      isDragging.current = false;

      if (track?.hasPointerCapture(event.pointerId)) {
        track.releasePointerCapture(event.pointerId);
      }
    }

    syncActivePageFromScroll();
    endInteraction();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (pageCount <= 1) {
      return;
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToPage(clampedActivePage + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPage(clampedActivePage - 1);
    }
  }

  if (packages.length === 0) {
    return null;
  }

  const cardWidth = layout?.cardWidth ?? 0;
  const cardGap = layout?.gap ?? CARD_GAP_MOBILE;

  return (
    <div
      className={cn("relative min-w-0", className)}
      onMouseEnter={() => {
        isHoverRef.current = true;
        applyPaused();
      }}
      onMouseLeave={() => {
        isHoverRef.current = false;
        applyPaused();
      }}
      onFocusCapture={() => {
        isFocusRef.current = true;
        applyPaused();
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          isFocusRef.current = false;
          applyPaused();
        }
      }}
    >
      <div
        ref={trackRef}
        className={cn(
          "mx-auto w-full max-w-6xl overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "cursor-grab active:cursor-grabbing lg:hidden",
        )}
        role="region"
        aria-roledescription="carousel"
        aria-label={ariaLabel}
        tabIndex={pageCount > 1 ? 0 : undefined}
        onScroll={syncActivePageFromScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onKeyDown={handleKeyDown}
      >
        <div
          ref={contentRef}
          className={cn(
            "flex w-max min-w-full items-stretch px-0.5 py-1",
            copies <= 1 ? "justify-center" : "justify-start",
          )}
          style={{ gap: `${cardGap}px` }}
        >
          {Array.from({ length: copies }, (_, copyIndex) => (
            <Fragment key={copyIndex}>
              {packages.map((pkg, packageIndex) => (
                <div
                  key={`${copyIndex}-${packageIndex}-${pkg.id}`}
                  ref={
                    copyIndex === 0
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
                  style={{ width: cardWidth > 0 ? `${cardWidth}px` : undefined }}
                  className={cn(
                    "flex shrink-0 items-stretch",
                    cardWidth === 0 && "invisible",
                  )}
                  aria-hidden={copyIndex !== 0}
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

      {showDots && copies > 1 && pageCount > 1 ? (
        <PackageCarouselDots
          pageCount={pageCount}
          activeIndex={clampedActivePage}
          onSelect={goToPage}
        />
      ) : null}

      {copies > 1 ? (
        <PackageCarouselScrollHint
          className={cn(
            scrollHintAlwaysVisible
              ? "mt-[0.525rem] text-[0.7725rem] sm:mt-[0.65625rem] md:mt-[0.7875rem]"
              : "mt-2 text-xs",
          )}
        />
      ) : null}
    </div>
  );
}