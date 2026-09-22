import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ItineraryDetail } from "@/components/itineraries/itinerary-detail";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { normalizeBlogImageUrl } from "@/lib/blog/image-url";
import { getPublishedItineraryBySlug } from "@/lib/itinerary/queries";
import { prisma } from "@/lib/prisma";
import { createMetadata, createNoIndexMetadata } from "@/lib/seo";

type RoteiroPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 3600;

export async function generateStaticParams() {
  const rows = await prisma.itinerary.findMany({ where: { published: true }, select: { slug: true } });
  return rows.map((row) => ({ slug: row.slug }));
}

export async function generateMetadata({ params }: RoteiroPageProps): Promise<Metadata> {
  const { slug } = await params;
  const itinerary = await getPublishedItineraryBySlug(slug);

  if (!itinerary) {
    return createNoIndexMetadata({
      title: "Roteiro não encontrado",
      description: "O roteiro solicitado não está disponível.",
    });
  }

  return createMetadata({
    title: itinerary.title,
    description: itinerary.description.slice(0, 300),
    path: `/roteiros/${itinerary.slug}`,
    ogImage: {
      url: normalizeBlogImageUrl(itinerary.coverImage),
      alt: itinerary.title,
      width: 1200,
      height: 630,
    },
    keywords: [itinerary.title, "roteiro de viagem", ...itinerary.categories.map((c) => c.name)],
  });
}

export default async function RoteiroPage({ params }: RoteiroPageProps) {
  const { slug } = await params;
  const itinerary = await getPublishedItineraryBySlug(slug);

  if (!itinerary) {
    notFound();
  }

  const breadcrumbs = [
    { name: "Início", path: "/" },
    { name: "Roteiros", path: "/roteiros" },
    { name: itinerary.title, path: `/roteiros/${itinerary.slug}` },
  ] as const;

  return (
    <>
      <PageBreadcrumb items={breadcrumbs} />
      <ItineraryDetail itinerary={itinerary} />
    </>
  );
}
