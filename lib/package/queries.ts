import { unstable_cache } from "next/cache";
import { cache } from "react";

import {
  FEATURED_PACKAGES_CACHE_TAG,
  HOMEPAGE_PACKAGES_CACHE_TAG,
  PACKAGES_PAGE_CACHE_TAG,
} from "@/lib/package/cache-tags";
import { prisma } from "@/lib/prisma";
import type { PackageCategoryValue, PackagePriceScopeValue, PackageTypeValue } from "@/lib/package/constants";
import { packageDateToIsoString } from "@/lib/package/dates";
import { buildIncludedItemSuggestions } from "@/lib/package/included-item-suggestions";
import { normalizePackageImageUrl } from "@/lib/package/image-url";

export type PublicPackage = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string | null;
  destination: string;
  image: string;
  type: PackageTypeValue;
  category: PackageCategoryValue | null;
  price: number;
  oldPrice: number | null;
  priceScope: PackagePriceScopeValue | null;
  installmentText: string | null;
  highlightInstallments: boolean;
  feesText: string | null;
  airline: string | null;
  hotelName: string | null;
  includedItems: string[];
  departureCity: string | null;
  departureDate: string | null;
  returnDate: string | null;
  circuitStartDay: string | null;
  circuitDuration: string | null;
  daysCount: number | null;
  nightsCount: number | null;
  featured: boolean;
};

export type HomepagePackages = {
  complete: PublicPackage[];
  flights: PublicPackage[];
  hotels: PublicPackage[];
  tickets: PublicPackage[];
  cruises: PublicPackage[];
};

export type PackagesPageData = {
  flights: PublicPackage[];
  complete: PublicPackage[];
  hotels: PublicPackage[];
  tickets: PublicPackage[];
  cruises: PublicPackage[];
};

const publicPackageSelect = {
  id: true,
  slug: true,
  title: true,
  shortDescription: true,
  destination: true,
  image: true,
  type: true,
  category: true,
  price: true,
  oldPrice: true,
  priceScope: true,
  installmentText: true,
  highlightInstallments: true,
  feesText: true,
  airline: true,
  hotelName: true,
  includedItems: true,
  departureCity: true,
  departureDate: true,
  returnDate: true,
  circuitStartDay: true,
  circuitDuration: true,
  daysCount: true,
  nightsCount: true,
  featured: true,
} as const;

function decimalToNumber(value: { toNumber?: () => number } | number | null | undefined) {
  if (value == null) {
    return null;
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value.toNumber === "function") {
    return value.toNumber();
  }

  return Number(value);
}

function mapPublicPackage(
  pkg: {
    id: string;
    slug: string;
    title: string;
    shortDescription: string | null;
    destination: string;
    image: string;
    type: string;
    category: string | null;
    price: { toNumber?: () => number } | number;
    oldPrice: { toNumber?: () => number } | number | null;
    priceScope: string | null;
    installmentText: string | null;
    highlightInstallments: boolean;
    feesText: string | null;
    airline: string | null;
    hotelName: string | null;
    includedItems: string[];
    departureCity: string | null;
    departureDate: Date | null;
    returnDate: Date | null;
    circuitStartDay: string | null;
    circuitDuration: string | null;
    daysCount: number | null;
    nightsCount: number | null;
    featured: boolean;
  },
): PublicPackage {
  return {
    id: pkg.id,
    slug: pkg.slug,
    title: pkg.title,
    shortDescription: pkg.shortDescription,
    destination: pkg.destination,
    image: normalizePackageImageUrl(pkg.image),
    type: pkg.type as PackageTypeValue,
    category: (pkg.category as PackageCategoryValue | null) ?? null,
    price: decimalToNumber(pkg.price) ?? 0,
    oldPrice: decimalToNumber(pkg.oldPrice),
    priceScope: (pkg.priceScope as PackagePriceScopeValue | null) ?? null,
    installmentText: pkg.installmentText,
    highlightInstallments: pkg.highlightInstallments,
    feesText: pkg.feesText,
    airline: pkg.airline,
    hotelName: pkg.hotelName,
    includedItems: pkg.includedItems ?? [],
    departureCity: pkg.departureCity,
    departureDate: packageDateToIsoString(pkg.departureDate),
    returnDate: packageDateToIsoString(pkg.returnDate),
    circuitStartDay: pkg.circuitStartDay,
    circuitDuration: pkg.circuitDuration,
    daysCount: pkg.daysCount,
    nightsCount: pkg.nightsCount,
    featured: pkg.featured,
  };
}

