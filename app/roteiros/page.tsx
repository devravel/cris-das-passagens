import type { Metadata } from "next";

import { ItineraryCatalog } from "@/components/itineraries/itinerary-catalog";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { getItinerariesGroupedByCategory } from "@/lib/itinerary/queries";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Roteiros de viagem",
  description:
    "Todos os roteiros da Cris das Passagens: viagens prontas com itinerário, hospedagem e saídas, organizadas por temporada e estilo.",
  path: "/roteiros",
  keywords: ["roteiros de viagem", "pacotes prontos", "viagens nacionais", "viagens internacionais", "Cris das Passagens"],
});

export const revalidate = 3600;

const breadcrumbs = [
  { name: "Início", path: "/" },
  { name: "Roteiros", path: "/roteiros" },
] as const;

/** Foto da faixa de topo — a mesma dos cards de serviço da hero. */
const BANNER_IMAGE = "/hero/servicos/pacotes.webp";

export default async function RoteirosPage() {
  const categories = await getItinerariesGroupedByCategory();

  return (
    <>
      <PageBreadcrumb items={breadcrumbs} />
      <ItineraryCatalog categories={categories} bannerImage={BANNER_IMAGE} />
    </>
  );
}
