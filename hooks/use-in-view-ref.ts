"use client";

import { useEffect, useRef } from "react";

type UseInViewRefOptions = {
  rootMargin?: string;
  threshold?: number;
};

/**
 * Ref booleano que indica se o elemento está visível no viewport.
 * Usado por carrosséis para pausar autoplay fora da tela sem re-renders.
 */
export function useInViewRef(
  getElement: () => Element | null,
  deps: readonly unknown[] = [],
  { rootMargin = "0px 0px 8% 0px", threshold = 0 }: UseInViewRefOptions = {},
) {
  const isInViewRef = useRef(true);
  const getElementRef = useRef(getElement);
  getElementRef.current = getElement;

  useEffect(() => {
    const element = getElementRef.current();

    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
      },
      { rootMargin, threshold },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- deps controlam re-observação do carrossel
  }, [rootMargin, threshold, ...deps]);

  return isInViewRef;
}
