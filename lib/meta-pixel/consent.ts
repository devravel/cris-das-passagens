/**
 * LGPD / consent gate for Meta Pixel.
 *
 * Defaults to denied until the visitor accepts marketing cookies via the consent
 * banner. `applyConsentPreferences` in lib/consent/apply.ts keeps this in sync.
 */

let consentGranted = false;

export function hasMetaPixelConsent(): boolean {
  return consentGranted;
}

export function setMetaPixelConsent(granted: boolean): void {
  consentGranted = granted;
}

/**
 * Restores Meta Pixel consent from localStorage on the client.
 * Prefer ConsentProvider mount via initConsentStore(); kept for external hooks.
 */
export function refreshMetaPixelConsentFromStorage(): void {
  if (typeof window === "undefined") {
    return;
  }

  void import("@/lib/consent/store").then(({ initConsentStore }) => {
    initConsentStore();
  });
}
