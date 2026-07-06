import {
  Anchor,
  BedDouble,
  Check,
  Luggage,
  Plane,
  Route,
  Ticket,
} from "lucide-react";

import { StorageImage } from "@/components/ui/storage-image";
import { LandingSaibaMaisAction } from "@/components/packages/landing-package-card-actions";
import { PackageCardShareButton } from "@/components/packages/package-card-share-button";
import { PackageWhatsAppButton } from "@/components/packages/package-whatsapp-button";
import {
  PACKAGE_IMAGE_ASPECT_RATIO,
  PACKAGE_PRICE_SCOPE_LABELS,
  PACKAGE_TYPE_CARD_LABELS,
} from "@/lib/package/constants";
import { isHighlightedChecklistItem } from "@/lib/package/checklist";
import { formatPackageTravelDate } from "@/lib/package/dates";
import { formatPackagePrice } from "@/lib/package/format";
import type { PackageCardData } from "@/lib/package/schemas";
import { cardShadowClassName } from "@/lib/card-styles";
import { cn } from "@/lib/utils";

export type PackageCardVariant = "landing" | "listing" | "preview";

const packageBadgeClassName =
  "inline-flex items-center justify-center rounded-l-none rounded-r-full bg-amber-400/95 py-1.5 pl-3 pr-3 text-center text-[11px] leading-none font-semibold tracking-wide text-amber-950 shadow-sm whitespace-nowrap sm:text-xs";

const compactBadgeClassName =
  "inline-flex items-center justify-center rounded-l-none rounded-r-full bg-amber-400/95 py-1 pl-2.5 pr-2.5 text-center text-[9px] leading-none font-semibold tracking-wide text-amber-950 shadow-sm whitespace-nowrap lg:text-[10px] xl:text-[11px]";

const airlineBadgeClassName =
  "inline-flex max-w-full min-w-0 items-center justify-center truncate rounded-full bg-brand px-2.5 py-1.5 text-center text-[11px] leading-tight font-semibold tracking-wide text-brand-foreground shadow-sm sm:px-3 sm:text-xs sm:leading-none";

const compactAirlineBadgeClassName =
  "inline-flex max-w-full min-w-0 items-center justify-center truncate rounded-full bg-brand px-2 py-1 text-center text-[10px] leading-tight font-semibold tracking-wide text-brand-foreground shadow-sm min-[360px]:px-2.5 min-[360px]:text-[11px] sm:text-xs sm:leading-none";

const compactActionButtonClassName = cn(
  "inline-flex h-6 min-h-6 w-full items-center justify-center gap-0.5 rounded-md px-1 py-0.5 text-[8px] leading-[1.1] font-semibold lg:h-[1.625rem] lg:px-1.5 lg:text-[9px] xl:text-[10px]",
  "transition-[transform,box-shadow,background-color] duration-200",
  "hover:-translate-y-px hover:shadow-md active:translate-y-0",
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
);

function compactNarrowMobileActionButtonClassName(enabled: boolean) {
  return enabled
    ? "max-[425px]:h-8 max-[425px]:min-h-8 max-[425px]:px-2 max-[425px]:text-[11px]"
    : undefined;
}

function compactNarrowMobileTypeClassName(enabled: boolean) {
  return enabled ? "max-[425px]:text-xs" : undefined;
}

function compactNarrowMobileTitleClassName(enabled: boolean) {
  return enabled ? "max-[425px]:text-base" : undefined;
}

function compactNarrowMobilePriceClassName(enabled: boolean) {
  return enabled ? "max-[425px]:text-xl" : undefined;
}

function compactNarrowMobileFooterClassName(enabled: boolean) {
  return enabled ? "max-[425px]:text-xs" : undefined;
}

function compactNarrowMobileBadgeClassName(enabled: boolean) {
  return enabled ? "max-[425px]:text-[11px]" : undefined;
}

function compactNarrowMobileAirlineBadgeClassName(enabled: boolean) {
  return enabled ? "max-[425px]:text-xs" : undefined;
}

