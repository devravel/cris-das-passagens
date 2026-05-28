import { DEFAULT_DEPARTURE_CITY } from "@/config/packages-showcase";
import { PublicPackageCard } from "@/components/packages/public-package-card";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type PackagesGridProps = {
  packages: PublicPackage[];
  departureCity?: string;
  className?: string;
  emptyMessage?: string;
  id?: string;
  role?: "tabpanel";
  "aria-labelledby"?: string;
};

export function PackagesGrid({
  packages,
  departureCity = DEFAULT_DEPARTURE_CITY,
  className,
  emptyMessage = "Nenhuma oferta disponível no momento.",
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
    <ul
      id={id}
      role={role}
      aria-labelledby={ariaLabelledBy}
      className={cn(
        "grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:justify-items-center sm:gap-5 lg:grid-cols-3 lg:justify-items-center lg:gap-6 xl:grid-cols-4 xl:justify-items-stretch xl:gap-6",
        className,
      )}
    >
      {packages.map((pkg, index) => (
        <li
          key={pkg.id}
          id={`pacote-${pkg.slug}`}
          tabIndex={-1}
          className="package-card-anchor flex w-full scroll-mt-28 items-stretch outline-none"
        >
          <PublicPackageCard
            pkg={pkg}
            departureCity={departureCity}
            layout="grid"
            variant="listing"
            priority={index < 4}
            showChecklist
            className="h-full"
          />
        </li>
      ))}
    </ul>
  );
}
