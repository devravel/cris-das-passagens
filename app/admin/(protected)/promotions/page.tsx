import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";

import { PromotionsTable } from "@/components/admin/promotions-table";
import { Button } from "@/components/ui/button";
import { getAdminPromotions } from "@/lib/promotion/queries";

export const metadata: Metadata = {
  title: "Admin Promoções | Cris das Passagens",
  description: "Gerencie promoções com pop-up no painel administrativo.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminPromotionsPage() {
  const promotions = await getAdminPromotions();

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Promoções
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Cada promoção abre um pop-up no site 2,5 segundos depois que a página carrega (uma vez
            por visita). O botão do pop-up leva pra uma página só com os pacotes da promoção, e
            o item &ldquo;Promoção&rdquo; aparece no menu enquanto ela estiver no ar.
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/admin/promotions/new">
            <Plus className="size-4" aria-hidden />
            Nova promoção
          </Link>
        </Button>
      </header>

      <PromotionsTable promotions={promotions} />
    </section>
  );
}
