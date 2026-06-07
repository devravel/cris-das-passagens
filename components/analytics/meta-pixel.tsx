"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

import { useConsent } from "@/components/consent/consent-context";
import {
  buildMetaPixelInitScript,
  getMetaPixelId,
  isMetaPixelConfigured,
  shouldTrackMetaPixelOnPath,
  trackMetaPageView,
} from "@/lib/meta-pixel";

function MetaPixelPageViewTracker() {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);
  const { isReady, isCategoryEnabled } = useConsent();
  const marketingEnabled = isReady && isCategoryEnabled("marketing");

  useEffect(() => {
    if (
      !marketingEnabled ||
      !isMetaPixelConfigured() ||
      !shouldTrackMetaPixelOnPath(pathname)
    ) {
      return;
    }

    if (previousPathname.current === pathname) {
      return;
    }

    previousPathname.current = pathname;
    trackMetaPageView();
  }, [pathname, marketingEnabled]);

  return null;
}

export function MetaPixel() {
  const pathname = usePathname();
  const pixelId = getMetaPixelId();
  const { isReady, isCategoryEnabled } = useConsent();
  const marketingEnabled = isReady && isCategoryEnabled("marketing");

  if (
    !marketingEnabled ||
    !isMetaPixelConfigured() ||
    !shouldTrackMetaPixelOnPath(pathname)
  ) {
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: buildMetaPixelInitScript(pixelId),
        }}
      />
      <MetaPixelPageViewTracker />
    </>
  );
}
