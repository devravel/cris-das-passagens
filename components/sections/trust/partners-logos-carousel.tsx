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

import {
  partnerLogoGapClassName,
  PartnerLogoImage,
  type PartnerLogoEntry,
} from "@/components/sections/trust/partners-logo-shared";
import {
  applyAutoplayScrollOffset,
  isCoarsePointerDevice,
  readAutoplayScrollOffset,
  syncScrollerToAutoplayOffset,
} from "@/lib/carousel-autoplay-scroll";
import { cn } from "@/lib/utils";

/** ~36px/s — fluxo horizontal lento, contínuo e sem saltos. */
const AUTOPLAY_SPEED_PX_PER_MS = 0.036;
/** Destrava pausa presa no Safari iOS (ex.: touchcancel sem touchend). */
const PAUSE_RECOVERY_MS = 2500;
/** Janela curta em que o autoplay não avança durante um scroll suave por clique no dot. */
const PROGRAMMATIC_SCROLL_MS = 550;
/** Limite de cópias renderizadas para o loop infinito. */
const MAX_COPIES = 8;
/** Tentativas de remedição quando layout/overflow ainda não está pronto (Safari iOS). */
const MAX_MEASURE_RETRIES = 12;

function PartnerCarouselDots({
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
      aria-label="Navegar parceiros"
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
            aria-label={`Ver grupo de parceiros ${index + 1} de ${pageCount}`}
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

export function PartnersLogosCarousel({
  logos,
}: {
  logos: readonly PartnerLogoEntry[];
}) {
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
  const measureRetriesRef = useRef(0);
  const measureLayoutRef = useRef<() => void>(() => undefined);
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
      if (measureRetriesRef.current < MAX_MEASURE_RETRIES) {
        measureRetriesRef.current += 1;
        requestAnimationFrame(() => {
          measureLayoutRef.current();
        });
      }

      return;
    }

    const viewport = track.clientWidth;
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

    const hasScrollOverflow = track.scrollWidth > track.clientWidth + 1;

    if (
      !reduceMotionRef.current &&
      nextCopies > 1 &&
      loopSegment > 0 &&
      !hasScrollOverflow &&
      measureRetriesRef.current < MAX_MEASURE_RETRIES
    ) {
      measureRetriesRef.current += 1;
      requestAnimationFrame(() => {
        measureLayoutRef.current();
      });
      return;
    }

    measureRetriesRef.current = 0;
  }, [syncActivePageFromScroll]);

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
    const offsetInLoop = ((track.scrollLeft % loop) + loop) % loop;
    const cycleBase = track.scrollLeft - offsetInLoop;
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

  useLayoutEffect(() => {
    measureLayoutRef.current = measureLayout;
  }, [measureLayout]);

  useLayoutEffect(() => {
    pauseForHoverFocusRef.current = !isCoarsePointerDevice();
  }, []);

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

  // Mede o layout no mount e sempre que o conteúdo/cópias mudarem.
  useLayoutEffect(() => {
    measureLayout();
  }, [logos, copies, reduceMotion, measureLayout]);

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
    if (reduceMotion || logos.length === 0) {
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
        let next = track.scrollLeft + AUTOPLAY_SPEED_PX_PER_MS * deltaMs;

        while (next >= loop) {
          next -= loop;
        }

        virtualScrollLeftRef.current = next;
        applyAutoplayScrollOffset(track, contentRef.current, next);
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
  }, [reduceMotion, logos.length, syncActivePageFromScroll]);

  // Safety net: destrava isInteractingRef preso após gestos cancelados no Safari iOS.
  useEffect(() => {
    if (!isPaused || reduceMotion || logos.length === 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      if (isInteractingRef.current) {
        isInteractingRef.current = false;
      }

      isHoverRef.current = false;
      isFocusRef.current = false;

      applyPaused();
    }, PAUSE_RECOVERY_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isPaused, reduceMotion, logos.length, applyPaused]);

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

  function handleTouchCancel() {
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

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") {
      syncActivePageFromScroll();
      endInteraction();
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

  return (
    <div
      className="lg:hidden"
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
          "mx-auto w-full max-w-6xl touch-pan-x overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "cursor-grab active:cursor-grabbing",
        )}
        role="region"
        aria-roledescription="carousel"
        aria-label="Empresas parceiras"
        tabIndex={pageCount > 1 ? 0 : undefined}
        onScroll={syncActivePageFromScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchCancel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onKeyDown={handleKeyDown}
      >
        <div
          ref={contentRef}
          className={cn(
            "flex w-max min-w-full items-center",
            partnerLogoGapClassName,
            copies <= 1 ? "justify-center" : "justify-start",
          )}
        >
          {Array.from({ length: copies }, (_, copyIndex) => (
            <Fragment key={copyIndex}>
              {logos.map((logo, logoIndex) => (
                <div
                  key={`${copyIndex}-${logoIndex}-${logo.src}`}
                  ref={
                    copyIndex === 0
                      ? (element) => {
                          if (logoIndex === 0) {
                            firstItemRef.current = element;
                          }

                          if (logoIndex === logos.length - 1) {
                            lastItemRef.current = element;
                          }
                        }
                      : undefined
                  }
                  className="flex shrink-0 items-center justify-center"
                  aria-hidden={copyIndex !== 0}
                >
                  <PartnerLogoImage logo={logo} />
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>

      {pageCount > 0 ? (
        <PartnerCarouselDots
          pageCount={pageCount}
          activeIndex={clampedActivePage}
          onSelect={goToPage}
        />
      ) : null}
    </div>
  );
}
