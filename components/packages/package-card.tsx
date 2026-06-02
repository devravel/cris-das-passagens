import { Anchor, BedDouble, Check, Luggage, Plane, Ticket } from "lucide-react";

import { BlogImage } from "@/components/blog/blog-image";
import { LandingSaibaMaisAction } from "@/components/packages/landing-package-card-actions";
import { PackageWhatsAppCta } from "@/components/packages/package-whatsapp-cta";
import {
  PACKAGE_IMAGE_ASPECT_RATIO,
  PACKAGE_TYPE_CARD_LABELS,
} from "@/lib/package/constants";
import { isHighlightedChecklistItem } from "@/lib/package/checklist";
import { formatPackagePrice } from "@/lib/package/format";
import type { PackageCardData } from "@/lib/package/schemas";
import { cardShadowClassName } from "@/lib/card-styles";
import { cn } from "@/lib/utils";

export type PackageCardVariant = "landing" | "listing" | "preview";

const packageBadgeClassName =
  "inline-flex items-center justify-center rounded-full bg-amber-400/95 px-3 py-1.5 text-center text-[11px] leading-none font-semibold tracking-wide text-amber-950 shadow-sm whitespace-nowrap sm:text-xs";

const compactBadgeClassName =
  "inline-flex items-center justify-center rounded-full bg-amber-400/95 px-2 py-1 text-center text-[9px] leading-none font-semibold tracking-wide text-amber-950 shadow-sm whitespace-nowrap lg:text-[10px] xl:text-[11px]";

const compactActionButtonClassName = cn(
  "inline-flex h-6 min-h-6 w-full items-center justify-center gap-0.5 rounded-md px-1 py-0.5 text-[8px] leading-[1.1] font-semibold lg:h-[1.625rem] lg:px-1.5 lg:text-[9px] xl:text-[10px]",
  "transition-[transform,box-shadow,background-color] duration-200",
  "hover:-translate-y-px hover:shadow-md active:translate-y-0",
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
);

function calculateDiscountPercent(oldPrice: number | null, currentPrice: number): number | null {
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
  packageSlug?: string;
  whatsAppHref?: string;
  className?: string;
};

function CardTypeLabel({ type, compact = false }: { type: PackageCardData["type"]; compact?: boolean }) {
  const Icon =
    type === "FLIGHT"
      ? Plane
      : type === "HOTEL"
        ? BedDouble
        : type === "TICKET"
          ? Ticket
          : type === "CRUISE"
            ? Anchor
            : Luggage;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-medium text-muted-foreground",
        compact ? "mb-1 text-[10px] lg:text-[11px] xl:text-xs" : "mb-1.5 text-xs sm:text-sm",
      )}
    >
      <Icon className={cn("shrink-0", compact ? "size-3" : "size-4")} strokeWidth={1.75} aria-hidden />
      {PACKAGE_TYPE_CARD_LABELS[type]}
    </span>
  );
}

function DiscountBadge({
  oldPrice,
  currentPrice,
  compact = false,
}: {
  oldPrice: number | null;
  currentPrice: number;
  compact?: boolean;
}) {
  const discount = calculateDiscountPercent(oldPrice, currentPrice);
  
  if (!discount) return null;
  
  return (
    <span className={compact ? compactBadgeClassName : packageBadgeClassName}>
      Até {discount}% de desconto!
    </span>
  );
}

