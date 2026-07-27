"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

import {
  acceptAllConsentPreferences,
  getConsentStoreServerSnapshot,
  getConsentStoreSnapshot,
  initConsentStore,
  persistConsentPreferences,
  rejectAllConsentPreferences,
  subscribeConsentStore,
} from "@/lib/consent/store";
import type { ConsentCategory, ConsentPreferences } from "@/lib/consent";

type ConsentContextValue = {
  isReady: boolean;
  hasChosen: boolean;
  preferences: ConsentPreferences;
  isBannerVisible: boolean;
  isModalOpen: boolean;
  isCategoryEnabled: (category: ConsentCategory) => boolean;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (preferences: ConsentPreferences) => void;
  openPreferences: () => void;
  closePreferences: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

const ADMIN_PATH_PREFIX = "/admin";

function isAdminPath(pathname: string): boolean {
  return pathname.startsWith(ADMIN_PATH_PREFIX);
}

export function ConsentProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const onAdmin = isAdminPath(pathname);
  const store = useSyncExternalStore(
    subscribeConsentStore,
    getConsentStoreSnapshot,
    getConsentStoreServerSnapshot,
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);

  useEffect(() => {
    initConsentStore();
  }, []);

  const isBannerVisible =
    store.isReady && !store.hasChosen && !onAdmin && !isModalOpen && !bannerDismissed;

  const acceptAll = useCallback(() => {
    acceptAllConsentPreferences();
    setIsModalOpen(false);
    setBannerDismissed(true);
  }, []);

  const rejectAll = useCallback(() => {
    rejectAllConsentPreferences();
    setIsModalOpen(false);
    setBannerDismissed(true);
  }, []);

  const savePreferences = useCallback((nextPreferences: ConsentPreferences) => {
    persistConsentPreferences(nextPreferences);
    setIsModalOpen(false);
    setBannerDismissed(true);
  }, []);

  const openPreferences = useCallback(() => {
    setIsModalOpen(true);
    setBannerDismissed(true);
  }, []);

  const closePreferences = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const isCategoryEnabled = useCallback(
    (category: ConsentCategory) => {
      if (category === "necessary") {
        return true;
      }

      return store.preferences[category];
    },
    [store.preferences],
  );

  const value = useMemo<ConsentContextValue>(
    () => ({
      isReady: store.isReady,
      hasChosen: store.hasChosen,
      preferences: store.preferences,
      isBannerVisible,
      isModalOpen,
      isCategoryEnabled,
      acceptAll,
      rejectAll,
      savePreferences,
      openPreferences,
      closePreferences,
    }),
    [
      store.isReady,
      store.hasChosen,
      store.preferences,
      isBannerVisible,
      isModalOpen,
      isCategoryEnabled,
      acceptAll,
      rejectAll,
      savePreferences,
      openPreferences,
      closePreferences,
    ],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);

  if (!context) {
    throw new Error("useConsent must be used within ConsentProvider");
  }

  return context;
}
