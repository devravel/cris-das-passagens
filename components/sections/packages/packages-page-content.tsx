"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { PackageCategoryToggle } from "@/components/packages/package-category-toggle";
import {
  PackageTypeNav,
  type PackageTypeNavItem,
} from "@/components/packages/package-type-nav";
import { PackagesListingSection } from "@/components/sections/packages/packages-listing-section";
import { packagesPageContent, packagesPageSections } from "@/config/packages-page";
import { packageMatchesCategory } from "@/lib/package/category";
import type { PackageCategoryValue, PackageTypeValue } from "@/lib/package/constants";
import type { PackagesPageData, PublicPackage } from "@/lib/package/queries";

type PackagesPageContentProps = {
  data: PackagesPageData;
};

const SCROLL_SPY_BUFFER_PX = 12;
const PROGRAMMATIC_SCROLL_LOCK_MS = 900;

function getPackagesForType(data: PackagesPageData, type: PackageTypeValue): PublicPackage[] {
  switch (type) {
    case "FLIGHT":
      return data.flights;
    case "PACKAGE_COMPLETE":
      return data.complete;
    case "HOTEL":
      return data.hotels;
    case "TICKET":
      return data.tickets;
    case "CRUISE":
      return data.cruises;
    case "CIRCUIT":
      return data.circuits;
    default:
      return [];
  }
}

function isPackagesSectionId(value: string) {
  return packagesPageSections.some((section) => section.sectionId === value);
}

function getPacotesScrollOffset() {
  const siteHeader = document.querySelector("header");
  const stickyNav = document.querySelector(".pacotes-page-sticky-nav");

  return (
    (siteHeader?.getBoundingClientRect().height ?? 0) +
    (stickyNav?.getBoundingClientRect().height ?? 0) +
    SCROLL_SPY_BUFFER_PX
  );
}

function getSectionDocumentTop(section: HTMLElement) {
  return section.getBoundingClientRect().top + window.scrollY;
}

function resolveActiveSectionId(sectionIds: string[]): string | null {
  if (sectionIds.length === 0) {
    return null;
  }

  const scrollMarker = window.scrollY + getPacotesScrollOffset();
  let activeId = sectionIds[0]!;

  for (const sectionId of sectionIds) {
    const element = document.getElementById(sectionId);

    if (!element) {
      continue;
    }

    if (getSectionDocumentTop(element) <= scrollMarker + 1) {
      activeId = sectionId;
    }
  }

  return activeId;
}

function scrollToPackagesSection(sectionId: string) {
  const section = document.getElementById(sectionId);

  if (!section) {
    return;
  }

  const top = getSectionDocumentTop(section) - getPacotesScrollOffset();

  window.scrollTo({
    top: Math.max(0, top),
    behavior: "smooth",
  });
  window.history.replaceState(null, "", `#${sectionId}`);
}

function sectionHasCategory(
  packages: PublicPackage[],
  filter: PackageCategoryValue,
): boolean {
  return packages.some((pkg) => packageMatchesCategory(pkg.category, filter));
}

function resolveCategoryForSection(
  packages: PublicPackage[],
  preferred: PackageCategoryValue,
): PackageCategoryValue | null {
  if (sectionHasCategory(packages, preferred)) {
    return preferred;
  }

  if (sectionHasCategory(packages, "NATIONAL")) {
    return "NATIONAL";
  }

  if (sectionHasCategory(packages, "INTERNATIONAL")) {
    return "INTERNATIONAL";
  }

  return null;
}

function getSectionConfig(sectionId: string) {
  return packagesPageSections.find((section) => section.sectionId === sectionId);
}

