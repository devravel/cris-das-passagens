import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PromotionForm } from "@/components/admin/promotion-form";
import { toDatetimeLocalValue } from "@/lib/package/dates";
import { getAdminPromotionById } from "@/lib/promotion/queries";

type EditPromotionPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Editar Promoção | Admin",
  description: "Edite uma promoção no painel administrativo.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditPromotionPage({ params }: EditPromotionPageProps) {
  const { id } = await params;
  const promotion = await getAdminPromotionById(id);

  if (!promotion) {
    notFound();
  }

  return (
    <PromotionForm
      promotionId={promotion.id}
      initialValues={{
        name: promotion.name,
        slug: promotion.slug,
        image: promotion.image,
        ctaLabel: promotion.ctaLabel,
        startsAt: toDatetimeLocalValue(promotion.startsAt),
        endsAt: toDatetimeLocalValue(promotion.endsAt),
      }}
    />
  );
}
