import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PromotionEditScreen } from "@/components/admin/promotion-edit-screen";
import { prisma } from "@/lib/prisma";

type EditPromotionPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Editar Promocao | Admin",
  description: "Edite uma promocao no painel administrativo.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditPromotionPage({ params }: EditPromotionPageProps) {
  const { id } = await params;

  const promotion = await prisma.promotion.findUnique({
    where: { id },
    select: {
      id: true,
      image: true,
      title: true,
      link: true,
      active: true,
    },
  });

  if (!promotion) {
    notFound();
  }

  return <PromotionEditScreen promotion={promotion} />;
}
