import { hasGoogleAnalyticsConsent } from "@/lib/google-analytics/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}

type GtagFunction = (...args: unknown[]) => void;

const EXCLUDED_PATH_PREFIXES = ["/admin"] as const;

const rawMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() ?? "";
const GA_MEASUREMENT_ID = /^G-[A-Z0-9]+$/i.test(rawMeasurementId)
  ? rawMeasurementId
  : "";

export type GoogleAnalyticsEventParams = Record<string, string | number | boolean | undefined>;

export function getGoogleAnalyticsMeasurementId(): string {
  return GA_MEASUREMENT_ID;
}

export function isGoogleAnalyticsConfigured(): boolean {
  return GA_MEASUREMENT_ID.length > 0;
}

export function isGoogleAnalyticsEnabled(): boolean {
  return isGoogleAnalyticsConfigured() && hasGoogleAnalyticsConsent();
}

export function shouldTrackGoogleAnalyticsOnPath(pathname: string): boolean {
  return !EXCLUDED_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function canTrack(): boolean {
  return (
    typeof window !== "undefined" &&
    isGoogleAnalyticsEnabled() &&
    typeof window.gtag === "function"
  );
}

export function trackGoogleAnalyticsPageView(pathname: string): void {
  if (!canTrack()) {
    return;
  }

  window.gtag!("config", GA_MEASUREMENT_ID, {
    page_path: pathname,
    page_location: window.location.href,
    page_title: document.title,
  });
}

/** Prepared for future custom events — not wired to UI yet. */
export function trackGoogleAnalyticsEvent(
  eventName: string,
  params?: GoogleAnalyticsEventParams,
): void {
  if (!canTrack()) {
    return;
  }

  if (params) {
    window.gtag!("event", eventName, params);
    return;
  }

  window.gtag!("event", eventName);
}

export function buildGoogleAnalyticsInitScript(measurementId: string): string {
  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${measurementId}', { send_page_view: false });
`.trim();
}
