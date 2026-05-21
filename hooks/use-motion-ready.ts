"use client";

import { useSyncExternalStore } from "react";
import { useReducedMotion } from "framer-motion";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

/**
 * Keeps SSR/first paint visible and only enables motion after hydration.
 * Prevents blank hero/sections on slower mobile connections.
 */
export function useMotionReady() {
  const reduce = useReducedMotion();
  const isClient = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );
  const shouldAnimate = isClient && !reduce;

  return { shouldAnimate, reduce };
}
