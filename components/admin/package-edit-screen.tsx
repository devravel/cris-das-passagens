"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarPlus } from "lucide-react";

import { PackageForm } from "@/components/admin/package-form";
import { packageDurationInitialValues } from "@/components/admin/package-duration-fields";
import { PackageShareActions } from "@/components/packages/package-share-actions";
import { Button } from "@/components/ui/button";
import { DEFAULT_PACKAGE_DEPARTURE_CITY, packageTypeShowsDepartureCity } from "@/lib/package/departure-city";
import { inferInstallmentFieldsFromText } from "@/lib/package/payment";
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
  const addedAt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(pkg.createdAt));

  const legacyInstallment =
    pkg.installmentKind === "CUSTOM"
      ? inferInstallmentFieldsFromText(pkg.installmentText)
      : null;

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
          <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarPlus className="size-3.5" aria-hidden />
            Adicionado em{" "}
            <time dateTime={pkg.createdAt} className="font-medium text-foreground">
              {addedAt}
            </time>
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
        <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">
          Link para compartilhar
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Copie este link para usar nas artes do Instagram. Quem abrir será levado ao pacote em
          /pacotes.
        </p>
        <PackageShareActions title={pkg.title} slug={pkg.slug} className="mt-4" />
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm sm:p-6">
        <PackageForm
          mode="edit"
          packageId={pkg.id}
          includedItemSuggestions={includedItemSuggestions}
          initialValues={{
            slug: pkg.slug,
            shortDescription: pkg.shortDescription ?? "",
            fullDescription: pkg.fullDescription ?? "",
            destination: pkg.destination,
            image: pkg.image,
            type: pkg.type,
            category: pkg.category,
            price: pkg.price,
            oldPrice: pkg.oldPrice,
            priceScope: pkg.priceScope,
            installmentKind:
              legacyInstallment?.installmentKind ?? pkg.installmentKind,
            installmentCount:
              pkg.installmentCount ?? legacyInstallment?.installmentCount ?? 12,
            installmentAmount:
              pkg.installmentAmount ??
              legacyInstallment?.installmentAmount ??
              null,
            downPaymentAmount:
              pkg.downPaymentAmount ??
              legacyInstallment?.downPaymentAmount ??
              null,
            installmentText:
              legacyInstallment?.installmentText ?? pkg.installmentText ?? "",
            highlightInstallments: pkg.highlightInstallments,
            paymentMethods: pkg.paymentMethods,
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
            ...packageDurationInitialValues(pkg),
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