function calculateDiscountPercent(
  oldPrice: number | null,
  currentPrice: number,
): number | null {
  if (!oldPrice || oldPrice <= currentPrice) return null;

  const discount = ((oldPrice - currentPrice) / oldPrice) * 100;
  const roundedDiscount = Math.round(discount / 5) * 5;

  if (roundedDiscount < 5) return null;
  if (roundedDiscount > 40) return 40;

  return roundedDiscount;
}

type PackageCardProps = {
  data: PackageCardData;
  departureCity?: string;
  imageSrc?: string;
  layout?: "carousel" | "grid" | "preview";
  priority?: boolean;
  variant?: PackageCardVariant;
  size?: "default" | "compact";
  showChecklist?: boolean;
  showAirlineBadge?: boolean;
  packageSlug?: string;
  whatsAppPackageTitle?: string;
  narrowMobileTypography?: boolean;
  showDescriptionCta?: boolean;
  onDescriptionClick?: () => void;
  showShareButton?: boolean;
  className?: string;
};

function CardTypeLabel({
  type,
  compact = false,
  dense = false,
  narrowMobileTypography = false,
}: {
  type: PackageCardData["type"];
  compact?: boolean;
  dense?: boolean;
  narrowMobileTypography?: boolean;
}) {
  const Icon =
    type === "FLIGHT"
      ? Plane
      : type === "HOTEL"
        ? BedDouble
        : type === "TICKET"
          ? Ticket
          : type === "CRUISE"
            ? Anchor
            : type === "CIRCUIT"
              ? Route
              : Luggage;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium text-muted-foreground",
        compact
          ? cn(
              "mb-1 text-[10px] lg:text-[11px] xl:text-xs",
              compactNarrowMobileTypeClassName(narrowMobileTypography),
            )
          : dense
            ? "mb-1 text-xs sm:text-sm"
            : "mb-1.5 text-xs sm:text-sm",
      )}
    >
      <Icon
        className={cn(
          "shrink-0",
          compact
            ? cn("size-3", narrowMobileTypography && "max-[425px]:size-4")
            : "size-4",
        )}
        strokeWidth={1.75}
        aria-hidden
      />
      {PACKAGE_TYPE_CARD_LABELS[type]}
    </span>
  );
}

function DiscountBadge({
  oldPrice,
  currentPrice,
  compact = false,
  narrowMobileTypography = false,
}: {
  oldPrice: number | null;
  currentPrice: number;
  compact?: boolean;
  narrowMobileTypography?: boolean;
}) {
  const discount = calculateDiscountPercent(oldPrice, currentPrice);

  if (!discount) return null;

  return (
    <span
      className={cn(
        compact ? compactBadgeClassName : packageBadgeClassName,
        compact && compactNarrowMobileBadgeClassName(narrowMobileTypography),
      )}
    >
      Até {discount}% de desconto!
    </span>
  );
}

function AirlineBadge({
  airline,
  compact = false,
  narrowMobileTypography = false,
}: {
  airline: string | null;
  compact?: boolean;
  narrowMobileTypography?: boolean;
}) {
  const label = airline?.trim();

  if (!label) return null;

  const text = `Voando ${label}`;

  return (
    <span
      title={text}
      className={cn(
        compact ? compactAirlineBadgeClassName : airlineBadgeClassName,
        compact &&
          compactNarrowMobileAirlineBadgeClassName(narrowMobileTypography),
      )}
    >
      {text}
    </span>
  );
}

