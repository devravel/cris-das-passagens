import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ItineraryScreen } from "@/components/admin/itinerary-screen";
import { INCLUDED_ITEM_KEYS, isCustomIncludedItem, type IncludedItemKey } from "@/lib/itinerary/included-items";
import type { ItineraryHotel } from "@/lib/itinerary/schemas";
import { prisma } from "@/lib/prisma";

type EditRoteiroPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Editar Roteiro | Admin Roteiros",
  description: "Edite um roteiro no painel administrativo.",
  robots: { index: false, follow: false },
};

export default async function EditRoteiroPage({ params }: EditRoteiroPageProps) {
  const { id } = await params;

  const [itinerary, categories] = await Promise.all([
    prisma.itinerary.findUnique({
      where: { id },
      include: { categories: { select: { id: true } } },
    }),
    prisma.itineraryCategory.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true, order: true },
    }),
  ]);

  if (!itinerary) {
    notFound();
  }

  return (
    <ItineraryScreen
      mode="edit"
      itineraryId={itinerary.id}
      categories={categories}
      initialValues={{
        title: itinerary.title,
        slug: itinerary.slug,
        coverImage: itinerary.coverImage,
        gallery: itinerary.gallery,
        duration: itinerary.duration,
        priceFrom: itinerary.priceFrom ?? "",
        description: itinerary.description,
        includedItems: itinerary.includedItems.filter(
          (key) => INCLUDED_ITEM_KEYS.includes(key as IncludedItemKey) || isCustomIncludedItem(key),
        ),
        videoUrl: itinerary.videoUrl ?? "",
        mapUrl: itinerary.mapUrl ?? "",
        categoryIds: itinerary.categories.map((category) => category.id),
        itinerary: itinerary.itinerary ?? "",
        optionals: itinerary.optionals ?? "",
        included: itinerary.included ?? "",
        notIncluded: itinerary.notIncluded ?? "",
        payment: itinerary.payment ?? "",
        departures: itinerary.departures ?? "",
        insurance: itinerary.insurance ?? "",
        notes: itinerary.notes ?? "",
        hotels: Array.isArray(itinerary.hotels) ? (itinerary.hotels as ItineraryHotel[]) : [],
        published: itinerary.published,
        featuredOnHomepage: itinerary.featuredOnHomepage,
      }}
    />
  );
}
