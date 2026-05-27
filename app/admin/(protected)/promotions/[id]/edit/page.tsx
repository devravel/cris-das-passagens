import { redirect } from "next/navigation";

type LegacyEditPromotionPageProps = {
  params: Promise<{ id: string }>;
};

export default async function LegacyEditPromotionPage({ params }: LegacyEditPromotionPageProps) {
  const { id } = await params;
  redirect(`/admin/packages/${id}/edit`);
}
