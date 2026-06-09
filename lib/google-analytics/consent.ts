/**
 * LGPD / consent gate for Google Analytics 4.
 *
 * Defaults to denied until the visitor accepts analytics cookies via the consent
 * banner. `applyConsentPreferences` in lib/consent/apply.ts keeps this in sync.
 */

let consentGranted = false;

export function hasGoogleAnalyticsConsent(): boolean {
  return consentGranted;
}

export function setGoogleAnalyticsConsent(granted: boolean): void {
  consentGranted = granted;
}
