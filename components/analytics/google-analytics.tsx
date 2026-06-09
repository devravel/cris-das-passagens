"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";

import { useConsent } from "@/components/consent/consent-context";
import {
  buildGoogleAnalyticsInitScript,
  getGoogleAnalyticsMeasurementId,
  isGoogleAnalyticsConfigured,
  shouldTrackGoogleAnalyticsOnPath,
  trackGoogleAnalyticsPageView,
} from "@/lib/google-analytics";

function GoogleAnalyticsPageViewTracker() {
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);
  const { isReady, isCategoryEnabled } = useConsent();
  const analyticsEnabled = isReady && isCategoryEnabled("analytics");

  useEffect(() => {
    if (
      !analyticsEnabled ||
      !isGoogleAnalyticsConfigured() ||
      !shouldTrackGoogleAnalyticsOnPath(pathname)
    ) {
      return;
    }

    if (previousPathname.current === pathname) {
      return;
    }

    previousPathname.current = pathname;
    trackGoogleAnalyticsPageView(pathname);
  }, [pathname, analyticsEnabled]);

  return null;
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  const measurementId = getGoogleAnalyticsMeasurementId();
  const { isReady, isCategoryEnabled } = useConsent();
  const analyticsEnabled = isReady && isCategoryEnabled("analytics");

  if (
    !analyticsEnabled ||
    !isGoogleAnalyticsConfigured() ||
    !shouldTrackGoogleAnalyticsOnPath(pathname)
  ) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: buildGoogleAnalyticsInitScript(measurementId),
        }}
      />
      <GoogleAnalyticsPageViewTracker />
    </>
  );
}
