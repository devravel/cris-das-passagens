"use client";

import { cn } from "@/lib/utils";

type BlogReadingProgressProps = {
  progress: number;
  percent: number;
};

export function BlogReadingProgress({ progress, percent }: BlogReadingProgressProps) {
  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1 bg-transparent"
      aria-hidden
    >
      <div
        role="progressbar"
        aria-label="Progresso de leitura do artigo"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className={cn(
          "h-full origin-left bg-brand will-change-[width]",
          "transition-[width] duration-150 ease-out motion-reduce:transition-none",
        )}
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
