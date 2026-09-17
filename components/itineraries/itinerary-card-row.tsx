"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { ItineraryCard, type ItineraryCardData } from "@/components/itineraries/itinerary-card";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { CarouselArrow } from "@/components/ui/carousel-arrow";
import { scrollRevealDefaults } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ItineraryCardRowProps = {
  itineraries: ItineraryCardData[];
  priorityCount?: number;
};

/** Largura do card (15.875rem) + gap-3 do mobile; a seta anda exatamente um card. */
const CARD_STEP_PX = 254 + 12;

/**
 * Até 767px: trilho horizontal com snap, o próximo card aparece pela metade,
 * setas só pro lado que ainda tem card. De 768px pra cima vira grid e empilha.
 */
export function ItineraryCardRow({ itineraries, priorityCount = 0 }: ItineraryCardRowProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScroll, setCanScroll] = useState({ left: false, right: false });

  const measure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const max = track.scrollWidth - track.clientWidth;
    setCanScroll({ left: track.scrollLeft > 4, right: track.scrollLeft < max - 4 });
  }, []);

  useEffect(() => {
    measure();
    const track = trackRef.current;
    if (!track) return;
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [measure, itineraries.length]);

  function step(direction: -1 | 1) {
    trackRef.current?.scrollBy({ left: direction * CARD_STEP_PX, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        onScroll={measure}
        className={cn(
          // Mobile: trilho que sangra até a borda da tela (o container tem px-4/px-6).
          "-mr-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pr-4 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] sm:-mr-6 sm:pr-6 [&::-webkit-scrollbar]:hidden",
          "md:mr-0 md:grid md:grid-cols-[repeat(auto-fill,15.875rem)] md:gap-6 md:overflow-visible md:pr-0",
        )}
      >
        {itineraries.map((itinerary, index) => (
          <div key={itinerary.slug} className="w-[15.875rem] shrink-0 snap-start">
            <ScrollReveal delay={index * scrollRevealDefaults.stagger}>
              <ItineraryCard itinerary={itinerary} priority={index < priorityCount} />
            </ScrollReveal>
          </div>
        ))}
      </div>

      <CarouselArrow
        side="left"
        visible={canScroll.left}
        onClick={() => step(-1)}
        ariaLabel="Roteiro anterior"
        className="absolute left-1 top-1/2 z-[2] -translate-y-1/2 md:hidden"
      />
      <CarouselArrow
        side="right"
        visible={canScroll.right}
        onClick={() => step(1)}
        ariaLabel="Próximo roteiro"
        className="absolute right-1 top-1/2 z-[2] -translate-y-1/2 md:hidden"
      />
    </div>
  );
}
