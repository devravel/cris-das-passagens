import type { Metadata } from "next";

import { PromotionForm } from "@/components/admin/promotion-form";

export const metadata: Metadata = {
  title: "Nova Promoção | Admin",
  description: "Crie uma promoção com pop-up no painel administrativo.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function NewPromotionPage() {
  return <PromotionForm />;
}
