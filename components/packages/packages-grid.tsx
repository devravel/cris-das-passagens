import type { ReactNode } from "react";

import { DEFAULT_DEPARTURE_CITY } from "@/config/packages-showcase";
import { PackageCardsCarousel } from "@/components/packages/package-cards-carousel";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type PackagesGridProps = {
  packages: PublicPackage[];
  departureCity?: string;
  highlightedSlug?: string | null;
  className?: string;
  emptyMessage?: string;
  header?: ReactNode;
  id?: string;
  role?: "tabpanel";
  "aria-labelledby"?: string;
};

export function PackagesGrid({
  packages,
  departureCity = DEFAULT_DEPARTURE_CITY,
  highlightedSlug = null,
  className,
  emptyMessage = "Nenhuma oferta disponível no momento.",
  header,
  id,
  role,
  "aria-labelledby": ariaLabelledBy,
}: PackagesGridProps) {
  if (packages.length === 0) {
    return (
      <p
        id={id}
        role={role}
        aria-labelledby={ariaLabelledBy}
        className="rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground sm:text-base"
      >
        {emptyMessage}
      </p>
    );
  }

  return (
    <div
      id={id}
      role={role}
      aria-labelledby={ariaLabelledBy}
      className={cn("min-w-0", className)}
    >
      <PackageCardsCarousel
        packages={packages}
        departureCity={departureCity}
        ariaLabel="Pacotes disponíveis"
        variant="listing"
        showChecklist
        showAirlineBadge
        anchorCards
        enableDescriptionModal
        highlightedSlug={highlightedSlug}
        header={header}
      />
    </div>
  );
}
