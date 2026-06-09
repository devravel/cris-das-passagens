"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { PackageForm } from "@/components/admin/package-form";
import { Button } from "@/components/ui/button";
import { DEFAULT_PACKAGE_DEPARTURE_CITY, packageTypeShowsDepartureCity } from "@/lib/package/departure-city";
import type { AdminPackageDetail } from "@/lib/package/queries";

type PackageEditScreenProps = {
  pkg: AdminPackageDetail;
  includedItemSuggestions: string[];
};

export function PackageEditScreen({
  pkg,
  includedItemSuggestions,
}: PackageEditScreenProps) {
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
          includedItemSuggestions={includedItemSuggestions}
          initialValues={{
            slug: pkg.slug,
            shortDescription: pkg.shortDescription ?? "",
            destination: pkg.destination,
            image: pkg.image,
            type: pkg.type,
            category: pkg.category,
            price: pkg.price,
            oldPrice: pkg.oldPrice,
            priceScope: pkg.priceScope,
            installmentText: pkg.installmentText ?? "",
            highlightInstallments: pkg.highlightInstallments,
            feesText: pkg.feesText ?? "",
            airline: pkg.airline ?? "",
            hotelName: pkg.hotelName ?? "",
            departureCity:
              pkg.departureCity ??
              (packageTypeShowsDepartureCity(pkg.type)
                ? DEFAULT_PACKAGE_DEPARTURE_CITY
                : ""),
            departureDate: pkg.departureDate ?? "",
            returnDate: pkg.returnDate ?? "",
            circuitStartDay: pkg.circuitStartDay ?? "",
            circuitDuration: pkg.circuitDuration ?? "",
            includedItems: pkg.includedItems,
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
