import {
  applyConsentPreferences,
  DEFAULT_ACCEPTED_PREFERENCES,
  DEFAULT_REJECTED_PREFERENCES,
  readStoredConsent,
  writeStoredConsent,
  type ConsentPreferences,
} from "@/lib/consent";

export type ConsentStoreState = {
  isReady: boolean;
  hasChosen: boolean;
  preferences: ConsentPreferences;
};

const SERVER_SNAPSHOT: ConsentStoreState = {
  isReady: false,
  hasChosen: false,
  preferences: DEFAULT_REJECTED_PREFERENCES,
};

let snapshot: ConsentStoreState = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

export function getConsentStoreSnapshot(): ConsentStoreState {
  return snapshot;
}

export function getConsentStoreServerSnapshot(): ConsentStoreState {
  return SERVER_SNAPSHOT;
}

export function subscribeConsentStore(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function initConsentStore(): void {
  if (typeof window === "undefined" || snapshot.isReady) {
    return;
  }

  const stored = readStoredConsent();

  if (stored) {
    applyConsentPreferences(stored.preferences);
    snapshot = {
      isReady: true,
      hasChosen: true,
      preferences: stored.preferences,
    };
  } else {
    applyConsentPreferences(DEFAULT_REJECTED_PREFERENCES);
    snapshot = {
      isReady: true,
      hasChosen: false,
      preferences: DEFAULT_REJECTED_PREFERENCES,
    };
  }

  emitChange();
}

export function persistConsentPreferences(preferences: ConsentPreferences): void {
  writeStoredConsent(preferences);
  applyConsentPreferences(preferences);
  snapshot = {
    isReady: true,
    hasChosen: true,
    preferences,
  };
  emitChange();
}

export function acceptAllConsentPreferences(): void {
  persistConsentPreferences(DEFAULT_ACCEPTED_PREFERENCES);
}

export function rejectAllConsentPreferences(): void {
  persistConsentPreferences(DEFAULT_REJECTED_PREFERENCES);
}
