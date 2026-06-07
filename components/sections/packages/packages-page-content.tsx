"use client";

import { useMemo, useState } from "react";

import { PackageCategoryToggle } from "@/components/packages/package-category-toggle";
import { PackagesListingSection } from "@/components/sections/packages/packages-listing-section";
import { packagesPageContent, packagesPageSections } from "@/config/packages-page";
import { packageMatchesCategory } from "@/lib/package/category";
import type { PackageCategoryValue, PackageTypeValue } from "@/lib/package/constants";
import type { PackagesPageData, PublicPackage } from "@/lib/package/queries";

type PackagesPageContentProps = {
  data: PackagesPageData;
};

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
    default:
      return [];
  }
}

export function PackagesPageContent({ data }: PackagesPageContentProps) {
  const [category, setCategory] = useState<PackageCategoryValue>("NATIONAL");

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

  const filterablePanelIds = useMemo(
    () => visibleSections.map(({ config }) => `${config.sectionId}-panel`),
    [visibleSections],
  );

  const showCategoryToggle = sectionsWithPackages.length > 0;

  if (sectionsWithPackages.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground sm:text-base">
        {packagesPageContent.emptySectionMessage}
      </p>
    );
  }

  return (
    <>
      {showCategoryToggle ? (
        <div className="mb-10 flex justify-center sm:mb-12 lg:mb-14">
          <PackageCategoryToggle
            value={category}
            onChange={setCategory}
            layoutId="pacotes-page"
            panelId={filterablePanelIds}
            labelledBy="pacotes-page-heading"
            className="w-full sm:w-auto"
          />
        </div>
      ) : null}

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
