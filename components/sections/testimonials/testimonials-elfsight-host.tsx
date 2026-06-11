"use client";

import dynamic from "next/dynamic";
import Script from "next/script";
import { useRef, useState } from "react";

import { ElfsightLoadingSkeleton } from "@/components/sections/testimonials/elfsight-loading-skeleton";
import { useElfsightWidget } from "@/components/sections/testimonials/use-elfsight-widget";
import { cn } from "@/lib/utils";

const GoogleReviewsFallback = dynamic(
  () =>
    import("@/components/sections/testimonials/google-reviews/google-reviews-fallback").then(
      (module) => module.GoogleReviewsFallback,
    ),
  { ssr: false },
);

const ELFSIGHT_APP_CLASS = "elfsight-app-3fd6553a-00c3-4848-823e-0f569bbdebff";

export function TestimonialsElfsightHost() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);

  const widgetStatus = useElfsightWidget({
    containerRef,
    scriptReady: scriptReady && !scriptFailed,
    enabled: !scriptFailed,
  });

  const showFallback = scriptFailed || widgetStatus === "failed";
  const showSkeleton = !showFallback && widgetStatus === "pending";

  if (showFallback) {
    return <GoogleReviewsFallback />;
  }

  return (
    <div className="relative w-full min-w-0">
      {showSkeleton ? (
        <ElfsightLoadingSkeleton className="relative z-10" />
      ) : null}

      <div
        className={cn(
          "w-full min-w-0 transition-opacity duration-300 motion-reduce:transition-none",
          showSkeleton
            ? "pointer-events-none absolute inset-0 z-0 opacity-0"
            : "opacity-100",
        )}
      >
        <Script
          src="https://elfsightcdn.com/platform.js"
          strategy="afterInteractive"
          onReady={() => setScriptReady(true)}
          onError={() => setScriptFailed(true)}
        />

        <div
          ref={containerRef}
          className={ELFSIGHT_APP_CLASS}
          data-elfsight-app-lazy
        />
      </div>
    </div>
  );
}
