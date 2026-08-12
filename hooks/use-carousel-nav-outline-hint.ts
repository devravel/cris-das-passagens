"use client";

import { useEffect, useState } from "react";

import { useInViewRef } from "@/hooks/use-in-view-ref";
import { useMotionReady } from "@/hooks/use-motion-ready";

/** Intervalo entre pulsos de descoberta. */
const HINT_INTERVAL_MS = 3500;
/** Atraso antes do primeiro pulso após montar/voltar a ter overflow. */
const HINT_INITIAL_DELAY_MS = 2400;
/** Duração alinhada ao keyframe CSS + stagger do botão direito. */
const HINT_ANIMATION_MS = 1500;

type UseCarouselNavOutlineHintOptions = {
  canScrollPrev: boolean;
  canScrollNext: boolean;
  getRoot: () => Element | null;
};

/**
 * Dispara pulsos periódicos de microinteração nos botões de navegação
 * que realmente permitem scroll, pausando fora da viewport / aba oculta
 * e respeitando prefers-reduced-motion.
 */
export function useCarouselNavOutlineHint({
  canScrollPrev,
  canScrollNext,
  getRoot,
}: UseCarouselNavOutlineHintOptions) {
  const { shouldAnimate } = useMotionReady();
  const hasOverflow = canScrollPrev || canScrollNext;
  const isInViewRef = useInViewRef(getRoot, [hasOverflow]);
  const [isPulsing, setIsPulsing] = useState(false);
  const [pulseKey, setPulseKey] = useState(0);

  useEffect(() => {
    if (!shouldAnimate || !hasOverflow) {
      setIsPulsing(false);
      return;
    }

    let pulseClearId = 0;
    let intervalId = 0;

    const triggerPulse = () => {
      if (!isInViewRef.current) return;
      if (document.visibilityState === "hidden") return;

      setPulseKey((key) => key + 1);
      setIsPulsing(true);
      window.clearTimeout(pulseClearId);
      pulseClearId = window.setTimeout(() => {
        setIsPulsing(false);
      }, HINT_ANIMATION_MS);
    };

    const initialDelayId = window.setTimeout(() => {
      triggerPulse();
      intervalId = window.setInterval(triggerPulse, HINT_INTERVAL_MS);
    }, HINT_INITIAL_DELAY_MS);

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setIsPulsing(false);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.clearTimeout(initialDelayId);
      window.clearInterval(intervalId);
      window.clearTimeout(pulseClearId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [shouldAnimate, hasOverflow, isInViewRef]);

  return {
    hintPrev: isPulsing && canScrollPrev,
    hintNext: isPulsing && canScrollNext,
    pulseKey,
  };
}
