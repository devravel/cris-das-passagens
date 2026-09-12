"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/** Se a hidratação passar disso, o conteúdo já está na tela há tempo demais pra sumir e reaparecer. */
const HYDRATION_CUTOFF_MS = 5000;

let clientSnapshot: boolean | undefined;

/**
 * Decidido uma vez, na hidratação: em conexão fraca (Data Saver, 2G) ou
 * hidratação tardia, nada de animação — o conteúdo já visível ficaria piscando
 * e o JS de motion só atrasaria o resto. Em dev a hidratação é lenta por
 * natureza, então o corte de tempo só vale em produção.
 */
function getClientSnapshot() {
  if (clientSnapshot === undefined) {
    const connection = (
      navigator as Navigator & {
        connection?: { saveData?: boolean; effectiveType?: string };
      }
    ).connection;
    const weakNetwork =
      connection?.saveData === true ||
      connection?.effectiveType === "2g" ||
      connection?.effectiveType === "slow-2g";
    const hydratedLate =
      process.env.NODE_ENV === "production" &&
      performance.now() > HYDRATION_CUTOFF_MS;

    clientSnapshot = !weakNetwork && !hydratedLate;
  }

  return clientSnapshot;
}

function getServerSnapshot() {
  return false;
}

function subscribeReducedMotion(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  mediaQuery.addEventListener("change", onStoreChange);

  return () => {
    mediaQuery.removeEventListener("change", onStoreChange);
  };
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

/**
 * Keeps SSR/first paint visible and only enables motion after hydration.
 * Prevents blank hero/sections on slower mobile connections; on weak networks
 * (or late hydration) motion stays off entirely — see getClientSnapshot.
 */
export function useMotionReady() {
  const reduce = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const isClient = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const shouldAnimate = isClient && !reduce;

  return { shouldAnimate, reduce };
}
