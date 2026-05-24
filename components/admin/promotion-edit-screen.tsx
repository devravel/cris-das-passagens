"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PromotionForm } from "@/components/admin/promotion-form";
import { Button } from "@/components/ui/button";

type PromotionEditScreenProps = {
  promotion: {
    id: string;
    image: string;
    title: string | null;
    link: string | null;
    active: boolean;
  };
};

export function PromotionEditScreen({ promotion }: PromotionEditScreenProps) {
  const router = useRouter();

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Editar promocao
          </h1>
          <p className="text-sm text-muted-foreground">
            Atualize imagem, titulo, link e status da campanha.
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
          mode="edit"
          promotionId={promotion.id}
          initialValues={{
            image: promotion.image,
            title: promotion.title ?? "",
            link: promotion.link ?? "",
            active: promotion.active,
          }}
          onSuccess={() => {
            router.push("/admin/promotions");
            router.refresh();
          }}
        />
      </div>
    </section>
  );
}
