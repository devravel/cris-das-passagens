"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import type { ItineraryCategoryItem } from "@/app/admin/(protected)/roteiros/actions";
import { ItineraryForm } from "@/components/admin/itinerary-form";
import { Button } from "@/components/ui/button";
import type { ItineraryInput } from "@/lib/itinerary/schemas";

type ItineraryScreenProps = {
  mode: "create" | "edit";
  itineraryId?: string;
  initialValues?: Partial<ItineraryInput>;
  categories: ItineraryCategoryItem[];
};

export function ItineraryScreen({
  mode,
  itineraryId,
  initialValues,
  categories,
}: ItineraryScreenProps) {
  const router = useRouter();

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            {mode === "create" ? "Novo roteiro" : "Editar roteiro"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Preencha os blocos na ordem da página. A pré-visualização no fim mostra como fica no site.
          </p>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={() => router.push("/admin/roteiros")}>
          <ArrowLeft className="size-4" aria-hidden />
          Voltar
        </Button>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm sm:p-6">
        <ItineraryForm
          mode={mode}
          itineraryId={itineraryId}
          initialValues={initialValues}
          categories={categories}
          onSuccess={() => {
            router.push("/admin/roteiros");
            router.refresh();
          }}
        />
      </div>
    </section>
  );
}
