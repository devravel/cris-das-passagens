"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { PublicPackageCard } from "@/components/packages/public-package-card";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

/** ~14.4px/s — mesmo fluxo horizontal lento do mobile. */
const AUTOPLAY_SPEED_PX_PER_MS = 0.0144;
/** Limite de cópias renderizadas para o loop infinito. */
const MAX_COPIES = 8;

const CARD_GAP_DESKTOP = 14;
/** Largura mínima confortável para cards compactos (landing) em desktop. */
const LANDING_MIN_CARD_WIDTH = 160;
/** Largura mínima confortável para cards detalhados (listing) em desktop. */
const LISTING_MIN_CARD_WIDTH = 240;

type PackageCardsCarouselAutoplayDesktopProps = {
  packages: PublicPackage[];
  departureCity: string;
  className?: string;
  variant?: "landing" | "listing";
  showChecklist?: boolean;
  cardClassName?: string;
};

type CarouselLayout = {
  cardWidth: number;
  gap: number;
};

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
  const maxCards =
    variant === "listing" ? (viewportWidth >= 1280 ? 4 : 3) : 3;
  const minCardWidth =
    variant === "landing" ? LANDING_MIN_CARD_WIDTH : LISTING_MIN_CARD_WIDTH;

  return resolveCardsPerView(trackWidth, CARD_GAP_DESKTOP, maxCards, minCardWidth);
}

function computeCarouselLayout(
  trackWidth: number,
  viewportWidth: number,
  variant: "landing" | "listing",
): CarouselLayout {
  const cardsPerView = getCardsPerView(trackWidth, viewportWidth, variant);
  const totalGap = CARD_GAP_DESKTOP * Math.max(cardsPerView - 1, 0);
  const cardWidth = trackWidth > 0 ? Math.max(0, (trackWidth - totalGap) / cardsPerView) : 0;

  return { cardWidth, gap: CARD_GAP_DESKTOP };
}

export function PackageCardsCarouselAutoplayDesktop({
  packages,
  departureCity,
  className,
  variant = "landing",
  showChecklist = false,
  cardClassName,
}: PackageCardsCarouselAutoplayDesktopProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLUListElement>(null);
  const firstItemRef = useRef<HTMLLIElement | null>(null);
  const lastItemRef = useRef<HTMLLIElement | null>(null);

  // Estado que afeta render.
  const [needsAutoplay, setNeedsAutoplay] = useState(false);
  const [copies, setCopies] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [layout, setLayout] = useState<CarouselLayout | null>(null);

  // Medições e flags vivem em refs.
  const loopSegmentRef = useRef(0);
  const oneCopyWidthRef = useRef(0);
  const reduceMotionRef = useRef(false);

  const isPausedRef = useRef(false);
  const isHoverRef = useRef(false);
  const isFocusRef = useRef(false);

  const rafRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);

  const applyPaused = useCallback(() => {
    const paused =
      isHoverRef.current ||
      isFocusRef.current ||
      (typeof document !== "undefined" && document.hidden);

    isPausedRef.current = paused;
    setIsPaused((current) => (current === paused ? current : paused));
  }, []);

  const measureLayout = useCallback(() => {
    const container = containerRef.current;
    const content = contentRef.current;
    const first = firstItemRef.current;
    const last = lastItemRef.current;

    if (!container || !content || !first || !last) {
      return;
    }

    const containerWidth = container.clientWidth;
    const viewportWidth = window.innerWidth;
    
    // Calcula layout dos cards
    const nextLayout = computeCarouselLayout(
      containerWidth,
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

    // Verifica se precisa de autoplay: conteúdo não cabe no container.
    const needsScroll = oneCopyWidth > containerWidth;
    setNeedsAutoplay((current) => (current === needsScroll ? current : needsScroll));

    // Cópias para loop infinito apenas se precisar de autoplay.
    let nextCopies = 1;

    if (!reduceMotionRef.current && needsScroll && loopSegment > 0 && containerWidth > 0) {
      nextCopies = Math.min(
        MAX_COPIES,
        Math.max(2, 1 + Math.ceil((containerWidth + gap) / loopSegment)),
      );
    }

    setCopies((current) => (current === nextCopies ? current : nextCopies));
  }, [variant]);

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

  // Mede o layout no mount e sempre que o conteúdo/cópias mudarem.
  useLayoutEffect(() => {
    measureLayout();
  }, [packages, copies, reduceMotion, measureLayout]);

  // Recalcula quando o container ou o conteúdo mudam de tamanho.
  useEffect(() => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) {
      return;
    }

    const observer = new ResizeObserver(() => {
      measureLayout();
    });

    observer.observe(container);
    observer.observe(content);
    window.addEventListener("resize", measureLayout);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureLayout);
    };
  }, [measureLayout]);

  // Loop de animação: fluxo horizontal constante via scrollLeft (apenas se needsAutoplay).
  useEffect(() => {
    if (!needsAutoplay || reduceMotion || isPaused || packages.length === 0) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      lastFrameTimeRef.current = null;
      return;
    }

    const tick = (timestamp: number) => {
      const container = containerRef.current;

      if (!container || isPausedRef.current || document.hidden) {
        lastFrameTimeRef.current = null;
        rafRef.current = null;
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

      let next = container.scrollLeft + AUTOPLAY_SPEED_PX_PER_MS * deltaMs;

      while (next >= loop) {
        next -= loop;
      }

      container.scrollLeft = next;
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
  }, [needsAutoplay, isPaused, reduceMotion, packages.length]);

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

  if (packages.length === 0) {
    return null;
  }

  const cardWidth = layout?.cardWidth ?? 0;
  const cardGap = layout?.gap ?? CARD_GAP_DESKTOP;

  return (
    <div
      className={cn("mx-auto hidden w-full max-w-6xl lg:block", className)}
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
        ref={containerRef}
        className={cn(
          needsAutoplay
            ? "overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            : "overflow-hidden",
        )}
      >
        <ul
          ref={contentRef}
          className={cn(
            "flex w-max items-stretch px-0.5 py-1",
            needsAutoplay ? "justify-start" : "min-w-full justify-center",
          )}
          style={{ gap: `${cardGap}px` }}
        >
          {Array.from({ length: copies }, (_, copyIndex) => (
            <Fragment key={copyIndex}>
              {packages.map((pkg, packageIndex) => (
                <li
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
                </li>
              ))}
            </Fragment>
          ))}
        </ul>
      </div>
    </div>
  );
}