function IncludedItemsList({
  items,
  detailed = false,
}: {
  items: string[];
  detailed?: boolean;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <ul
      className={cn(
        detailed ? "mt-3 space-y-2 border-t border-border/50 pt-3" : "mt-2.5 space-y-1.5",
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
                highlighted ? "font-medium text-emerald-700" : "text-foreground/85",
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

function PriceBlock({
  data,
  variant,
  compact = false,
}: {
  data: PackageCardData;
  variant: PackageCardVariant;
  compact?: boolean;
}) {
  const hideOldPrice = variant === "landing";

  if (data.highlightInstallments && data.installmentText) {
    return (
      <div className="space-y-0.5">
        <p className={cn("text-muted-foreground", compact ? "text-[10px] lg:text-xs" : "text-xs sm:text-sm")}>
          A partir de
        </p>
        <p
          className={cn(
            "font-heading font-semibold leading-none tracking-tight text-foreground",
            compact ? "text-base lg:text-lg xl:text-xl" : "text-[1.35rem] sm:text-2xl",
          )}
        >
          {data.installmentText}
        </p>
      </div>
    );
  }

  const priceLabel = data.type === "HOTEL" ? "Diária a partir de" : "A partir de";

  return (
    <div className="space-y-0.5">
      <p className={cn("text-muted-foreground", compact ? "text-[10px] lg:text-xs" : "text-xs sm:text-sm")}>
        {priceLabel}
      </p>
      <p
        className={cn(
          "font-heading font-semibold leading-none tracking-tight text-foreground",
          compact ? "text-base lg:text-lg xl:text-xl" : "text-[1.35rem] sm:text-2xl",
        )}
      >
        {formatPackagePrice(data.price)}
      </p>
      {!hideOldPrice && data.oldPrice != null && data.oldPrice > data.price ? (
        <p className={cn("text-muted-foreground line-through", compact ? "text-[10px] lg:text-xs" : "text-xs sm:text-sm")}>
          {formatPackagePrice(data.oldPrice)}
        </p>
      ) : null}
    </div>
  );
}

function PriceFooter({
  data,
  variant,
  withTopBorder = true,
  compact = false,
}: {
  data: PackageCardData;
  variant: PackageCardVariant;
  withTopBorder?: boolean;
  compact?: boolean;
}) {
  const isDetailed = variant === "listing" || variant === "preview";
  const footerClassName = cn(
    withTopBorder && "border-t border-border/70",
    "text-center",
    compact
      ? "px-2 py-1"
      : isDetailed
        ? "px-4 py-2.5 sm:px-5 sm:py-3"
        : "px-3.5 py-2.5 sm:px-4 sm:py-3",
  );

  if (data.highlightInstallments && data.installmentText) {
    return (
      <div className={footerClassName}>
        <p className={cn("font-medium text-muted-foreground", compact ? "text-[9px] leading-snug lg:text-[10px] xl:text-xs" : "text-[11px] sm:text-xs")}>
          Total por pessoa: {formatPackagePrice(data.price)}{" "}
          <span className="font-bold text-foreground">| Taxas inclusas</span>
        </p>
      </div>
    );
  }

  if (data.installmentText) {
    return (
      <div className={footerClassName}>
        <p className={cn("text-foreground", compact ? "text-[10px] leading-snug lg:text-xs" : "text-xs sm:text-sm")}>
          {data.installmentText}
        </p>
      </div>
    );
  }

  return (
    <div className={footerClassName} aria-hidden>
      <p className={cn("text-transparent select-none", compact ? "text-[10px] leading-snug lg:text-xs" : "text-xs sm:text-sm")}>
        -
      </p>
    </div>
  );
}

function PricingSection({
  data,
  variant,
  whatsAppHref,
  packageSlug,
  packageTitle,
  compact = false,
}: {
  data: PackageCardData;
  variant: PackageCardVariant;
  whatsAppHref?: string;
  packageSlug?: string;
  packageTitle?: string;
  compact?: boolean;
}) {
  const isLanding = variant === "landing";
  const isDetailed = variant === "listing" || variant === "preview";
  const showFooter = true;
  const showLandingSaibaMais = isLanding && packageSlug && whatsAppHref;
  const pricePadding = compact
    ? "px-2.5 py-1.5 lg:py-2"
    : isDetailed
      ? "px-4 py-2.5 sm:px-5 sm:py-3"
      : "px-3.5 py-2.5 sm:px-4 sm:py-3";
  const actionPadding = compact
    ? "px-2.5 py-1.5"
    : isDetailed
      ? "px-4 py-3 sm:px-5 sm:py-3.5 lg:px-5"
      : "px-3.5 py-3 sm:px-4 sm:py-3.5";
  const stackedActionsPadding = compact
    ? "px-2.5 py-1.5"
    : "px-3.5 py-2.5 sm:px-4 sm:py-3";

  return (
    <>
      <div className={pricePadding}>
        <PriceBlock data={data} variant={variant} compact={compact} />
      </div>

      {showLandingSaibaMais ? (
        <div
          className={cn(
            stackedActionsPadding,
            "flex flex-col gap-1",
            showFooter && "border-b border-border/70",
          )}
        >
          <PackageWhatsAppCta
            href={whatsAppHref}
            className={compact ? compactActionButtonClassName : undefined}
            iconClassName={compact ? "size-2.5 lg:size-3" : undefined}
          />
          <LandingSaibaMaisAction
            slug={packageSlug}
            packageTitle={packageTitle}
            unstyled
            buttonClassName={compact ? compactActionButtonClassName : undefined}
          />
        </div>
      ) : whatsAppHref ? (
        <div
          className={cn(actionPadding, showFooter && "border-b border-border/70")}
        >
          <PackageWhatsAppCta
            href={whatsAppHref}
            className={compact ? compactActionButtonClassName : undefined}
            iconClassName={compact ? "size-2.5 lg:size-3" : undefined}
          />
        </div>
      ) : null}

      {showFooter ? (
        <PriceFooter
          data={data}
          variant={variant}
          compact={compact}
          withTopBorder={!whatsAppHref && !showLandingSaibaMais}
        />
      ) : null}
    </>
  );
}

function ListingHeading({ data }: { data: PackageCardData }) {
  const destination = data.destination || data.title || "Destino";

  return (
    <h3 className="line-clamp-2 font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
      {destination}
    </h3>
  );
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
  packageSlug,
  whatsAppHref,
  className,
}: PackageCardProps) {
  const resolvedImageSrc = imageSrc || data.image;
  const isLanding = variant === "landing";
  const isDetailed = variant === "listing" || variant === "preview";
  const isCompact = size === "compact" && isLanding;
  const showOrigin = data.type !== "HOTEL" && data.type !== "TICKET";
  const showHotelName = isDetailed && (data.type === "HOTEL" || data.type === "CRUISE") && data.hotelName;
  const showChecklistBlock = showChecklist && data.includedItems.length > 0;
  const cardLabel = data.destination || data.title || "Pacote turístico";
  const imageAlt = data.destination || data.title || "Pacote turístico";

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
        <div className={cn("relative overflow-hidden bg-muted/30", isCompact ? "aspect-[5/3]" : "aspect-[4/3]")}>
          {resolvedImageSrc ? (
            <BlogImage
              src={resolvedImageSrc}
              alt={imageAlt}
              fill
              priority={priority}
              sizes={
                layout === "grid"
                  ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 288px"
                  : layout === "preview"
                    ? "(max-width: 768px) 100vw, 420px"
                    : isCompact
                      ? "(max-width: 640px) 85vw, (max-width: 1024px) 33vw, 220px"
                      : "(max-width: 640px) 240px, (max-width: 1024px) 260px, 288px"
              }
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              containerClassName="absolute inset-0"
            />
          ) : (
            <div
              className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground"
              style={{ aspectRatio: PACKAGE_IMAGE_ASPECT_RATIO }}
            >
              Imagem do pacote
            </div>
          )}

          <div className={cn("absolute z-10 flex max-w-[calc(100%-1.25rem)] flex-wrap items-center justify-end gap-1.5", isCompact ? "top-1.5 right-1.5" : "top-2.5 right-2.5")}>
            <DiscountBadge oldPrice={data.oldPrice} currentPrice={data.price} compact={isCompact} />
          </div>
        </div>

        <div
          className={cn(
            "flex flex-1 flex-col",
            isCompact
              ? "px-2.5 pt-2 pb-1.5"
              : isDetailed
                ? "px-4 pt-3.5 pb-3.5 sm:px-5 sm:pt-4 sm:pb-4"
                : "px-3.5 pt-3 pb-3 sm:px-4 sm:pt-3.5 sm:pb-3.5",
          )}
        >
          <CardTypeLabel type={data.type} compact={isCompact} />

          {isLanding ? (
            <h3
              className={cn(
                "line-clamp-2 font-heading font-semibold tracking-tight text-foreground",
                isCompact
                  ? "text-xs leading-snug lg:text-sm xl:text-[0.9375rem]"
                  : "text-[0.95rem] sm:text-base",
              )}
            >
              {data.destination || data.title || "Destino"}
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
                isCompact ? "mt-0.5 text-[10px] leading-snug lg:text-xs" : "mt-1 text-xs sm:text-sm",
              )}
            >
              Saindo de{" "}
              <span className="font-medium text-brand underline decoration-brand/30 underline-offset-2">
                {departureCity}
              </span>
            </p>
          ) : null}

          {showHotelName ? (
            <p className="mt-1.5 line-clamp-1 text-xs font-medium tracking-wide text-muted-foreground uppercase sm:text-sm">
              {data.hotelName}
            </p>
          ) : null}

          {isDetailed && data.type === "FLIGHT" && data.airline ? (
            <p className="mt-1.5 text-xs font-medium text-foreground/80 sm:text-sm">{data.airline}</p>
          ) : null}

          {isDetailed && data.shortDescription ? (
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground/80">
              {data.shortDescription}
            </p>
          ) : null}

          {showChecklistBlock ? (
            <IncludedItemsList items={data.includedItems} detailed={isDetailed} />
          ) : null}

          {isDetailed && data.type === "FLIGHT" && !showChecklistBlock ? (
            <p className="mt-2 text-xs text-muted-foreground sm:text-sm">Ida e volta</p>
          ) : null}
        </div>

        <div className="mt-auto">
          <PricingSection
            data={data}
            variant={variant}
            whatsAppHref={whatsAppHref}
            packageSlug={packageSlug}
            packageTitle={cardLabel}
            compact={isCompact}
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
    destination: pkg.destination,
    image: pkg.image,
    type: pkg.type,
    price: pkg.price,
    oldPrice: pkg.oldPrice,
    installmentText: pkg.installmentText,
    highlightInstallments: pkg.highlightInstallments,
    airline: pkg.airline,
    hotelName: pkg.hotelName,
    includedItems: pkg.includedItems,
    featured: pkg.featured,
  };
}