export function PackagesPageContent({ data }: PackagesPageContentProps) {
  const [category, setCategory] = useState<PackageCategoryValue>("NATIONAL");
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const programmaticScrollUntilRef = useRef(0);
  const pendingScrollSectionIdRef = useRef<string | null>(null);
  const hasHandledInitialHashRef = useRef(false);

  const sectionsWithPackages = useMemo(
    () =>
      packagesPageSections
        .map((config) => ({
          config,
          packages: getPackagesForType(data, config.type),
        }))
        .filter((section) => section.packages.length > 0),
    [data],
  );

  const visibleSections = useMemo(
    () =>
      sectionsWithPackages
        .map(({ config, packages }) => ({
          config,
          packages: packages.filter((pkg) =>
            packageMatchesCategory(pkg.category, category),
          ),
        }))
        .filter((section) => section.packages.length > 0),
    [category, sectionsWithPackages],
  );

  const typeNavItems = useMemo<PackageTypeNavItem[]>(
    () =>
      sectionsWithPackages.map(({ config }) => ({
        label: config.title,
        sectionId: config.sectionId,
      })),
    [sectionsWithPackages],
  );

  const navSectionIds = useMemo(
    () => typeNavItems.map((item) => item.sectionId),
    [typeNavItems],
  );

  const visibleSectionIds = useMemo(
    () => visibleSections.map(({ config }) => config.sectionId),
    [visibleSections],
  );

  const panelIds = useMemo(
    () => visibleSections.map(({ config }) => `${config.sectionId}-panel`).join(" "),
    [visibleSections],
  );

  const lockProgrammaticScroll = useCallback(() => {
    programmaticScrollUntilRef.current = Date.now() + PROGRAMMATIC_SCROLL_LOCK_MS;
  }, []);

  const updateActiveSection = useCallback(() => {
    if (Date.now() < programmaticScrollUntilRef.current) {
      return;
    }

    const nextActiveId = resolveActiveSectionId(visibleSectionIds);

    if (!nextActiveId) {
      return;
    }

    setActiveSectionId((current) => (current === nextActiveId ? current : nextActiveId));
  }, [visibleSectionIds]);

  const handleNavigate = useCallback(
    (sectionId: string) => {
      const config = getSectionConfig(sectionId);

      if (!config) {
        return;
      }

      const packages = getPackagesForType(data, config.type);
      const targetCategory = resolveCategoryForSection(packages, category);

      if (!targetCategory) {
        return;
      }

      lockProgrammaticScroll();
      setActiveSectionId(sectionId);

      if (targetCategory !== category) {
        pendingScrollSectionIdRef.current = sectionId;
        setCategory(targetCategory);
        return;
      }

      scrollToPackagesSection(sectionId);
    },
    [category, data, lockProgrammaticScroll],
  );

  useEffect(() => {
    setActiveSectionId((current) => {
      if (visibleSectionIds.length > 0) {
        if (current && visibleSectionIds.includes(current)) {
          return current;
        }

        return visibleSectionIds[0]!;
      }

      if (current && navSectionIds.includes(current)) {
        return current;
      }

      return navSectionIds[0] ?? null;
    });
  }, [navSectionIds, visibleSectionIds]);

  useEffect(() => {
    const pendingSectionId = pendingScrollSectionIdRef.current;

    if (!pendingSectionId) {
      return;
    }

    const section = document.getElementById(pendingSectionId);

    if (!section) {
      return;
    }

    pendingScrollSectionIdRef.current = null;
    lockProgrammaticScroll();

    window.requestAnimationFrame(() => {
      scrollToPackagesSection(pendingSectionId);
      setActiveSectionId(pendingSectionId);
    });
  }, [category, visibleSections, lockProgrammaticScroll]);

  useEffect(() => {
    if (hasHandledInitialHashRef.current || navSectionIds.length === 0) {
      return;
    }

    hasHandledInitialHashRef.current = true;

    const hash = window.location.hash.replace("#", "");

    if (!isPackagesSectionId(hash) || !navSectionIds.includes(hash)) {
      return;
    }

    const config = getSectionConfig(hash);

    if (!config) {
      return;
    }

    const packages = getPackagesForType(data, config.type);
    const targetCategory = resolveCategoryForSection(packages, category);

    if (!targetCategory) {
      return;
    }

    setActiveSectionId(hash);

    if (targetCategory !== category) {
      pendingScrollSectionIdRef.current = hash;
      setCategory(targetCategory);
      return;
    }

    lockProgrammaticScroll();
    window.requestAnimationFrame(() => {
      scrollToPackagesSection(hash);
    });
  }, [category, data, lockProgrammaticScroll, navSectionIds]);

  useEffect(() => {
    if (visibleSectionIds.length === 0) {
      return;
    }

    let frameId = 0;

    const handleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateActiveSection);
    };

    updateActiveSection();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [updateActiveSection, visibleSectionIds]);

  if (sectionsWithPackages.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground sm:text-base">
        {packagesPageContent.emptySectionMessage}
      </p>
    );
  }

  const showTypeNav = typeNavItems.length > 0;

  return (
    <>
      <div className="pacotes-page-sticky-nav sticky top-16 z-30 -mx-4 mb-8 space-y-4 border-b border-border/40 bg-background/95 px-4 pb-4 backdrop-blur-sm sm:-mx-6 sm:mb-10 sm:space-y-5 sm:px-6 sm:pb-5 sm:top-18 lg:-mx-8 lg:px-8 lg:mb-12">
        <div className="flex justify-center">
          <PackageCategoryToggle
            value={category}
            onChange={setCategory}
            layoutId="pacotes-page"
            panelId={panelIds}
            labelledBy="pacotes-page-heading"
            className="w-full sm:w-auto"
          />
        </div>

        {showTypeNav && activeSectionId ? (
          <PackageTypeNav
            items={typeNavItems}
            activeSectionId={activeSectionId}
            onNavigate={handleNavigate}
            labelledBy="pacotes-page-heading"
          />
        ) : null}
      </div>

      {visibleSections.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground sm:text-base">
          {packagesPageContent.emptyCategoryMessage}
        </p>
      ) : (
        <div className="space-y-11 sm:space-y-12 lg:space-y-14">
          {visibleSections.map(({ config, packages }, index) => (
            <PackagesListingSection
              key={config.sectionId}
              config={config}
              packages={packages}
              className={
                index > 0 ? "border-t border-border/50 pt-11 sm:pt-12 lg:pt-14" : undefined
              }
            />
          ))}
        </div>
      )}
    </>
  );
}
