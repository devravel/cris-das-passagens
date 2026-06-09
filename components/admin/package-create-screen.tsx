"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PackageForm } from "@/components/admin/package-form";
import { Button } from "@/components/ui/button";

type PackageCreateScreenProps = {
  includedItemSuggestions: string[];
};

export function PackageCreateScreen({
  includedItemSuggestions,
}: PackageCreateScreenProps) {
  const router = useRouter();

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Novo pacote
          </h1>
          <p className="text-sm text-muted-foreground">
            Preencha as informações e visualize o card padronizado antes de publicar.
          </p>
        </div>
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => router.push("/admin/packages")}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Voltar
        </Button>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm sm:p-6">
        <PackageForm
          mode="create"
          includedItemSuggestions={includedItemSuggestions}
          onSuccess={() => {
            router.replace("/admin/packages?done=1");
            router.refresh();
          }}
        />
      </div>
    </section>
  );
}
