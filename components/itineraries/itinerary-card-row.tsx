"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ItineraryCard, type ItineraryCardData } from "@/components/itineraries/itinerary-card";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { scrollRevealDefaults } from "@/lib/motion";
import { cn } from "@/lib/utils";

type ItineraryCardRowProps = {
  itineraries: ItineraryCardData[];
  priorityCount?: number;
};

/** Largura do card (16.375rem) + gap-3; a seta anda exatamente um card. */
const CARD_STEP_PX = 262 + 12;

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
          "md:mr-0 md:grid md:grid-cols-[repeat(auto-fill,16.375rem)] md:overflow-visible md:pr-0",
        )}
      >
        {itineraries.map((itinerary, index) => (
          <div key={itinerary.slug} className="w-[16.375rem] shrink-0 snap-start">
            <ScrollReveal delay={index * scrollRevealDefaults.stagger}>
              <ItineraryCard itinerary={itinerary} priority={index < priorityCount} />
            </ScrollReveal>
          </div>
        ))}
      </div>

      <RowArrow side="left" visible={canScroll.left} onClick={() => step(-1)} />
      <RowArrow side="right" visible={canScroll.right} onClick={() => step(1)} />
    </div>
  );
}

function RowArrow({
  side,
  visible,
  onClick,
}: {
  side: "left" | "right";
  visible: boolean;
  onClick: () => void;
}) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Roteiro anterior" : "Próximo roteiro"}
      hidden={!visible}
      className={cn(
        "absolute top-1/2 z-[2] -translate-y-1/2 text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)] outline-none transition-opacity focus-visible:opacity-70 md:hidden",
        side === "left" ? "left-1 animate-[nudge-left_1.4s_ease-in-out_infinite]" : "right-1 animate-[nudge-right_1.4s_ease-in-out_infinite]",
      )}
    >
      <Icon className="size-11" strokeWidth={2.75} aria-hidden />
    </button>
  );
}
