import type { Metadata } from "next";

import { ItineraryScreen } from "@/components/admin/itinerary-screen";
import { getCurrentAdminSession } from "@/lib/auth/admin-auth";
import { getAdminUserById } from "@/lib/auth/admin-service";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Novo Roteiro | Admin Roteiros",
  description: "Crie um novo roteiro no painel administrativo.",
  robots: { index: false, follow: false },
};

export default async function NewRoteiroPage() {
  const session = await getCurrentAdminSession();

  const [categories, admin] = await Promise.all([
    prisma.itineraryCategory.findMany({
      orderBy: { order: "asc" },
      select: { id: true, name: true, slug: true, order: true },
    }),
    session ? getAdminUserById(session.adminId) : null,
  ]);

  // Vendedor já vem com quem está logado; o campo continua editável.
  return (
    <ItineraryScreen
      mode="create"
      categories={categories}
      initialValues={{ seller: admin?.name ?? "" }}
    />
  );
}
