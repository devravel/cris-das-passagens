"use client";

import dynamic from "next/dynamic";
import Script from "next/script";
import { useRef, useState } from "react";

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

/**
 * Carrossel próprio na tela desde o início; o Elfsight carrega escondido e só
 * entra no lugar se renderizar de verdade (plano estourado ou script bloqueado
 * = fica o carrossel, sem skeleton nem troca visível).
 */
export function TestimonialsElfsightHost() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [scriptFailed, setScriptFailed] = useState(false);

  const widgetStatus = useElfsightWidget({
    containerRef,
    scriptReady: scriptReady && !scriptFailed,
    enabled: !scriptFailed,
  });

  const widgetLoaded = widgetStatus === "loaded";

  return (
    <div className="relative w-full min-w-0">
      {!widgetLoaded ? <GoogleReviewsFallback /> : null}

      <div
        className={cn(
          "w-full min-w-0 transition-opacity duration-300 motion-reduce:transition-none",
          widgetLoaded
            ? "opacity-100"
            : "pointer-events-none absolute inset-0 -z-10 opacity-0",
        )}
        aria-hidden={!widgetLoaded}
      >
        {!scriptFailed ? (
          <Script
            src="https://elfsightcdn.com/platform.js"
            strategy="lazyOnload"
            onReady={() => setScriptReady(true)}
            onError={() => setScriptFailed(true)}
          />
        ) : null}

        <div
          ref={containerRef}
          className={ELFSIGHT_APP_CLASS}
          data-elfsight-app-lazy
        />
      </div>
    </div>
  );
}
