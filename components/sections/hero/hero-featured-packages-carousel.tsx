"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { PackageCarouselScrollHint } from "@/components/packages/package-carousel-scroll-hint";
import { PublicPackageCard } from "@/components/packages/public-package-card";
import { setHorizontalScrollPosition } from "@/lib/carousel-autoplay-scroll";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type HeroFeaturedPackagesCarouselProps = {
  packages: PublicPackage[];
  departureCity: string;
  className?: string;
};

const CARDS_PER_STEP = 3;
const CARD_GAP_MOBILE = 12;
const CARD_GAP_DESKTOP = 14;
/** Duas cópias bastam para o loop infinito (menos <Image> no DOM). */
const LOOP_COPIES = 2;
/** Abaixo disso, largura fixa como no marquee (não espreme 3 cards no track). */
const MARQUEE_WIDTH_MAX_VIEWPORT = 600;
const MARQUEE_CARD_MAX_PX = 220;
const MARQUEE_CARD_VW_RATIO = 0.78;

const navButtonClassName =
  "group absolute top-1/2 z-10 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-background/95 text-muted-foreground shadow-md backdrop-blur-sm transition-[transform,background-color,border-color,color,box-shadow] duration-200 ease-out hover:scale-[1.06] hover:border-brand/35 hover:bg-brand/5 hover:text-brand hover:shadow-[0_4px_14px_-6px_rgba(52,91,167,0.28)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:size-10";

const navIconClassName =
  "size-5 transition-colors duration-200 group-hover:text-brand motion-reduce:transition-none";

function getCardGap(viewportWidth: number): number {
  return viewportWidth >= 640 ? CARD_GAP_DESKTOP : CARD_GAP_MOBILE;
}

function resolveCardWidth(
  trackWidth: number,
  viewportWidth: number,
  gap: number,
): number {
  if (viewportWidth <= MARQUEE_WIDTH_MAX_VIEWPORT) {
    return Math.min(
      MARQUEE_CARD_MAX_PX,
      viewportWidth * MARQUEE_CARD_VW_RATIO,
    );
  }

  if (trackWidth <= 0) {
    return 0;
  }

  return Math.max(
    0,
    (trackWidth - gap * (CARDS_PER_STEP - 1)) / CARDS_PER_STEP,
  );
}

