"use client";

import { useState } from "react";

import {
  PackageCard,
  toPackageCardDataFromPublicPackage,
} from "@/components/packages/package-card";
import { PackageDescriptionModal } from "@/components/packages/package-description-modal";
import type { PublicPackage } from "@/lib/package/queries";
import { isRichTextEmpty } from "@/lib/blog/content";
import { DEFAULT_DEPARTURE_CITY } from "@/config/packages-showcase";
import { cn } from "@/lib/utils";

type PublicPackageCardProps = {
  pkg: PublicPackage;
  departureCity?: string;
  priority?: boolean;
  layout?: "carousel" | "grid";
  variant?: "landing" | "listing";
  size?: "default" | "compact";
  /** Tipografia compacta um pouco maior em viewports <= 425px (hero em destaque). */
  narrowMobileTypography?: boolean;
  showChecklist?: boolean;
  showAirlineBadge?: boolean;
  /** Exibe CTA e modal de descrição completa (apenas /pacotes). */
  enableDescriptionModal?: boolean;
  className?: string;
};

export function PublicPackageCard({
  pkg,
  departureCity,
  priority = false,
  layout = "carousel",
  variant = layout === "carousel" ? "landing" : "listing",
  size = "default",
  narrowMobileTypography = false,
  showChecklist = false,
  showAirlineBadge = false,
  enableDescriptionModal = false,
  className,
}: PublicPackageCardProps) {
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const whatsAppPackageTitle = pkg.title || pkg.destination;
  const resolvedDepartureCity =
    pkg.departureCity?.trim() || departureCity || DEFAULT_DEPARTURE_CITY;
  const fullDescription = pkg.fullDescription?.trim() ?? "";
  const showDescriptionCta =
    enableDescriptionModal && !isRichTextEmpty(fullDescription);
  const cardLabel =
    pkg.type === "HOTEL"
      ? pkg.hotelName?.trim() || pkg.destination || pkg.title || "Pacote turístico"
      : pkg.destination || pkg.title || "Pacote turístico";

  return (
    <>
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
          narrowMobileTypography={narrowMobileTypography}
          showChecklist={showChecklist}
          showAirlineBadge={showAirlineBadge}
          packageSlug={variant === "landing" ? pkg.slug : undefined}
          whatsAppPackageTitle={whatsAppPackageTitle}
          showDescriptionCta={showDescriptionCta}
          onDescriptionClick={
            showDescriptionCta ? () => setDescriptionModalOpen(true) : undefined
          }
        />
      </div>

      {showDescriptionCta ? (
        <PackageDescriptionModal
          open={descriptionModalOpen}
          onOpenChange={setDescriptionModalOpen}
          packageName={cardLabel}
          shortDescription={pkg.shortDescription?.trim() || null}
          fullDescription={fullDescription}
        />
      ) : null}
    </>
  );
}
