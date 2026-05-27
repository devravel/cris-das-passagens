import {
  PackageCard,
  toPackageCardDataFromPublicPackage,
} from "@/components/packages/package-card";
import type { PublicPackage } from "@/lib/package/queries";
import { getPackageWhatsAppUrl } from "@/lib/package/whatsapp";
import { cn } from "@/lib/utils";

type PublicPackageCardProps = {
  pkg: PublicPackage;
  departureCity: string;
  priority?: boolean;
  layout?: "carousel" | "grid";
  variant?: "landing" | "listing";
  showChecklist?: boolean;
  className?: string;
};

export function PublicPackageCard({
  pkg,
  departureCity,
  priority = false,
  layout = "carousel",
  variant = layout === "carousel" ? "landing" : "listing",
  showChecklist = false,
  className,
}: PublicPackageCardProps) {
  const whatsAppHref = getPackageWhatsAppUrl(pkg);

  return (
    <div className={cn("group flex h-full w-full flex-col", className)}>
      <PackageCard
        data={toPackageCardDataFromPublicPackage(pkg)}
        departureCity={departureCity}
        layout={layout}
        priority={priority}
        variant={variant}
        showChecklist={showChecklist}
        packageSlug={variant === "landing" ? pkg.slug : undefined}
        whatsAppHref={whatsAppHref}
      />
    </div>
  );
}
