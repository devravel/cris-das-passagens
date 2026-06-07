import {
  DEFAULT_REJECTED_PREFERENCES,
  type ConsentPreferences,
  type StoredConsent,
} from "@/lib/consent/types";

export const CONSENT_STORAGE_KEY = "cris-consent-preferences";
export const CONSENT_STORAGE_VERSION = 1;

function isConsentPreferences(value: unknown): value is ConsentPreferences {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return typeof record.analytics === "boolean" && typeof record.marketing === "boolean";
}

export function readStoredConsent(): StoredConsent | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }

    const record = parsed as Partial<StoredConsent>;
    if (
      record.version !== CONSENT_STORAGE_VERSION ||
      !isConsentPreferences(record.preferences) ||
      typeof record.updatedAt !== "string"
    ) {
      return null;
    }

    return {
      version: record.version,
      preferences: record.preferences,
      updatedAt: record.updatedAt,
    };
  } catch {
    return null;
  }
}

export function writeStoredConsent(preferences: ConsentPreferences): StoredConsent {
  const stored: StoredConsent = {
    version: CONSENT_STORAGE_VERSION,
    preferences,
    updatedAt: new Date().toISOString(),
  };

  if (typeof window !== "undefined") {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(stored));
  }

  return stored;
}

export function clearStoredConsent(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(CONSENT_STORAGE_KEY);
  }
}

export function hasStoredConsentChoice(): boolean {
  return readStoredConsent() !== null;
}

export function getStoredPreferencesOrDefault(): ConsentPreferences {
  return readStoredConsent()?.preferences ?? DEFAULT_REJECTED_PREFERENCES;
}