export function HeroFeaturedPackagesCarousel({
  packages,
  departureCity,
  className,
}: HeroFeaturedPackagesCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const firstCopyStartRef = useRef<HTMLDivElement | null>(null);
  const secondCopyStartRef = useRef<HTMLDivElement | null>(null);
  const loopSegmentRef = useRef(0);
  const cardWidthRef = useRef(0);
  const cardGapRef = useRef(CARD_GAP_MOBILE);
  const didInitScrollRef = useRef(false);
  const isJumpingRef = useRef(false);

  const [cardWidth, setCardWidth] = useState(0);
  const [cardGap, setCardGap] = useState(CARD_GAP_MOBILE);

  const useInfinite = packages.length > 1;
  const copyCount = useInfinite ? LOOP_COPIES : 1;

  const measure = useCallback(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const gap = getCardGap(window.innerWidth);
    const nextCardWidth = resolveCardWidth(
      track.clientWidth,
      window.innerWidth,
      gap,
    );

    cardGapRef.current = gap;
    cardWidthRef.current = nextCardWidth;
    setCardGap(gap);
    setCardWidth(nextCardWidth);

    if (!useInfinite || nextCardWidth <= 0) {
      loopSegmentRef.current = 0;
      return;
    }

    requestAnimationFrame(() => {
      const first = firstCopyStartRef.current;
      const second = secondCopyStartRef.current;

      if (!first || !second) {
        return;
      }

      const segment = second.offsetLeft - first.offsetLeft;
      loopSegmentRef.current = segment;

      if (!didInitScrollRef.current && segment > 0) {
        didInitScrollRef.current = true;
        isJumpingRef.current = true;
        setHorizontalScrollPosition(track, segment);
        requestAnimationFrame(() => {
          isJumpingRef.current = false;
        });
      }
    });
  }, [useInfinite]);

  useLayoutEffect(() => {
    didInitScrollRef.current = false;
    measure();
  }, [measure, packages.length]);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const observer = new ResizeObserver(() => {
      didInitScrollRef.current = false;
      measure();
    });
    observer.observe(track);
    window.addEventListener("resize", measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const normalizeLoop = useCallback(() => {
    const track = trackRef.current;
    const segment = loopSegmentRef.current;

    if (!track || !useInfinite || segment <= 0 || isJumpingRef.current) {
      return;
    }

    const left = track.scrollLeft;

    if (left < segment * 0.5) {
      isJumpingRef.current = true;
      setHorizontalScrollPosition(track, left + segment);
      requestAnimationFrame(() => {
        isJumpingRef.current = false;
      });
      return;
    }

    if (left >= segment * 1.5) {
      isJumpingRef.current = true;
      setHorizontalScrollPosition(track, left - segment);
      requestAnimationFrame(() => {
        isJumpingRef.current = false;
      });
    }
  }, [useInfinite]);

  const scrollByStep = useCallback((direction: -1 | 1) => {
    const track = trackRef.current;
    const width = cardWidthRef.current;
    const gap = cardGapRef.current;

    if (!track || width <= 0) {
      return;
    }

    track.scrollBy({
      left: direction * (width + gap) * CARDS_PER_STEP,
      behavior: "smooth",
    });
  }, []);

  if (packages.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative min-w-0", className)}>
      <div className="relative min-w-0">
        <button
          type="button"
          className={cn(navButtonClassName, "left-1 sm:left-2")}
          onClick={() => scrollByStep(-1)}
          disabled={!useInfinite}
          aria-label="Ver pacotes anteriores"
        >
          <ChevronLeft className={navIconClassName} aria-hidden />
        </button>

        <div
          ref={trackRef}
          className="min-w-0 touch-pan-x overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="region"
          aria-roledescription="carousel"
          aria-label="Pacotes em destaque"
          onScroll={normalizeLoop}
        >
          <div
            className={cn(
              "flex w-max items-stretch px-0.5 py-1",
              !useInfinite && "min-w-full justify-center",
            )}
            style={{ gap: `${cardGap}px` }}
          >
            {Array.from({ length: copyCount }, (_, copyIndex) => (
              <Fragment key={copyIndex}>
                {packages.map((pkg, packageIndex) => (
                  <div
                    key={`${copyIndex}-${pkg.id}`}
                    ref={
                      packageIndex === 0
                        ? (element) => {
                            if (copyIndex === 0) {
                              firstCopyStartRef.current = element;
                            }

                            if (copyIndex === 1) {
                              secondCopyStartRef.current = element;
                            }
                          }
                        : undefined
                    }
                    style={{
                      width: cardWidth > 0 ? `${cardWidth}px` : undefined,
                    }}
                    className={cn(
                      "flex shrink-0 items-stretch",
                      cardWidth === 0 && "invisible",
                    )}
                    aria-hidden={useInfinite && copyIndex !== 1}
                  >
                    <PublicPackageCard
                      pkg={pkg}
                      departureCity={departureCity}
                      layout="carousel"
                      variant="landing"
                      size="compact"
                      narrowMobileTypography
                      priority={
                        copyIndex === (useInfinite ? 1 : 0) && packageIndex < 2
                      }
                      className="h-full min-w-0"
                    />
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>

        <button
          type="button"
          className={cn(navButtonClassName, "right-1 sm:right-2")}
          onClick={() => scrollByStep(1)}
          disabled={!useInfinite}
          aria-label="Ver próximos pacotes"
        >
          <ChevronRight className={navIconClassName} aria-hidden />
        </button>
      </div>

      <PackageCarouselScrollHint className="mt-[0.525rem] text-center text-[0.7725rem] sm:mt-[0.65625rem] md:mt-[0.7875rem]" />
    </div>
  );
}
