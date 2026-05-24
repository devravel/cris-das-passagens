"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useMotionReady } from "@/hooks/use-motion-ready";
import { cardShadowClassName } from "@/lib/card-styles";
import type { PublicPromotion } from "@/lib/promotion/queries";
import { cn } from "@/lib/utils";

const AUTOPLAY_MS = 5500;
const SWIPE_THRESHOLD_PX = 48;

type PromotionsSlideshowProps = {
  promotions: PublicPromotion[];
};

function PromotionSlide({
  promotion,
  isActive,
  priority,
}: {
  promotion: PublicPromotion;
  isActive: boolean;
  priority: boolean;
}) {
  const alt = promotion.title ?? "Promocao Cris das Passagens";

  const image = (
    <Image
      src={promotion.image}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 1200px"
      className="object-cover"
    />
  );

  const slideContent = (
    <>
      {image}
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
    isActive ? "z-10 opacity-100" : "z-0 opacity-0",
  );

  if (promotion.link) {
    return (
      <a
        href={promotion.link}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(slideClassName, "block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background")}
        aria-hidden={!isActive}
        tabIndex={isActive ? 0 : -1}
      >
        {slideContent}
      </a>
    );
  }

  return (
    <div className={slideClassName} aria-hidden={!isActive}>
      {slideContent}
    </div>
  );
}

export function PromotionsSlideshow({ promotions }: PromotionsSlideshowProps) {
  const { shouldAnimate } = useMotionReady();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const count = promotions.length;
  const hasMultiple = count > 1;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(((index % count) + count) % count);
    },
    [count],
  );

  const goNext = useCallback(() => {
    goTo(activeIndex + 1);
  }, [activeIndex, goTo]);

  const goPrev = useCallback(() => {
    goTo(activeIndex - 1);
  }, [activeIndex, goTo]);

  useEffect(() => {
    if (!hasMultiple || !shouldAnimate || isPaused) {
      return;
    }

    const timer = window.setInterval(goNext, AUTOPLAY_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [hasMultiple, shouldAnimate, isPaused, goNext]);

  useEffect(() => {
    function handleVisibilityChange() {
      setIsPaused(document.hidden);
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  function handleTouchStart(clientX: number) {
    touchStartX.current = clientX;
  }

  function handleTouchEnd(clientX: number) {
    if (touchStartX.current === null || !hasMultiple) {
      return;
    }

    const delta = touchStartX.current - clientX;

    if (Math.abs(delta) >= SWIPE_THRESHOLD_PX) {
      if (delta > 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    touchStartX.current = null;
  }

  return (
    <div
      className="relative mx-auto w-full max-w-6xl"
      role="region"
      aria-roledescription="carousel"
      aria-label="Promocoes em destaque"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsPaused(false);
        }
      }}
      onTouchStart={(event) => handleTouchStart(event.changedTouches[0]?.clientX ?? 0)}
      onTouchEnd={(event) => handleTouchEnd(event.changedTouches[0]?.clientX ?? 0)}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-muted/30 ring-1 ring-border/60 sm:rounded-3xl",
          cardShadowClassName,
          "aspect-[4/3] sm:aspect-[16/9] lg:aspect-[21/9]",
        )}
      >
        {promotions.map((promotion, index) => (
          <PromotionSlide
            key={promotion.id}
            promotion={promotion}
            isActive={index === activeIndex}
            priority={index === 0}
          />
        ))}

        {hasMultiple && shouldAnimate ? (
          <>
            <button
              type="button"
              className="absolute top-1/2 left-3 z-20 hidden -translate-y-1/2 rounded-full border border-white/20 bg-brand-navy/45 p-2 text-white backdrop-blur-sm transition-colors hover:bg-brand-navy/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:inline-flex"
              onClick={goPrev}
              aria-label="Promocao anterior"
            >
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button
              type="button"
              className="absolute top-1/2 right-3 z-20 hidden -translate-y-1/2 rounded-full border border-white/20 bg-brand-navy/45 p-2 text-white backdrop-blur-sm transition-colors hover:bg-brand-navy/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:inline-flex"
              onClick={goNext}
              aria-label="Proxima promocao"
            >
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        ) : null}
      </div>

      {hasMultiple ? (
        <div
          className="mt-4 flex items-center justify-center gap-2"
          role="tablist"
          aria-label="Selecionar promocao"
        >
          {promotions.map((promotion, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={promotion.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={
                  promotion.title
                    ? `Ver promocao: ${promotion.title}`
                    : `Ver promocao ${index + 1}`
                }
                className={cn(
                  "h-2 rounded-full transition-all duration-300 motion-reduce:transition-none",
                  isActive
                    ? "w-7 bg-brand"
                    : "w-2 bg-border hover:bg-brand/40",
                )}
                onClick={() => goTo(index)}
              />
            );
          })}
        </div>
      ) : null}

      {hasMultiple ? (
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          Promocao {activeIndex + 1} de {count}
          {promotions[activeIndex]?.title ? `: ${promotions[activeIndex]?.title}` : ""}
        </p>
      ) : null}
    </div>
  );
}
