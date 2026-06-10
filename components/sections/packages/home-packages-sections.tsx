import { PackageShowcaseSection } from "@/components/sections/packages/package-showcase-section";
import {
  LANDING_PACKAGE_CATEGORY_SECTIONS_ENABLED,
  packageShowcaseSections,
} from "@/config/packages-showcase";
import type { PackageTypeValue } from "@/lib/package/constants";
import { getHomepagePackages, type HomepagePackages } from "@/lib/package/queries";

const LANDING_PACKAGE_TYPES = new Set<PackageTypeValue>([
  "PACKAGE_COMPLETE",
  "FLIGHT",
  "HOTEL",
]);

function getPackagesForType(homepagePackages: HomepagePackages, type: PackageTypeValue) {
  switch (type) {
    case "PACKAGE_COMPLETE":
      return homepagePackages.complete;
    case "FLIGHT":
      return homepagePackages.flights;
    case "HOTEL":
      return homepagePackages.hotels;
    case "TICKET":
      return homepagePackages.tickets;
    case "CRUISE":
      return homepagePackages.cruises;
    case "CIRCUIT":
      return homepagePackages.circuits;
    default:
      return [];
  }
}

export async function HomePackagesSections() {
  // Seções de categorias de pacotes desabilitadas temporariamente na Landing Page. Reativar quando necessário.
  if (!LANDING_PACKAGE_CATEGORY_SECTIONS_ENABLED) {
    return null;
  }

  const homepagePackages = await getHomepagePackages();

  const sections = packageShowcaseSections
    .filter((config) => LANDING_PACKAGE_TYPES.has(config.type))
    .map((config) => ({
      config,
      packages: getPackagesForType(homepagePackages, config.type),
    }))
    .filter((section) => section.packages.length > 0);

  if (sections.length === 0) {
    return null;
  }

  return (
    <>
      {sections.map(({ config, packages }) => (
        <PackageShowcaseSection key={config.sectionId} config={config} packages={packages} />
      ))}
    </>
  );
}
