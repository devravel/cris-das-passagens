import { cache } from "react";

import { prisma } from "@/lib/prisma";
import type { PackageCategoryValue, PackageTypeValue } from "@/lib/package/constants";
import { normalizePackageImageUrl } from "@/lib/package/image-url";

export type PublicPackage = {
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  destination: string;
  image: string;
  type: PackageTypeValue;
  category: PackageCategoryValue | null;
  price: number;
  oldPrice: number | null;
  installmentText: string | null;
  airline: string | null;
  hotelName: string | null;
  includesTickets: boolean;
  includesHotel: boolean;
  includesFlight: boolean;
  includesCruise: boolean;
  featured: boolean;
};

export type HomepagePackages = {
  complete: PublicPackage[];
  flights: PublicPackage[];
  hotels: PublicPackage[];
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
  airline: true,
  hotelName: true,
  includesTickets: true,
  includesHotel: true,
  includesFlight: true,
  includesCruise: true,
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
    shortDescription: string;
    destination: string;
    image: string;
    type: string;
    category: string | null;
    price: { toNumber?: () => number } | number;
    oldPrice: { toNumber?: () => number } | number | null;
    installmentText: string | null;
    airline: string | null;
    hotelName: string | null;
    includesTickets: boolean;
    includesHotel: boolean;
    includesFlight: boolean;
    includesCruise: boolean;
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
    airline: pkg.airline,
    hotelName: pkg.hotelName,
    includesTickets: pkg.includesTickets,
    includesHotel: pkg.includesHotel,
    includesFlight: pkg.includesFlight,
    includesCruise: pkg.includesCruise,
    featured: pkg.featured,
  };
}

export const getHomepagePackages = cache(async (): Promise<HomepagePackages> => {
  try {
    const packages = await prisma.package.findMany({
      where: {
        active: true,
        type: { in: ["PACKAGE_COMPLETE", "FLIGHT", "HOTEL"] },
      },
      orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
      select: publicPackageSelect,
    });

    const mapped = packages.map(mapPublicPackage);

    return {
      complete: mapped.filter((pkg) => pkg.type === "PACKAGE_COMPLETE"),
      flights: mapped.filter((pkg) => pkg.type === "FLIGHT"),
      hotels: mapped.filter((pkg) => pkg.type === "HOTEL"),
    };
  } catch {
    return {
      complete: [],
      flights: [],
      hotels: [],
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
  shortDescription: string;
  destination: string;
  image: string;
  type: PackageTypeValue;
  category: PackageCategoryValue | null;
  price: number;
  oldPrice: number | null;
  installmentText: string | null;
  airline: string | null;
  hotelName: string | null;
  includesTickets: boolean;
  includesHotel: boolean;
  includesFlight: boolean;
  includesCruise: boolean;
  active: boolean;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
};

export const getAdminPackages = cache(async (): Promise<AdminPackageListItem[]> => {
  try {
    const packages = await prisma.package.findMany({
      orderBy: { createdAt: "desc" },
      select: {
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
        airline: true,
        hotelName: true,
        includesTickets: true,
        includesHotel: true,
        includesFlight: true,
        includesCruise: true,
        active: true,
        featured: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return packages.map((pkg) => ({
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
      airline: pkg.airline,
      hotelName: pkg.hotelName,
      includesTickets: pkg.includesTickets,
      includesHotel: pkg.includesHotel,
      includesFlight: pkg.includesFlight,
      includesCruise: pkg.includesCruise,
      active: pkg.active,
      featured: pkg.featured,
      createdAt: pkg.createdAt.toISOString(),
      updatedAt: pkg.updatedAt.toISOString(),
    }));
  } catch {
    return [];
  }
});

export type AdminPackageDetail = AdminPackageListItem & {
  shortDescription: string;
  installmentText: string | null;
  airline: string | null;
  hotelName: string | null;
  includesTickets: boolean;
  includesHotel: boolean;
  includesFlight: boolean;
  includesCruise: boolean;
};

export async function getAdminPackageById(id: string): Promise<AdminPackageDetail | null> {
  const pkg = await prisma.package.findUnique({
    where: { id },
    select: {
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
      airline: true,
      hotelName: true,
      includesTickets: true,
      includesHotel: true,
      includesFlight: true,
      includesCruise: true,
      active: true,
      featured: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!pkg) {
    return null;
  }

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
    airline: pkg.airline,
    hotelName: pkg.hotelName,
    includesTickets: pkg.includesTickets,
    includesHotel: pkg.includesHotel,
    includesFlight: pkg.includesFlight,
    includesCruise: pkg.includesCruise,
    active: pkg.active,
    featured: pkg.featured,
    createdAt: pkg.createdAt.toISOString(),
    updatedAt: pkg.updatedAt.toISOString(),
  };
}
