"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PackageForm } from "@/components/admin/package-form";
import { Button } from "@/components/ui/button";
import type { AdminPackageDetail } from "@/lib/package/queries";

type PackageEditScreenProps = {
  pkg: AdminPackageDetail;
};

export function PackageEditScreen({ pkg }: PackageEditScreenProps) {
  const router = useRouter();

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Editar pacote
          </h1>
          <p className="text-sm text-muted-foreground">
            Atualize informações, imagem e status com preview em tempo real.
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
          mode="edit"
          packageId={pkg.id}
          initialValues={{
            title: pkg.title,
            slug: pkg.slug,
            shortDescription: pkg.shortDescription,
            destination: pkg.destination,
            image: pkg.image,
            type: pkg.type,
            category: pkg.category,
            price: pkg.price,
            oldPrice: pkg.oldPrice,
            installmentText: pkg.installmentText ?? "",
            airline: pkg.airline ?? "",
            hotelName: pkg.hotelName ?? "",
            includesTickets: pkg.includesTickets,
            includesHotel: pkg.includesHotel,
            includesFlight: pkg.includesFlight,
            includesCruise: pkg.includesCruise,
            active: pkg.active,
            featured: pkg.featured,
          }}
          onSuccess={() => {
            router.push("/admin/packages");
            router.refresh();
          }}
        />
      </div>
    </section>
  );
}
