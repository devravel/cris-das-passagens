import "server-only";

import { cache } from "react";

import { prisma } from "@/lib/prisma";
import { FEATURED_HOME_ITINERARIES_LIMIT } from "@/lib/itinerary/constants";
import type { ItineraryHotel } from "@/lib/itinerary/schemas";

const publicSelect = {
  id: true,
  title: true,
  slug: true,
  coverImage: true,
  gallery: true,
  duration: true,
  priceFrom: true,
  description: true,
  includedItems: true,
  videoUrl: true,
  mapUrl: true,
  itinerary: true,
  optionals: true,
  included: true,
  notIncluded: true,
  payment: true,
  departures: true,
  insurance: true,
  notes: true,
  hotels: true,
  createdAt: true,
  updatedAt: true,
  categories: { select: { id: true, name: true, slug: true }, orderBy: { order: "asc" as const } },
} as const;

type RawItinerary = NonNullable<
  Awaited<ReturnType<typeof prisma.itinerary.findFirst<{ select: typeof publicSelect }>>>
>;

export type PublicItinerary = Omit<RawItinerary, "hotels"> & { hotels: ItineraryHotel[] };

function toPublic(row: RawItinerary): PublicItinerary {
  return { ...row, hotels: Array.isArray(row.hotels) ? (row.hotels as ItineraryHotel[]) : [] };
}

export const getPublishedItineraryBySlug = cache(async (slug: string) => {
  const row = await prisma.itinerary.findFirst({
    where: { slug, published: true },
    select: publicSelect,
  });

  return row ? toPublic(row) : null;
});

export async function getFeaturedHomeItineraries() {
  const rows = await prisma.itinerary.findMany({
    where: { published: true, featuredOnHomepage: true },
    orderBy: { createdAt: "desc" },
    take: FEATURED_HOME_ITINERARIES_LIMIT,
    select: publicSelect,
  });

  return rows.map(toPublic);
}

/** Categorias na ordem do painel, só com roteiros publicados (categoria vazia some). */
export async function getItinerariesGroupedByCategory() {
  const categories = await prisma.itineraryCategory.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      itineraries: {
        where: { published: true },
        orderBy: { title: "asc" },
        select: { id: true, title: true, slug: true, coverImage: true, duration: true },
      },
    },
  });

  return categories.filter((category) => category.itineraries.length > 0);
}
