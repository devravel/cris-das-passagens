"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export type ElfsightWidgetStatus = "pending" | "loaded" | "failed";

const ELFSIGHT_LOAD_TIMEOUT_MS = 10_000;
/* Um widget de avaliações de verdade passa fácil disso; erro de plano/limite
   injeta só um bloco pequeno (ou nada) e não conta como carregado. */
const ELFSIGHT_MIN_HEIGHT_PX = 200;

function hasElfsightContent(container: HTMLElement): boolean {
  return container.children.length > 0 && container.offsetHeight >= ELFSIGHT_MIN_HEIGHT_PX;
}

type UseElfsightWidgetOptions = {
  containerRef: RefObject<HTMLElement | null>;
  scriptReady: boolean;
  enabled: boolean;
};

export function useElfsightWidget({
  containerRef,
  scriptReady,
  enabled,
}: UseElfsightWidgetOptions): ElfsightWidgetStatus {
  const [status, setStatus] = useState<ElfsightWidgetStatus>("pending");
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !scriptReady) {
      return;
    }

    resolvedRef.current = false;

    const container = containerRef.current;

    if (!container) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const markLoaded = () => {
      if (resolvedRef.current) {
        return;
      }

      resolvedRef.current = true;
      setStatus("loaded");

      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      observer.disconnect();
    };

    const markFailed = () => {
      if (resolvedRef.current) {
        return;
      }

      resolvedRef.current = true;
      setStatus("failed");
      observer.disconnect();
    };

    const observer = new MutationObserver(() => {
      if (hasElfsightContent(container)) {
        markLoaded();
      }
    });

    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    if (hasElfsightContent(container)) {
      markLoaded();
      return () => observer.disconnect();
    }

    timeoutId = setTimeout(() => {
      if (!hasElfsightContent(container)) {
        markFailed();
      } else {
        markLoaded();
      }
    }, ELFSIGHT_LOAD_TIMEOUT_MS);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      observer.disconnect();
    };
  }, [containerRef, enabled, scriptReady]);

  if (!enabled) {
    return "failed";
  }

  return status;
}
