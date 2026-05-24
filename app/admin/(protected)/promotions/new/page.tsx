import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { PromotionCreateScreen } from "@/components/admin/promotion-create-screen";

export const metadata: Metadata = {
  title: "Nova Promoção | Admin",
  description: "Crie uma nova promoção no painel administrativo.",
  robots: {
    index: false,
    follow: false,
  },
};

type NewPromotionPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewPromotionPage({ searchParams }: NewPromotionPageProps) {
  const params = (await searchParams) ?? {};

  if (params.done === "1") {
    redirect("/admin/promotions");
  }

  return <PromotionCreateScreen />;
}
