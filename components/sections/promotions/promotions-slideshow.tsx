"use client";

import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { BlogImage } from "@/components/blog/blog-image";
import { cardShadowClassName } from "@/lib/card-styles";
import { isCoarsePointerDevice } from "@/lib/carousel-autoplay-scroll";
import type { PublicPromotion } from "@/lib/promotion/queries";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 5500;
const SWIPE_THRESHOLD_PX = 48;

type PromotionsSlideshowProps = {
  promotions: PublicPromotion[];
};

function getWrappedIndex(index: number, length: number) {
  if (length === 0) {
    return 0;
  }

  return (index + length) % length;
}

const carouselArrowClassName =
  "absolute top-1/2 z-30 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-brand-navy/45 text-white backdrop-blur-sm transition-[transform,background-color] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 hover:scale-110 hover:bg-brand-navy/75 motion-reduce:transition-none motion-reduce:hover:scale-100 sm:size-11";

const carouselArrowInactiveClassName = "opacity-40";

function PromotionSlide({
  promotion,
  isActive,
  priority,
  onExpand,
}: {
  promotion: PublicPromotion;
  isActive: boolean;
  priority: boolean;
  onExpand: () => void;
}) {
  const alt = promotion.title ?? "Promoção Cris das Passagens";

  const slideContent = (
    <>
      <BlogImage
        src={promotion.image}
        alt={alt}
        fill
        priority={priority}
        sizes="(max-width: 672px) 100vw, 672px"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        containerClassName="absolute inset-0"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-navy/55 via-brand-navy/10 to-transparent"
      />
      {promotion.title ? (
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-8">
          <p className="max-w-xl font-heading text-lg font-semibold tracking-tight text-white sm:text-xl lg:text-2xl">
            {promotion.title}
          </p>
        </div>
      ) : null}
    </>
  );

  const slideClassName = cn(
    "absolute inset-0 transition-opacity duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
    isActive
      ? "z-10 cursor-pointer opacity-100"
      : "pointer-events-none z-0 opacity-0",
  );

  const expandLabel = promotion.title
    ? `Expandir promoção: ${promotion.title}`
    : "Expandir promoção";

  return (
    <button
      type="button"
      onClick={onExpand}
      className={cn(
        slideClassName,
        "block w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      )}
      aria-hidden={!isActive}
      tabIndex={isActive ? 0 : -1}
      aria-label={expandLabel}
    >
      {slideContent}
    </button>
  );
}

function CarouselDots({
  promotions,
  activeIndex,
  hasMultiple,
  onSelect,
  className,
}: {
  promotions: PublicPromotion[];
  activeIndex: number;
  hasMultiple: boolean;
  onSelect: (index: number) => void;
  className?: string;
}) {
  return (
    <div
      className={cn("flex items-center justify-center gap-2", className)}
      role="tablist"
      aria-label="Selecionar promoção"
    >
      {promotions.map((promotion, index) => {
        const isActive = index === activeIndex;

        return (
          <button
            key={promotion.id}
            type="button"
            role="tab"
            disabled={!hasMultiple}
            aria-selected={isActive}
            aria-disabled={!hasMultiple}
            aria-label={
              promotion.title
                ? `Ver promoção: ${promotion.title}`
                : `Ver promoção ${index + 1}`
            }
            className={cn(
              "h-2 rounded-full transition-all duration-300 motion-reduce:transition-none",
              isActive ? "w-7 bg-brand" : "w-2 bg-border",
              hasMultiple ? "hover:bg-brand/40" : "cursor-default opacity-70",
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

function CarouselArrows({
  hasMultiple,
  onPrev,
  onNext,
}: {
  hasMultiple: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <>
      <button
        type="button"
        aria-disabled={!hasMultiple}
        className={cn(
          carouselArrowClassName,
          "left-2 sm:left-3",
          !hasMultiple && carouselArrowInactiveClassName,
        )}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (hasMultiple) {
            onPrev();
          }
        }}
        aria-label="Promoção anterior"
      >
        <ChevronLeft className="size-5 sm:size-6" aria-hidden />
      </button>
      <button
        type="button"
        aria-disabled={!hasMultiple}
        className={cn(
          carouselArrowClassName,
          "right-2 sm:right-3",
          !hasMultiple && carouselArrowInactiveClassName,
        )}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (hasMultiple) {
            onNext();
          }
        }}
        aria-label="Próxima promoção"
      >
        <ChevronRight className="size-5 sm:size-6" aria-hidden />
      </button>
    </>
  );
}

export function PromotionsSlideshow({ promotions }: PromotionsSlideshowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const pauseForHoverFocusRef = useRef(!isCoarsePointerDevice());
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const didSwipeRef = useRef(false);
  const count = promotions.length;
  const hasMultiple = count > 1;
  const currentPromotion = promotions[activeIndex];

  const goTo = useCallback(
    (index: number) => {
      if (!hasMultiple) {
        return;
      }

      setActiveIndex(getWrappedIndex(index, count));
    },
    [count, hasMultiple],
  );

  const goNext = useCallback(() => {
    if (!hasMultiple) {
      return;
    }

    goTo(activeIndex + 1);
  }, [activeIndex, goTo, hasMultiple]);

  const goPrev = useCallback(() => {
    if (!hasMultiple) {
      return;
    }

    goTo(activeIndex - 1);
  }, [activeIndex, goTo, hasMultiple]);

  const openLightbox = useCallback(() => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }

    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  useEffect(() => {
    if (!hasMultiple || isPaused || isLightboxOpen) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => getWrappedIndex(current + 1, count));
    }, AUTOPLAY_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [count, hasMultiple, isLightboxOpen, isPaused]);

  useEffect(() => {
    function handleVisibilityChange() {
      setIsPaused(document.hidden);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (hasMultiple && event.key === "ArrowLeft") {
        goPrev();
      }

      if (hasMultiple && event.key === "ArrowRight") {
        goNext();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeLightbox, goNext, goPrev, hasMultiple, isLightboxOpen]);

  function handleTouchStart(event: TouchEvent<HTMLElement>) {
    const touch = event.touches[0];

    if (!touch) {
      return;
    }

    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    didSwipeRef.current = false;
  }

  function handleTouchEnd(event: TouchEvent<HTMLElement>) {
    if (touchStartX.current === null || touchStartY.current === null || !hasMultiple) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    const touch = event.changedTouches[0];

    if (!touch) {
      touchStartX.current = null;
      touchStartY.current = null;
      return;
    }

    const deltaX = touchStartX.current - touch.clientX;
    const deltaY = touchStartY.current - touch.clientY;

    if (
      Math.abs(deltaX) >= SWIPE_THRESHOLD_PX &&
      Math.abs(deltaX) > Math.abs(deltaY)
    ) {
      didSwipeRef.current = true;

      if (deltaX > 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
  }

  return (
    <>
      <div
        className="relative mx-auto w-full"
        role="region"
        aria-roledescription="carousel"
        aria-label="Promoções em destaque"
        onMouseEnter={() => {
          if (pauseForHoverFocusRef.current) {
            setIsPaused(true);
          }
        }}
        onMouseLeave={() => {
          if (pauseForHoverFocusRef.current) {
            setIsPaused(false);
          }
        }}
        onFocusCapture={() => {
          if (pauseForHoverFocusRef.current) {
            setIsPaused(true);
          }
        }}
        onBlurCapture={(event) => {
          if (
            pauseForHoverFocusRef.current &&
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            setIsPaused(false);
          }
        }}
      >
        <div
          className={cn(
            "group relative overflow-hidden rounded-2xl bg-muted/30 ring-1 ring-border/60 sm:rounded-3xl",
            cardShadowClassName,
            "aspect-[4/3] touch-pan-y sm:aspect-[16/9] lg:aspect-[21/9]",
          )}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {promotions.map((promotion, index) => (
            <PromotionSlide
              key={promotion.id}
              promotion={promotion}
              isActive={index === activeIndex}
              priority={index === 0}
              onExpand={openLightbox}
            />
          ))}

          <CarouselArrows
            hasMultiple={hasMultiple}
            onPrev={goPrev}
            onNext={goNext}
          />
        </div>

        <CarouselDots
          promotions={promotions}
          activeIndex={activeIndex}
          hasMultiple={hasMultiple}
          onSelect={goTo}
          className="mt-4"
        />

        <p className="sr-only" aria-live="polite" aria-atomic="true">
          Promoção {activeIndex + 1} de {count}
          {currentPromotion?.title ? `: ${currentPromotion.title}` : ""}
        </p>
      </div>

      {isLightboxOpen && currentPromotion ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-brand-navy/80 p-4 backdrop-blur-sm supports-[padding:max(0px)]:p-[max(1rem,env(safe-area-inset-top))_max(1rem,env(safe-area-inset-right))_max(1rem,env(safe-area-inset-bottom))_max(1rem,env(safe-area-inset-left))] sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="promotion-lightbox-title"
          onClick={closeLightbox}
        >
          <div
            className="flex w-full max-w-4xl flex-col items-center gap-3 sm:gap-4"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative w-full overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/15 sm:rounded-3xl">
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeLightbox}
                className="absolute top-3 right-3 z-30 flex size-10 items-center justify-center rounded-full bg-background/95 text-foreground shadow-md transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
                aria-label="Fechar promoção ampliada"
              >
                <X className="size-5" aria-hidden />
              </button>

              <div className="relative aspect-[4/3] w-full max-h-[min(72dvh,720px)] sm:aspect-video">
                <BlogImage
                  src={currentPromotion.image}
                  alt={currentPromotion.title ?? "Promoção Cris das Passagens"}
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 900px"
                  className="object-cover"
                  containerClassName="absolute inset-0 bg-black"
                />
              </div>

              <CarouselArrows
                hasMultiple={hasMultiple}
                onPrev={goPrev}
                onNext={goNext}
              />
            </div>

            {currentPromotion.title ? (
              <p
                id="promotion-lightbox-title"
                className="max-w-4xl px-2 text-center font-heading text-base font-semibold tracking-tight text-white sm:text-lg"
              >
                {currentPromotion.title}
              </p>
            ) : (
              <p id="promotion-lightbox-title" className="sr-only">
                Promoção ampliada
              </p>
            )}

            <CarouselDots
              promotions={promotions}
              activeIndex={activeIndex}
              hasMultiple={hasMultiple}
              onSelect={goTo}
            />

            <p className="text-sm text-white/80" aria-hidden>
              {activeIndex + 1} / {count}
            </p>

            {currentPromotion.link ? (
              <a
                href={currentPromotion.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl bg-brand px-4 py-2.5 text-sm font-semibold text-brand-foreground shadow-md transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
              >
                Ver promoção
              </a>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