function splitPackagesByType(packages: PublicPackage[]): HomepagePackages {
  return {
    complete: packages.filter((pkg) => pkg.type === "PACKAGE_COMPLETE"),
    flights: packages.filter((pkg) => pkg.type === "FLIGHT"),
    hotels: packages.filter((pkg) => pkg.type === "HOTEL"),
    tickets: packages.filter((pkg) => pkg.type === "TICKET"),
    cruises: packages.filter((pkg) => pkg.type === "CRUISE"),
  };
}

async function fetchFeaturedPackagesFromDb(): Promise<PublicPackage[]> {
  const packages = await prisma.package.findMany({
    where: {
      active: true,
      featured: true,
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: publicPackageSelect,
  });

  return packages.map(mapPublicPackage);
}

const getCachedFeaturedPackages = unstable_cache(
  fetchFeaturedPackagesFromDb,
  ["featured-packages"],
  { tags: [FEATURED_PACKAGES_CACHE_TAG] },
);

async function fetchHomepagePackagesFromDb(): Promise<HomepagePackages> {
  const packages = await prisma.package.findMany({
    where: {
      active: true,
      featured: true,
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    select: publicPackageSelect,
  });

  return splitPackagesByType(packages.map(mapPublicPackage));
}

const getCachedHomepagePackages = unstable_cache(
  fetchHomepagePackagesFromDb,
  ["homepage-packages"],
  { tags: [HOMEPAGE_PACKAGES_CACHE_TAG] },
);

async function fetchPackagesPageDataFromDb(): Promise<PackagesPageData> {
  const packages = await prisma.package.findMany({
    where: { active: true },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    select: publicPackageSelect,
  });

  const mapped = packages.map(mapPublicPackage);

  return {
    flights: mapped.filter((pkg) => pkg.type === "FLIGHT"),
    complete: mapped.filter((pkg) => pkg.type === "PACKAGE_COMPLETE"),
    hotels: mapped.filter((pkg) => pkg.type === "HOTEL"),
    tickets: mapped.filter((pkg) => pkg.type === "TICKET"),
    cruises: mapped.filter((pkg) => pkg.type === "CRUISE"),
  };
}

const getCachedPackagesPageData = unstable_cache(
  fetchPackagesPageDataFromDb,
  ["packages-page"],
  { tags: [PACKAGES_PAGE_CACHE_TAG] },
);

const emptyHomepagePackages: HomepagePackages = {
  complete: [],
  flights: [],
  hotels: [],
  tickets: [],
  cruises: [],
};

const emptyPackagesPageData: PackagesPageData = {
  flights: [],
  complete: [],
  hotels: [],
  tickets: [],
  cruises: [],
};

export const getFeaturedPackages = cache(async (): Promise<PublicPackage[]> => {
  try {
    return await getCachedFeaturedPackages();
  } catch (error) {
    console.error("[getFeaturedPackages] Failed to load featured packages:", error);
    return [];
  }
});

export const getHomepagePackages = cache(async (): Promise<HomepagePackages> => {
  try {
    return await getCachedHomepagePackages();
  } catch (error) {
    console.error("[getHomepagePackages] Failed to load homepage packages:", error);
    return emptyHomepagePackages;
  }
});

export const getPackagesPageData = cache(async (): Promise<PackagesPageData> => {
  try {
    return await getCachedPackagesPageData();
  } catch (error) {
    console.error("[getPackagesPageData] Failed to load packages page data:", error);
    return emptyPackagesPageData;
  }
});

export type AdminPackageListItem = {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  destination: string;
  image: string;
  type: PackageTypeValue;
  category: PackageCategoryValue | null;
  price: number;
  oldPrice: number | null;
  priceScope: PackagePriceScopeValue | null;
  installmentText: string | null;
  highlightInstallments: boolean;
  feesText: string | null;
  airline: string | null;
  hotelName: string | null;
  includedItems: string[];
  departureCity: string | null;
  departureDate: string | null;
  returnDate: string | null;
  circuitStartDay: string | null;
  circuitDuration: string | null;
  daysCount: number | null;
  nightsCount: number | null;
  active: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

const adminPackageSelect = {
  id: true,
  title: true,
  slug: true,
  shortDescription: true,
  destination: true,
  image: true,
  type: true,
  category: true,
  price: true,
  oldPrice: true,
  priceScope: true,
  installmentText: true,
  highlightInstallments: true,
  feesText: true,
  airline: true,
  hotelName: true,
  includedItems: true,
  departureCity: true,
  departureDate: true,
  returnDate: true,
  circuitStartDay: true,
  circuitDuration: true,
  daysCount: true,
  nightsCount: true,
  active: true,
  featured: true,
  createdAt: true,
  updatedAt: true,
} as const;

function mapAdminPackage(
  pkg: {
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    destination: string;
    image: string;
    type: string;
    category: string | null;
    price: { toNumber?: () => number } | number;
    oldPrice: { toNumber?: () => number } | number | null;
    priceScope: string | null;
    installmentText: string | null;
    highlightInstallments: boolean;
    feesText: string | null;
    airline: string | null;
    hotelName: string | null;
    includedItems: string[];
    departureCity: string | null;
    departureDate: Date | null;
    returnDate: Date | null;
    circuitStartDay: string | null;
    circuitDuration: string | null;
    daysCount: number | null;
    nightsCount: number | null;
    active: boolean;
    featured: boolean;
    createdAt: Date;
    updatedAt: Date;
  },
): AdminPackageListItem {
  return {
    id: pkg.id,
    title: pkg.title,
    slug: pkg.slug,
    shortDescription: pkg.shortDescription,
    destination: pkg.destination,
    image: normalizePackageImageUrl(pkg.image),
    type: pkg.type as PackageTypeValue,
    category: (pkg.category as PackageCategoryValue | null) ?? null,
    price: decimalToNumber(pkg.price) ?? 0,
    oldPrice: decimalToNumber(pkg.oldPrice),
    priceScope: (pkg.priceScope as PackagePriceScopeValue | null) ?? null,
    installmentText: pkg.installmentText,
    highlightInstallments: pkg.highlightInstallments,
    feesText: pkg.feesText,
    airline: pkg.airline,
    hotelName: pkg.hotelName,
    includedItems: pkg.includedItems ?? [],
    departureCity: pkg.departureCity,
    departureDate: packageDateToIsoString(pkg.departureDate),
    returnDate: packageDateToIsoString(pkg.returnDate),
    circuitStartDay: pkg.circuitStartDay,
    circuitDuration: pkg.circuitDuration,
    daysCount: pkg.daysCount,
    nightsCount: pkg.nightsCount,
    active: pkg.active,
    featured: pkg.featured,
    createdAt: pkg.createdAt.toISOString(),
    updatedAt: pkg.updatedAt.toISOString(),
  };
}

export const getAdminPackages = cache(async (): Promise<AdminPackageListItem[]> => {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { createdAt: "desc" },
      select: adminPackageSelect,
    });

    return packages.map(mapAdminPackage);
  } catch {
    return [];
  }
});

export type AdminPackageDetail = AdminPackageListItem;

export async function getAdminPackageById(id: string): Promise<AdminPackageDetail | null> {
  const pkg = await prisma.package.findUnique({
    where: { id },
    select: adminPackageSelect,
  });

  if (!pkg) {
    return null;
  }

  return mapAdminPackage(pkg);
}

export const getPackageIncludedItemSuggestions = cache(async (): Promise<string[]> => {
  try {
    const packages = await prisma.package.findMany({
      select: { includedItems: true },
    });

    return buildIncludedItemSuggestions(
      packages.map((pkg) => pkg.includedItems ?? []),
    );
  } catch {
    return [];
  }
});