function IncludedItemsList({
  items,
  detailed = false,
  tight = false,
}: {
  items: string[];
  detailed?: boolean;
  tight?: boolean;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul
      className={cn(
        detailed
          ? tight
            ? "mt-2 space-y-1 border-t border-border/50 pt-2"
            : "mt-3 space-y-2 border-t border-border/50 pt-3"
          : "mt-2.5 space-y-1.5",
      )}
      aria-label="Itens inclusos"
    >
      {items.map((item, index) => {
        const highlighted = detailed && isHighlightedChecklistItem(item);

        return (
          <li
            key={`${index}-${item}`}
            className={cn(
              "flex items-start gap-2.5",
              detailed ? "text-sm leading-snug" : "text-xs sm:text-sm",
            )}
          >
            <Check
              className={cn(
                "mt-0.5 shrink-0",
                detailed ? "size-4" : "size-3.5",
                highlighted ? "text-emerald-600" : "text-brand",
              )}
              strokeWidth={2.25}
              aria-hidden
            />
            <span
              className={cn(
                "min-w-0 leading-snug break-words",
                highlighted
                  ? "font-medium text-emerald-700"
                  : "text-foreground/85",
              )}
            >
              {item}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function PriceScopeLabel({
  priceScope,
  compact = false,
  narrowMobileTypography = false,
}: {
  priceScope: PackageCardData["priceScope"];
  compact?: boolean;
  narrowMobileTypography?: boolean;
}) {
  if (!priceScope) {
    return null;
  }

  return (
    <p
      className={cn(
        "text-muted-foreground",
        compact
          ? cn(
              "text-[10px] lg:text-xs",
              compactNarrowMobileTypeClassName(narrowMobileTypography),
            )
          : "text-xs sm:text-sm",
      )}
    >
      {PACKAGE_PRICE_SCOPE_LABELS[priceScope]}
    </p>
  );
}

function PriceBlock({
  data,
  variant,
  compact = false,
  narrowMobileTypography = false,
}: {
  data: PackageCardData;
  variant: PackageCardVariant;
  compact?: boolean;
  narrowMobileTypography?: boolean;
}) {
  const isListing = variant === "listing";
  const hideOldPrice = variant === "landing";
  const showOldPrice =
    !hideOldPrice && data.oldPrice != null && data.oldPrice > data.price;

  const labelClassName = cn(
    "text-muted-foreground",
    compact
      ? cn(
          "text-[10px] lg:text-xs",
          compactNarrowMobileTypeClassName(narrowMobileTypography),
        )
      : "text-xs sm:text-sm",
  );

  const priceClassName = cn(
    "font-heading font-semibold leading-none tracking-tight text-foreground",
    compact
      ? cn(
          "text-base lg:text-lg xl:text-xl",
          compactNarrowMobilePriceClassName(narrowMobileTypography),
        )
      : "text-[1.35rem] sm:text-2xl",
  );

  const oldPriceClassName = cn(
    "text-muted-foreground line-through",
    compact
      ? cn(
          "text-[10px] lg:text-xs",
          compactNarrowMobileTypeClassName(narrowMobileTypography),
        )
      : "text-xs sm:text-sm",
  );

  if (data.highlightInstallments && data.installmentText) {
    return (
      <div className="space-y-0.5">
        <p className={labelClassName}>A partir de</p>
        <p className={priceClassName}>{data.installmentText}</p>
        <PriceScopeLabel
          priceScope={data.priceScope}
          compact={compact}
          narrowMobileTypography={narrowMobileTypography}
        />
      </div>
    );
  }

  const priceLabel =
    data.type === "HOTEL" ? "Diária a partir de" : "A partir de";

  return (
    <div className="space-y-0.5">
      <p className={labelClassName}>{priceLabel}</p>
      {isListing && showOldPrice ? (
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className={priceClassName}>{formatPackagePrice(data.price)}</p>
          <p className={oldPriceClassName}>
            {formatPackagePrice(data.oldPrice!)}
          </p>
        </div>
      ) : (
        <>
          <p className={priceClassName}>{formatPackagePrice(data.price)}</p>
          {showOldPrice ? (
            <p className={oldPriceClassName}>
              {formatPackagePrice(data.oldPrice!)}
            </p>
          ) : null}
        </>
      )}
      <PriceScopeLabel
        priceScope={data.priceScope}
        compact={compact}
        narrowMobileTypography={narrowMobileTypography}
      />
    </div>
  );
}

function PriceFooter({
  data,
  variant,
  withTopBorder = true,
  compact = false,
  narrowMobileTypography = false,
}: {
  data: PackageCardData;
  variant: PackageCardVariant;
  withTopBorder?: boolean;
  compact?: boolean;
  narrowMobileTypography?: boolean;
}) {
  const isDetailed = variant === "listing" || variant === "preview";
  const isListing = variant === "listing";
  const footerClassName = cn(
    withTopBorder && "border-t border-border/70",
    "text-center",
    compact
      ? "px-2 py-1"
      : isListing
        ? "px-3.5 py-1 sm:px-4 sm:py-1.5 lg:px-5 lg:py-2"
        : isDetailed
          ? "px-4 py-2.5 sm:px-5 sm:py-3"
          : "px-3.5 py-2.5 sm:px-4 sm:py-3",
  );
  const footerTextClassName = cn(
    compact
      ? cn(
          "text-[10px] leading-snug lg:text-xs",
          compactNarrowMobileFooterClassName(narrowMobileTypography),
        )
      : "text-xs sm:text-sm",
  );
  const feesSuffix = data.feesText ? <> | {data.feesText}</> : null;

  if (data.highlightInstallments && data.installmentText) {
    return (
      <div className={footerClassName}>
        <p
          className={cn(
            "font-medium text-muted-foreground",
            compact
              ? cn(
                  "text-[9px] leading-snug lg:text-[10px] xl:text-xs",
                  compactNarrowMobileFooterClassName(narrowMobileTypography),
                )
              : "text-[11px] sm:text-xs",
          )}
        >
          Total da cotação: {formatPackagePrice(data.price)}
          {feesSuffix}
        </p>
      </div>
    );
  }

  if (data.installmentText || data.feesText) {
    return (
      <div className={footerClassName}>
        <p className={cn("text-foreground", footerTextClassName)}>
          {data.installmentText}
          {feesSuffix}
        </p>
      </div>
    );
  }

  return (
    <div className={footerClassName} aria-hidden>
      <p className={cn("text-transparent select-none", footerTextClassName)}>
        -
      </p>
    </div>
  );
}

function PricingSection({
  data,
  variant,
  whatsAppPackageTitle,
  packageSlug,
  packageTitle,
  compact = false,
  narrowMobileTypography = false,
  showShareButton = false,
}: {
  data: PackageCardData;
  variant: PackageCardVariant;
  whatsAppPackageTitle?: string;
  packageSlug?: string;
  packageTitle?: string;
  compact?: boolean;
  narrowMobileTypography?: boolean;
  showShareButton?: boolean;
}) {
  const isLanding = variant === "landing";
  const isDetailed = variant === "listing" || variant === "preview";
  const showFooter = true;
  const showLandingSaibaMais = isLanding && packageSlug && whatsAppPackageTitle;
  const isListing = variant === "listing";
  const showListingShare =
    isListing && showShareButton && Boolean(packageSlug) && Boolean(packageTitle);
  const pricePadding = compact
    ? "px-2.5 py-1.5 lg:py-2"
    : isListing
      ? "px-3.5 py-1 sm:px-4 sm:py-1.5 lg:px-5 lg:py-2"
      : isDetailed
        ? "px-4 py-2.5 sm:px-5 sm:py-3"
        : "px-3.5 py-2.5 sm:px-4 sm:py-3";
  const actionPadding = compact
    ? "px-2.5 py-1.5"
    : isListing
      ? "px-3.5 py-1.5 sm:px-4 sm:py-2 lg:px-5 lg:py-2.5"
      : isDetailed
        ? "px-4 py-3 sm:px-5 sm:py-3.5 lg:px-5"
        : "px-3.5 py-3 sm:px-4 sm:py-3.5";
  const stackedActionsPadding = compact
    ? "px-2.5 py-1.5"
    : "px-3.5 py-2.5 sm:px-4 sm:py-3";

  return (
    <>
      <div className={pricePadding}>
        <PriceBlock
          data={data}
          variant={variant}
          compact={compact}
          narrowMobileTypography={narrowMobileTypography}
        />
      </div>

      {showLandingSaibaMais ? (
        <div
          className={cn(
            stackedActionsPadding,
            "flex flex-col gap-1",
            showFooter && "border-b border-border/70",
          )}
        >
          <PackageWhatsAppButton
            packageTitle={whatsAppPackageTitle}
            className={
              compact
                ? cn(
                    compactActionButtonClassName,
                    compactNarrowMobileActionButtonClassName(
                      narrowMobileTypography,
                    ),
                  )
                : undefined
            }
            iconClassName={
              compact
                ? cn(
                    "size-2.5 lg:size-3",
                    narrowMobileTypography && "max-[425px]:size-3.5",
                  )
                : undefined
            }
          />
          <LandingSaibaMaisAction
            slug={packageSlug}
            packageTitle={packageTitle}
            unstyled
            buttonClassName={
              compact
                ? cn(
                    compactActionButtonClassName,
                    compactNarrowMobileActionButtonClassName(
                      narrowMobileTypography,
                    ),
                  )
                : undefined
            }
          />
        </div>
      ) : whatsAppPackageTitle ? (
        <div
          className={cn(
            actionPadding,
            showFooter && "border-b border-border/70",
            showListingShare && "flex flex-col gap-1.5 sm:gap-2",
          )}
        >
          <PackageWhatsAppButton
            packageTitle={whatsAppPackageTitle}
            className={
              compact
                ? cn(
                    compactActionButtonClassName,
                    compactNarrowMobileActionButtonClassName(
                      narrowMobileTypography,
                    ),
                  )
                : undefined
            }
            iconClassName={
              compact
                ? cn(
                    "size-2.5 lg:size-3",
                    narrowMobileTypography && "max-[425px]:size-3.5",
                  )
                : undefined
            }
          />
          {showListingShare ? (
            <PackageCardShareButton title={packageTitle!} slug={packageSlug!} />
          ) : null}
        </div>
      ) : showListingShare ? (
        <div
          className={cn(
            actionPadding,
            showFooter && "border-b border-border/70",
          )}
        >
          <PackageCardShareButton title={packageTitle!} slug={packageSlug!} />
        </div>
      ) : null}

      {showFooter ? (
        <PriceFooter
          data={data}
          variant={variant}
          compact={compact}
          narrowMobileTypography={narrowMobileTypography}
          withTopBorder={!whatsAppPackageTitle && !showLandingSaibaMais}
        />
      ) : null}
    </>
  );
}

function packageCardMetaClassName({
  compact = false,
  tight = false,
  narrowMobileTypography = false,
}: {
  compact?: boolean;
  tight?: boolean;
  narrowMobileTypography?: boolean;
}) {
  return cn(
    "text-muted-foreground",
    compact
      ? cn(
          "mt-2.5 text-[10px] leading-snug lg:mt-3 lg:text-xs",
          compactNarrowMobileTypeClassName(narrowMobileTypography),
        )
      : tight
        ? "mt-2 text-xs sm:text-sm"
        : "mt-3 text-xs sm:text-sm",
  );
}

function PackageTravelDates({
  departureDate,
  returnDate,
  compact = false,
  tight = false,
  narrowMobileTypography = false,
}: {
  departureDate: string | null;
  returnDate: string | null;
  compact?: boolean;
  tight?: boolean;
  narrowMobileTypography?: boolean;
}) {
  const ida = formatPackageTravelDate(departureDate);
  const volta = formatPackageTravelDate(returnDate);

  if (!ida && !volta) {
    return null;
  }

  return (
    <div
      className={cn(
        "space-y-0.5",
        packageCardMetaClassName({ compact, tight, narrowMobileTypography }),
      )}
    >
      {ida ? <p>Ida: {ida}</p> : null}
      {volta ? <p>Volta: {volta}</p> : null}
    </div>
  );
}

function PackageCircuitInfo({
  circuitStartDay,
  circuitDuration,
  compact = false,
  tight = false,
  narrowMobileTypography = false,
}: {
  circuitStartDay: string | null;
  circuitDuration: string | null;
  compact?: boolean;
  tight?: boolean;
  narrowMobileTypography?: boolean;
}) {
  const inicio = circuitStartDay?.trim() || null;
  const duracao = circuitDuration?.trim() || null;

  if (!inicio && !duracao) {
    return null;
  }

  const parts: string[] = [];

  if (inicio) {
    parts.push(`Início: ${inicio}`);
  }

  if (duracao) {
    parts.push(`Duração: ${duracao}`);
  }

  return (
    <div
      className={packageCardMetaClassName({
        compact,
        tight,
        narrowMobileTypography,
      })}
    >
      <p>{parts.join(" | ")}</p>
    </div>
  );
}

function ListingHeading({ data }: { data: PackageCardData }) {
  const heading =
    data.type === "HOTEL"
      ? data.hotelName?.trim() || data.destination || data.title || "Hotel"
      : data.destination || data.title || "Destino";

  return (
    <h3 className="line-clamp-2 font-heading text-lg font-semibold tracking-tight text-foreground lg:text-xl">
      {heading}
    </h3>
  );
}

function getCardPrimaryHeading(data: PackageCardData): string {
  if (data.type === "HOTEL") {
    return data.hotelName?.trim() || data.destination || data.title || "Hotel";
  }

  return data.destination || data.title || "Destino";
}

const layoutClassNames = {
  carousel: "w-full min-w-0",
  grid: "mx-auto w-full max-w-none sm:max-w-[288px] xl:mx-0 xl:max-w-none",
  preview: "w-full",
} as const;

export function PackageCard({
  data,
  departureCity = "São Paulo",
  imageSrc,
  layout = "carousel",
  priority = false,
  variant = "listing",
  size = "default",
  showChecklist = false,
  showAirlineBadge = false,
  packageSlug,
  whatsAppPackageTitle,
  narrowMobileTypography = false,
  showDescriptionCta = false,
  onDescriptionClick,
  showShareButton = false,
  className,
}: PackageCardProps) {
  const resolvedImageSrc = imageSrc || data.image;
  const isLanding = variant === "landing";
  const isListing = variant === "listing";
  const isDetailed = isListing || variant === "preview";
  const isCompact = size === "compact" && isLanding;
  const isHotelPackage = data.type === "HOTEL";
  const showOrigin =
    data.type !== "HOTEL" && data.type !== "TICKET" && data.type !== "CIRCUIT";
  const showDestinationAsSecondary =
    isHotelPackage && Boolean(data.destination?.trim());
  const showCruiseShipName =
    isDetailed && data.type === "CRUISE" && Boolean(data.hotelName?.trim());
  const showAirlineBadgeOnCard =
    showAirlineBadge &&
    (data.type === "FLIGHT" || data.type === "PACKAGE_COMPLETE") &&
    Boolean(data.airline?.trim());
  const showChecklistBlock = showChecklist && data.includedItems.length > 0;
  const cardLabel = isHotelPackage
    ? data.hotelName?.trim() ||
      data.destination ||
      data.title ||
      "Pacote turístico"
    : data.destination || data.title || "Pacote turístico";
  const imageAlt = isHotelPackage
    ? [data.hotelName?.trim(), data.destination].filter(Boolean).join(" - ") ||
      "Pacote de hospedagem"
    : data.destination || data.title || "Pacote turístico";
  const imageSizes =
    layout === "grid"
      ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 288px"
      : layout === "preview"
        ? "(max-width: 768px) 100vw, 420px"
        : isListing
          ? "(max-width: 640px) 90vw, (max-width: 1024px) 33vw, 32vw"
          : isCompact
            ? "(max-width: 640px) 85vw, (max-width: 1024px) 33vw, 220px"
            : "(max-width: 640px) 240px, (max-width: 1024px) 260px, 288px";

  return (
    <article
      aria-label={cardLabel}
      className={cn(
        "flex h-full flex-col overflow-hidden bg-card ring-1 ring-border/60",
        isCompact ? "rounded-xl" : "rounded-2xl",
        layoutClassNames[layout],
        cardShadowClassName,
        (isLanding || isDetailed) &&
          "transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <div className="flex h-full flex-col">
        <div className="relative">
          <div
            className={cn(
              "relative w-full overflow-hidden bg-muted/30",
              isCompact && "aspect-[5/3]",
              isListing &&
                "h-[8.75rem] sm:h-[9rem] md:h-[9.25rem] lg:h-[10rem]",
              layout === "preview" &&
                "h-[7rem] sm:h-[7.5rem] lg:h-[9.25rem] xl:h-[10rem]",
              !isCompact &&
                !isListing &&
                layout !== "preview" &&
                "aspect-[4/3]",
            )}
          >
            {resolvedImageSrc ? (
              <>
                <StorageImage
                  src={resolvedImageSrc}
                  alt=""
                  fill
                  sizes={imageSizes}
                  aria-hidden
                  className="scale-110 object-cover blur-2xl brightness-[0.92] saturate-[1.12]"
                  containerClassName="absolute inset-0"
                />
                <StorageImage
                  src={resolvedImageSrc}
                  alt={imageAlt}
                  fill
                  priority={priority}
                  sizes={imageSizes}
                  style={{ objectFit: "contain" }}
                  className="z-[1] object-center transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  containerClassName="absolute inset-0 z-[1]"
                />
              </>
            ) : (
              <div
                className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground"
                style={
                  layout === "preview"
                    ? undefined
                    : { aspectRatio: PACKAGE_IMAGE_ASPECT_RATIO }
                }
              >
                Imagem do pacote
              </div>
            )}

            <div
              className={cn(
                "absolute z-10 flex min-w-0 max-w-[calc(100%-0.75rem)] items-center justify-start sm:max-w-[calc(100%-1.25rem)]",
                isCompact ? "top-1.5 left-0" : "top-2 left-0 sm:top-2.5",
              )}
            >
              <DiscountBadge
                oldPrice={data.oldPrice}
                currentPrice={data.price}
                compact={isCompact}
                narrowMobileTypography={narrowMobileTypography}
              />
            </div>
          </div>

          {showAirlineBadgeOnCard ? (
            <div
              className={cn(
                "absolute z-20 flex min-w-0 max-w-[calc(100%-0.75rem)] translate-y-1/2 justify-end sm:max-w-[calc(100%-1.25rem)]",
                isCompact
                  ? "right-1.5 bottom-0"
                  : "right-2 bottom-0 sm:right-2.5",
              )}
            >
              <AirlineBadge
                airline={data.airline}
                compact={isCompact}
                narrowMobileTypography={narrowMobileTypography}
              />
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "flex flex-1 flex-col",
            isCompact
              ? "px-2.5 pt-2 pb-1.5"
              : isListing
                ? "px-3.5 pt-2 pb-2 sm:px-4 sm:pt-2.5 sm:pb-2.5 lg:px-5 lg:pt-3 lg:pb-3"
                : isDetailed
                  ? "px-4 pt-3.5 pb-3.5 sm:px-5 sm:pt-4 sm:pb-4"
                  : "px-3.5 pt-3 pb-3 sm:px-4 sm:pt-3.5 sm:pb-3.5",
          )}
        >
          <CardTypeLabel
            type={data.type}
            compact={isCompact}
            dense={isListing}
            narrowMobileTypography={narrowMobileTypography}
          />

          {isLanding ? (
            <h3
              className={cn(
                "line-clamp-2 font-heading font-semibold tracking-tight text-foreground",
                isCompact
                  ? cn(
                      "text-xs leading-snug lg:text-sm xl:text-[0.9375rem]",
                      compactNarrowMobileTitleClassName(narrowMobileTypography),
                    )
                  : "text-[0.95rem] sm:text-base",
              )}
            >
              {getCardPrimaryHeading(data)}
            </h3>
          ) : isDetailed ? (
            <ListingHeading data={data} />
          ) : (
            <h3 className="line-clamp-2 font-heading text-base font-semibold tracking-tight text-foreground sm:text-[1.05rem]">
              {data.title || "Título do pacote"}
            </h3>
          )}

          {showOrigin ? (
            <p
              className={cn(
                "text-muted-foreground",
                isCompact
                  ? cn(
                      "mt-0.5 text-[10px] leading-snug lg:text-xs",
                      compactNarrowMobileTypeClassName(narrowMobileTypography),
                    )
                  : "mt-1 text-xs sm:text-sm",
              )}
            >
              Saindo de{" "}
              <span className="font-medium text-brand underline decoration-brand/30 underline-offset-2">
                {departureCity}
              </span>
            </p>
          ) : null}

          {data.type === "CIRCUIT" ? (
            <PackageCircuitInfo
              circuitStartDay={data.circuitStartDay}
              circuitDuration={data.circuitDuration}
              compact={isCompact}
              tight={isListing}
              narrowMobileTypography={narrowMobileTypography}
            />
          ) : (
            <PackageTravelDates
              departureDate={data.departureDate}
              returnDate={data.returnDate}
              compact={isCompact}
              tight={isListing}
              narrowMobileTypography={narrowMobileTypography}
            />
          )}

          {showDestinationAsSecondary ? (
            <p className="mt-1.5 line-clamp-1 text-xs font-medium tracking-wide text-muted-foreground uppercase sm:text-sm">
              {data.destination}
            </p>
          ) : null}

          {showCruiseShipName ? (
            <p className="mt-1.5 line-clamp-1 text-xs font-medium tracking-wide text-muted-foreground uppercase sm:text-sm">
              {data.hotelName}
            </p>
          ) : null}

          {isDetailed && data.shortDescription ? (
            <p
              className={cn(
                "text-sm leading-relaxed text-foreground/80",
                isListing ? "mt-1.5 line-clamp-2" : "mt-2 line-clamp-3",
              )}
            >
              {data.shortDescription}
            </p>
          ) : null}

          {showDescriptionCta && onDescriptionClick ? (
            <button
              type="button"
              onClick={onDescriptionClick}
              className={cn(
                "cursor-pointer mt-3 mb-2 inline-flex max-w-full self-start text-left text-[10px] font-bold tracking-[0.12em] text-brand uppercase underline underline-offset-4 transition-colors hover:text-brand/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:text-[11px]",
                isListing ? "mt-3 mb-2" : "mt-4 mb-3",
              )}
              aria-label={`Ver descrição completa de ${cardLabel}`}
            >
              DESCRIÇÃO AQUI
            </button>
          ) : null}

          {showChecklistBlock ? (
            <IncludedItemsList
              items={data.includedItems}
              detailed={isDetailed}
              tight={isListing}
            />
          ) : null}

          {isDetailed && data.type === "FLIGHT" && !showChecklistBlock ? (
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
              Ida e volta
            </p>
          ) : null}
        </div>

        <div className="mt-auto">
          <PricingSection
            data={data}
            variant={variant}
            whatsAppPackageTitle={whatsAppPackageTitle}
            packageSlug={packageSlug}
            packageTitle={cardLabel}
            compact={isCompact}
            narrowMobileTypography={narrowMobileTypography}
            showShareButton={showShareButton}
          />
        </div>
      </div>
    </article>
  );
}

export function toPackageCardDataFromPublicPackage(
  pkg: import("@/lib/package/queries").PublicPackage,
): PackageCardData {
  return {
    title: pkg.title,
    shortDescription: pkg.shortDescription,
    fullDescription: pkg.fullDescription,
    destination: pkg.destination,
    image: pkg.image,
    type: pkg.type,
    price: pkg.price,
    oldPrice: pkg.oldPrice,
    priceScope: pkg.priceScope,
    installmentText: pkg.installmentText,
    highlightInstallments: pkg.highlightInstallments,
    feesText: pkg.feesText,
    airline: pkg.airline,
    hotelName: pkg.hotelName,
    includedItems: pkg.includedItems,
    featured: pkg.featured,
    departureDate: pkg.departureDate,
    returnDate: pkg.returnDate,
    circuitStartDay: pkg.circuitStartDay,
    circuitDuration: pkg.circuitDuration,
  };
}
