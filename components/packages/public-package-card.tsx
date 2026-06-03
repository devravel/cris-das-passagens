import {
  PackageCard,
  toPackageCardDataFromPublicPackage,
} from "@/components/packages/package-card";
import type { PublicPackage } from "@/lib/package/queries";
import { getPackageWhatsAppUrl } from "@/lib/package/whatsapp";
import { DEFAULT_DEPARTURE_CITY } from "@/config/packages-showcase";
import { cn } from "@/lib/utils";

type PublicPackageCardProps = {
  pkg: PublicPackage;
  departureCity?: string;
  priority?: boolean;
  layout?: "carousel" | "grid";
  variant?: "landing" | "listing";
  size?: "default" | "compact";
  showChecklist?: boolean;
  showAirlineBadge?: boolean;
  className?: string;
};

export function PublicPackageCard({
  pkg,
  departureCity,
  priority = false,
  layout = "carousel",
  variant = layout === "carousel" ? "landing" : "listing",
  size = "default",
  showChecklist = false,
  showAirlineBadge = false,
  className,
}: PublicPackageCardProps) {
  const whatsAppHref = getPackageWhatsAppUrl(pkg);
  const resolvedDepartureCity =
    pkg.departureCity?.trim() || departureCity || DEFAULT_DEPARTURE_CITY;

  return (
    <div
      className={cn(
        "group flex h-full flex-col",
        "w-full",
        className,
      )}
    >
      <PackageCard
        data={toPackageCardDataFromPublicPackage(pkg)}
        departureCity={resolvedDepartureCity}
        layout={layout}
        priority={priority}
        variant={variant}
        size={size}
        showChecklist={showChecklist}
        showAirlineBadge={showAirlineBadge}
        packageSlug={variant === "landing" ? pkg.slug : undefined}
        whatsAppHref={whatsAppHref}
      />
    </div>
  );
}
