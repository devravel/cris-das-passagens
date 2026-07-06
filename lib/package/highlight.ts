import { packagesPageSections } from "@/config/packages-page";
import type { PackageCategoryValue, PackageTypeValue } from "@/lib/package/constants";
import type { PackagesPageData, PublicPackage } from "@/lib/package/queries";

export function findPackageBySlug(
  data: PackagesPageData,
  slug: string,
): PublicPackage | null {
  const allPackages = [
    ...data.complete,
    ...data.flights,
    ...data.hotels,
    ...data.tickets,
    ...data.cruises,
    ...data.circuits,
  ];

  return allPackages.find((pkg) => pkg.slug === slug) ?? null;
}

export function getSectionIdForPackageType(type: PackageTypeValue): string | null {
  return packagesPageSections.find((section) => section.type === type)?.sectionId ?? null;
}

export function resolveHighlightCategory(
  category: PackageCategoryValue | null,
): PackageCategoryValue {
  if (category === "NATIONAL" || category === "INTERNATIONAL") {
    return category;
  }

  return "NATIONAL";
}
