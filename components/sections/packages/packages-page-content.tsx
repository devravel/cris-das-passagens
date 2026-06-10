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

const typeNavItems: PackageTypeNavItem[] = packagesPageSections.map((config) => ({
  label: config.title,
  sectionId: config.sectionId,
}));

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

function resolveActiveSectionId(): string {
  const scrollMarker = window.scrollY + getPacotesScrollOffset();
  let activeId = packagesPageSections[0]!.sectionId;

  for (const section of packagesPageSections) {
    const element = document.getElementById(section.sectionId);

    if (!element) {
      continue;
    }

    if (getSectionDocumentTop(element) <= scrollMarker + 1) {
      activeId = section.sectionId;
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

export function PackagesPageContent({ data }: PackagesPageContentProps) {
  const [category, setCategory] = useState<PackageCategoryValue>("NATIONAL");
  const [activeSectionId, setActiveSectionId] = useState(packagesPageSections[0]!.sectionId);
  const programmaticScrollUntilRef = useRef(0);

  const sections = useMemo(
    () =>
      packagesPageSections.map((config) => ({
        config,
        packages: getPackagesForType(data, config.type).filter((pkg) =>
          packageMatchesCategory(pkg.category, category),
        ),
      })),
    [category, data],
  );

  const panelIds = useMemo(
    () => sections.map(({ config }) => `${config.sectionId}-panel`).join(" "),
    [sections],
  );

  const lockProgrammaticScroll = useCallback(() => {
    programmaticScrollUntilRef.current = Date.now() + PROGRAMMATIC_SCROLL_LOCK_MS;
  }, []);

  const updateActiveSection = useCallback(() => {
    if (Date.now() < programmaticScrollUntilRef.current) {
      return;
    }

    const nextActiveId = resolveActiveSectionId();
    setActiveSectionId((current) => (current === nextActiveId ? current : nextActiveId));
  }, []);

  const handleNavigate = useCallback(
    (sectionId: string) => {
      lockProgrammaticScroll();
      setActiveSectionId(sectionId);
      scrollToPackagesSection(sectionId);
    },
    [lockProgrammaticScroll],
  );

  useEffect(() => {
    let frameId = 0;

    const handleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateActiveSection);
    };

    const hash = window.location.hash.replace("#", "");

    if (isPackagesSectionId(hash)) {
      lockProgrammaticScroll();
      window.requestAnimationFrame(() => {
        scrollToPackagesSection(hash);
        setActiveSectionId(hash);
      });
    } else {
      updateActiveSection();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [lockProgrammaticScroll, updateActiveSection, category]);

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

        <PackageTypeNav
          items={typeNavItems}
          activeSectionId={activeSectionId}
          onNavigate={handleNavigate}
          labelledBy="pacotes-page-heading"
        />
      </div>

      <div className="space-y-11 sm:space-y-12 lg:space-y-14">
        {sections.map(({ config, packages }, index) => (
          <PackagesListingSection
            key={config.sectionId}
            config={config}
            packages={packages}
            emptyMessage={packagesPageContent.emptyCategoryMessage}
            className={
              index > 0 ? "border-t border-border/50 pt-11 sm:pt-12 lg:pt-14" : undefined
            }
          />
        ))}
      </div>
    </>
  );
}
