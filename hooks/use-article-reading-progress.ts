"use client";

import { useEffect, useRef, useState } from "react";

import {
  ARTICLE_CONTENT_SELECTOR,
  measureArticleReadingProgress,
} from "@/lib/blog/reading-progress";

export function useArticleReadingProgress() {
  const [progress, setProgress] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const content = document.querySelector<HTMLElement>(ARTICLE_CONTENT_SELECTOR);
    if (!content) {
      return;
    }

    const update = () => {
      const next = measureArticleReadingProgress(content);
      setProgress((prev) => (Math.abs(prev - next) < 0.001 ? prev : next));
    };

    const scheduleUpdate = () => {
      if (rafRef.current != null) {
        return;
      }

      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        update();
      });
    };

    update();

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(content);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver.disconnect();

      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return {
    progress,
    percent: Math.round(progress * 100),
  };
}
