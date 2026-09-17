import type { Metadata } from "next";

import { ItineraryScreen } from "@/components/admin/itinerary-screen";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Novo Roteiro | Admin Roteiros",
  description: "Crie um novo roteiro no painel administrativo.",
  robots: { index: false, follow: false },
};

export default async function NewRoteiroPage() {
  const categories = await prisma.itineraryCategory.findMany({
    orderBy: { order: "asc" },
    select: { id: true, name: true, slug: true, order: true },
  });

  return <ItineraryScreen mode="create" categories={categories} />;
}
