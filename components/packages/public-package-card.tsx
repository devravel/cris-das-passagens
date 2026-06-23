"use client";

import { useState, type MouseEvent } from "react";

import {
  PackageCard,
  toPackageCardDataFromPublicPackage,
} from "@/components/packages/package-card";
import { PackageDescriptionModal } from "@/components/packages/package-description-modal";
import { PackageImageLightbox } from "@/components/packages/package-image-lightbox";
import type { PublicPackage } from "@/lib/package/queries";
import { isRichTextEmpty } from "@/lib/blog/content";
import { DEFAULT_DEPARTURE_CITY } from "@/config/packages-showcase";
import { cn } from "@/lib/utils";

function isPackageCardInteractiveTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return Boolean(target.closest("a, button"));
}

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
  const [imageLightboxOpen, setImageLightboxOpen] = useState(false);
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
  const imageSrc = pkg.image?.trim() ?? "";
  const hasImage = Boolean(imageSrc);
  const imageAlt =
    pkg.type === "HOTEL"
      ? [pkg.hotelName?.trim(), pkg.destination].filter(Boolean).join(" - ") ||
        "Pacote de hospedagem"
      : pkg.destination || pkg.title || "Pacote turístico";

  function handleCardClick(event: MouseEvent<HTMLDivElement>) {
    if (isPackageCardInteractiveTarget(event.target)) {
      return;
    }

    if (hasImage) {
      setImageLightboxOpen(true);
    }
  }

  return (
    <>
      <div
        className={cn(
          "group flex h-full flex-col",
          "w-full",
          hasImage && "cursor-pointer",
          className,
        )}
        onClick={handleCardClick}
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

      {hasImage ? (
        <PackageImageLightbox
          open={imageLightboxOpen}
          onOpenChange={setImageLightboxOpen}
          imageSrc={imageSrc}
          imageAlt={imageAlt}
        />
      ) : null}
    </>
  );
}
