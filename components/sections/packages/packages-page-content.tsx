import { PackagesListingSection } from "@/components/sections/packages/packages-listing-section";
import { packagesPageContent, packagesPageSections } from "@/config/packages-page";
import type { PackageTypeValue } from "@/lib/package/constants";
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
  const sections = packagesPageSections
    .map((config) => ({
      config,
      packages: getPackagesForType(data, config.type),
    }))
    .filter((section) => section.packages.length > 0);

  if (sections.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-12 text-center text-sm text-muted-foreground sm:text-base">
        {packagesPageContent.emptySectionMessage}
      </p>
    );
  }

  return (
    <div className="space-y-14 sm:space-y-16 lg:space-y-20">
      {sections.map(({ config, packages }, index) => (
        <PackagesListingSection
          key={config.sectionId}
          config={config}
          packages={packages}
          showDisclaimer={config.type === "FLIGHT" || config.type === "PACKAGE_COMPLETE"}
          className={index > 0 ? "border-t border-border/50 pt-14 sm:pt-16 lg:pt-20" : undefined}
        />
      ))}
    </div>
  );
}
