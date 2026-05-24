"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PromotionForm } from "@/components/admin/promotion-form";
import { Button } from "@/components/ui/button";

export function PromotionCreateScreen() {
  const router = useRouter();

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Nova promoção
          </h1>
          <p className="text-sm text-muted-foreground">
            Cadastre campanhas visuais com imagem, link opcional e controle de ativação.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => router.push("/admin/promotions")}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar
        </Button>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm sm:p-6">
        <PromotionForm
          mode="create"
          onSuccess={() => {
            router.replace("/admin/promotions?done=1");
            router.refresh();
          }}
        />
      </div>
    </section>
  );
}
