"use client";

import { useLayoutEffect } from "react";
import { useAnimation } from "framer-motion";

import { useMotionReady } from "@/hooks/use-motion-ready";
import { motionEase } from "@/lib/motion";

/** If hydration takes longer than this, skip entrance to avoid a visible flash. */
const ENTRANCE_CUTOFF_MS = 2000;

type EntranceMotionOptions = {
  y?: number;
  duration?: number;
};

/**
 * SSR-safe entrance animation: content stays visible in HTML, then animates in
 * after hydration via layout effect (before the next paint).
 * On slow connections, animation is skipped so content stays as-is.
 */
export function useEntranceMotion(
  delay = 0,
  { y = 14, duration = 0.55 }: EntranceMotionOptions = {}
) {
  const controls = useAnimation();
  const { shouldAnimate } = useMotionReady();

  useLayoutEffect(() => {
    if (!shouldAnimate) return;

    const hydratedLate = performance.now() > ENTRANCE_CUTOFF_MS;
    if (hydratedLate) return;

    controls.set({ opacity: 0, y });
    void controls.start({
      opacity: 1,
      y: 0,
      transition: { duration, ease: motionEase, delay },
    });
  }, [shouldAnimate, controls, delay, y, duration]);

  if (!shouldAnimate) {
    return { initial: false as const };
  }

  return {
    initial: false as const,
    animate: controls,
  };
}
