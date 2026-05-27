import { cache } from "react";

import { prisma } from "@/lib/prisma";
import type { PackageCategoryValue, PackageTypeValue } from "@/lib/package/constants";
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
  installmentText: string | null;
  highlightInstallments: boolean;
  airline: string | null;
  hotelName: string | null;
  includedItems: string[];
  includesTickets: boolean;
  includesHotel: boolean;
  includesFlight: boolean;
  includesCruise: boolean;
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
  installmentText: true,
  highlightInstallments: true,
  airline: true,
  hotelName: true,
  includedItems: true,
  includesTickets: true,
  includesHotel: true,
  includesFlight: true,
  includesCruise: true,
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
    installmentText: string | null;
    highlightInstallments: boolean;
    airline: string | null;
    hotelName: string | null;
    includedItems: string[];
    includesTickets: boolean;
    includesHotel: boolean;
    includesFlight: boolean;
    includesCruise: boolean;
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
    installmentText: pkg.installmentText,
    highlightInstallments: pkg.highlightInstallments,
    airline: pkg.airline,
    hotelName: pkg.hotelName,
    includedItems: pkg.includedItems ?? [],
    includesTickets: pkg.includesTickets,
    includesHotel: pkg.includesHotel,
    includesFlight: pkg.includesFlight,
    includesCruise: pkg.includesCruise,
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

export const getHomepagePackages = cache(async (): Promise<HomepagePackages> => {
  try {
    const packages = await prisma.package.findMany({
      where: {
        active: true,
        showOnLandingPage: true,
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: publicPackageSelect,
    });

    return splitPackagesByType(packages.map(mapPublicPackage));
  } catch {
    return {
      complete: [],
      flights: [],
      hotels: [],
      tickets: [],
      cruises: [],
    };
  }
});

export const getPackagesPageData = cache(async (): Promise<PackagesPageData> => {
  try {
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
  } catch {
    return {
      flights: [],
      complete: [],
      hotels: [],
      tickets: [],
      cruises: [],
    };
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
  installmentText: string | null;
  highlightInstallments: boolean;
  airline: string | null;
  hotelName: string | null;
  includedItems: string[];
  includesTickets: boolean;
  includesHotel: boolean;
  includesFlight: boolean;
  includesCruise: boolean;
  daysCount: number | null;
  nightsCount: number | null;
  showOnLandingPage: boolean;
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
  installmentText: true,
  highlightInstallments: true,
  airline: true,
  hotelName: true,
  includedItems: true,
  includesTickets: true,
  includesHotel: true,
  includesFlight: true,
  includesCruise: true,
  daysCount: true,
  nightsCount: true,
  showOnLandingPage: true,
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
    installmentText: string | null;
    highlightInstallments: boolean;
    airline: string | null;
    hotelName: string | null;
    includedItems: string[];
    includesTickets: boolean;
    includesHotel: boolean;
    includesFlight: boolean;
    includesCruise: boolean;
    daysCount: number | null;
    nightsCount: number | null;
    showOnLandingPage: boolean;
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
    installmentText: pkg.installmentText,
    highlightInstallments: pkg.highlightInstallments,
    airline: pkg.airline,
    hotelName: pkg.hotelName,
    includedItems: pkg.includedItems ?? [],
    includesTickets: pkg.includesTickets,
    includesHotel: pkg.includesHotel,
    includesFlight: pkg.includesFlight,
    includesCruise: pkg.includesCruise,
    daysCount: pkg.daysCount,
    nightsCount: pkg.nightsCount,
    showOnLandingPage: pkg.showOnLandingPage,
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
