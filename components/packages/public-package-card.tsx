"use client";

import { useEffect, useState, type MouseEvent } from "react";

import {
  PackageCard,
  toPackageCardDataFromPublicPackage,
} from "@/components/packages/package-card";
import { PackageCardHighlightModal } from "@/components/packages/package-card-highlight-modal";
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
  /** Tipografia maior só nos pacotes em destaque da home. */
  narrowMobileTypography?: boolean;
  showChecklist?: boolean;
  showAirlineBadge?: boolean;
  /** Exibe CTA e modal de descrição completa (apenas /pacotes). */
  enableDescriptionModal?: boolean;
  /** Abre o card em destaque ao carregar com ?destaque=slug (apenas /pacotes). */
  highlightedSlug?: string | null;
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
  highlightedSlug = null,
  className,
}: PublicPackageCardProps) {
  const [descriptionModalOpen, setDescriptionModalOpen] = useState(false);
  const [imageLightboxOpen, setImageLightboxOpen] = useState(false);
  const [cardHighlightModalOpen, setCardHighlightModalOpen] = useState(false);
  const [hasAutoOpenedHighlight, setHasAutoOpenedHighlight] = useState(false);
  const whatsAppPackageTitle = pkg.title || pkg.destination;
  const resolvedDepartureCity =
    pkg.departureCity?.trim() || departureCity || DEFAULT_DEPARTURE_CITY;
  const fullDescription = pkg.fullDescription?.trim() ?? "";
  const showDescriptionCta =
    enableDescriptionModal && !isRichTextEmpty(fullDescription);
  const showShareButton = enableDescriptionModal && variant === "listing";
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

  const packageCardElement = (
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
      packageSlug={variant === "landing" || showShareButton ? pkg.slug : undefined}
      whatsAppPackageTitle={whatsAppPackageTitle}
      showDescriptionCta={showDescriptionCta}
      showShareButton={showShareButton}
      onDescriptionClick={
        showDescriptionCta ? () => setDescriptionModalOpen(true) : undefined
      }
    />
  );

  const showCardHighlightModal = enableDescriptionModal && variant === "listing";

  function handleCardClick(event: MouseEvent<HTMLDivElement>) {
    if (isPackageCardInteractiveTarget(event.target)) {
      return;
    }

    if (showCardHighlightModal) {
      setCardHighlightModalOpen(true);
      return;
    }

    if (hasImage) {
      setImageLightboxOpen(true);
    }
  }

  useEffect(() => {
    if (!highlightedSlug || hasAutoOpenedHighlight || highlightedSlug !== pkg.slug) {
      return;
    }

    const openTimer = window.setTimeout(() => {
      if (showCardHighlightModal) {
        setCardHighlightModalOpen(true);
      } else if (hasImage) {
        setImageLightboxOpen(true);
      } else if (showDescriptionCta) {
        setDescriptionModalOpen(true);
      }

      setHasAutoOpenedHighlight(true);
    }, 500);

    return () => {
      window.clearTimeout(openTimer);
    };
  }, [
    hasAutoOpenedHighlight,
    hasImage,
    highlightedSlug,
    pkg.slug,
    showCardHighlightModal,
    showDescriptionCta,
  ]);

  return (
    <>
      <div
        className={cn(
          "group flex h-full flex-col",
          "w-full",
          (hasImage || showCardHighlightModal) && "cursor-pointer",
          className,
        )}
        onClick={handleCardClick}
      >
        {packageCardElement}
      </div>

      {showCardHighlightModal ? (
        <PackageCardHighlightModal
          open={cardHighlightModalOpen}
          onOpenChange={setCardHighlightModalOpen}
          packageName={cardLabel}
        >
          {packageCardElement}
        </PackageCardHighlightModal>
      ) : null}

      {showDescriptionCta ? (
        <PackageDescriptionModal
          open={descriptionModalOpen}
          onOpenChange={setDescriptionModalOpen}
          packageName={cardLabel}
          shortDescription={pkg.shortDescription?.trim() || null}
          fullDescription={fullDescription}
        />
      ) : null}

      {!showCardHighlightModal && hasImage ? (
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
