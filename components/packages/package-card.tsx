import { Anchor, BedDouble, Check, Luggage, Plane, Sparkles, Ticket } from "lucide-react";

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

type PackageCardProps = {
  data: PackageCardData;
  departureCity?: string;
  imageSrc?: string;
  layout?: "carousel" | "grid" | "preview";
  priority?: boolean;
  variant?: PackageCardVariant;
  showChecklist?: boolean;
  packageSlug?: string;
  whatsAppHref?: string;
  className?: string;
};

function CardTypeLabel({ type }: { type: PackageCardData["type"] }) {
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
    <span className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground sm:text-sm">
      <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
      {PACKAGE_TYPE_CARD_LABELS[type]}
    </span>
  );
}

function DurationBadge({
  daysCount,
  nightsCount,
}: {
  daysCount: number | null;
  nightsCount: number | null;
}) {
  const parts: string[] = [];

  if (daysCount != null) {
    parts.push(`${daysCount} ${daysCount === 1 ? "dia" : "dias"}`);
  }

  if (nightsCount != null) {
    parts.push(`${nightsCount} ${nightsCount === 1 ? "noite" : "noites"}`);
  }

  if (parts.length === 0) {
    return null;
  }

  return (
    <span className="rounded-full bg-amber-400/95 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-amber-950 shadow-sm uppercase sm:text-[11px]">
      {parts.join(" | ")}
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

function PriceBlock({ data, variant }: { data: PackageCardData; variant: PackageCardVariant }) {
  const hideOldPrice = variant === "landing";

  if (data.highlightInstallments && data.installmentText) {
    return (
      <div className="space-y-0.5">
        <p className="text-xs text-muted-foreground sm:text-sm">A partir de</p>
        <p className="font-heading text-[1.35rem] font-semibold leading-none tracking-tight text-foreground sm:text-2xl">
          {data.installmentText}
        </p>
      </div>
    );
  }

  const priceLabel = data.type === "HOTEL" ? "Diária a partir de" : "A partir de";

  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground sm:text-sm">{priceLabel}</p>
      <p className="font-heading text-[1.35rem] font-semibold leading-none tracking-tight text-foreground sm:text-2xl">
        {formatPackagePrice(data.price)}
      </p>
      {!hideOldPrice && data.oldPrice != null && data.oldPrice > data.price ? (
        <p className="text-xs text-muted-foreground line-through sm:text-sm">
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
}: {
  data: PackageCardData;
  variant: PackageCardVariant;
  withTopBorder?: boolean;
}) {
  const isDetailed = variant === "listing" || variant === "preview";
  const footerClassName = cn(
    withTopBorder && "border-t border-border/70",
    "text-center",
    isDetailed ? "px-4 py-2.5 sm:px-5 sm:py-3" : "px-3.5 py-2.5 sm:px-4 sm:py-3",
  );

  if (data.highlightInstallments && data.installmentText) {
    return (
      <div className={footerClassName}>
        <p className="text-[11px] font-medium text-muted-foreground sm:text-xs">
          Total por pessoa: {formatPackagePrice(data.price)}{" "}
          <span className="font-bold text-foreground">| Taxas inclusas</span>
        </p>
      </div>
    );
  }

  if (data.installmentText) {
    return (
      <div className={footerClassName}>
        <p className="text-xs text-foreground sm:text-sm">{data.installmentText}</p>
      </div>
    );
  }

  return null;
}

function PricingSection({
  data,
  variant,
  whatsAppHref,
  packageSlug,
  packageTitle,
}: {
  data: PackageCardData;
  variant: PackageCardVariant;
  whatsAppHref?: string;
  packageSlug?: string;
  packageTitle?: string;
}) {
  const isLanding = variant === "landing";
  const isDetailed = variant === "listing" || variant === "preview";
  const showFooter = Boolean(data.installmentText);
  const showLandingSaibaMais = isLanding && packageSlug && whatsAppHref;
  const pricePadding = isDetailed ? "px-4 py-2.5 sm:px-5 sm:py-3" : "px-3.5 py-2.5 sm:px-4 sm:py-3";
  const actionPadding = isDetailed ? "px-4 py-3 sm:px-5 sm:py-3.5 lg:px-5" : "px-3.5 py-3 sm:px-4 sm:py-3.5";

  return (
    <>
      <div className={pricePadding}>
        <PriceBlock data={data} variant={variant} />
      </div>

      {whatsAppHref ? (
        <div
          className={cn(
            actionPadding,
            showLandingSaibaMais && "pb-2 sm:pb-2.5",
            showFooter && !showLandingSaibaMais && "border-b border-border/70",
          )}
        >
          <PackageWhatsAppCta href={whatsAppHref} />
        </div>
      ) : null}

      {showLandingSaibaMais ? (
        <LandingSaibaMaisAction
          slug={packageSlug}
          packageTitle={packageTitle}
          className={cn("border-t-0 pt-0", showFooter && "border-b border-border/70")}
        />
      ) : null}

      {showFooter ? (
        <PriceFooter
          data={data}
          variant={variant}
          withTopBorder={!whatsAppHref && !showLandingSaibaMais}
        />
      ) : null}
    </>
  );
}

function ListingHeading({ data }: { data: PackageCardData }) {
  const destination = data.destination || data.title || "Destino";

  return (
    <>
      <h3 className="line-clamp-2 font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
        {destination}
      </h3>
      {data.title && data.title !== data.destination ? (
        <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{data.title}</p>
      ) : null}
    </>
  );
}

const layoutClassNames = {
  carousel:
    "w-[min(100%,240px)] shrink-0 sm:w-[250px] md:w-[260px] lg:w-[272px] xl:w-[288px]",
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
  showChecklist = false,
  packageSlug,
  whatsAppHref,
  className,
}: PackageCardProps) {
  const resolvedImageSrc = imageSrc || data.image;
  const isLanding = variant === "landing";
  const isDetailed = variant === "listing" || variant === "preview";
  const showOrigin = data.type !== "HOTEL" && data.type !== "TICKET";
  const showHotelName = isDetailed && (data.type === "HOTEL" || data.type === "CRUISE") && data.hotelName;
  const showChecklistBlock = showChecklist && data.includedItems.length > 0;
  const cardLabel = data.destination || data.title || "Pacote turístico";

  return (
    <article
      aria-label={cardLabel}
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border/60",
        layoutClassNames[layout],
        cardShadowClassName,
        (isLanding || isDetailed) &&
          "transition-[box-shadow,transform] duration-300 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <div className="flex h-full flex-col">
        <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
          {resolvedImageSrc ? (
            <BlogImage
              src={resolvedImageSrc}
              alt={data.title || "Pacote turístico"}
              fill
              priority={priority}
              sizes={
                layout === "grid"
                  ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 288px"
                  : layout === "preview"
                    ? "(max-width: 768px) 100vw, 420px"
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

          <div
            className={cn(
              "absolute z-10 flex max-w-[calc(100%-1.25rem)] flex-wrap gap-1.5",
              isDetailed ? "right-2.5 bottom-2.5 justify-end" : "top-2.5 left-2.5",
            )}
          >
            <DurationBadge daysCount={data.daysCount} nightsCount={data.nightsCount} />
          </div>

          {data.featured ? (
            <div className="absolute top-2.5 right-2.5 z-10">
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-400/95 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-950 shadow-sm uppercase">
                <Sparkles className="size-2.5" aria-hidden />
                Destaque
              </span>
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "flex flex-1 flex-col",
            isDetailed ? "px-4 pt-3.5 pb-3.5 sm:px-5 sm:pt-4 sm:pb-4" : "px-3.5 pt-3 pb-3 sm:px-4 sm:pt-3.5 sm:pb-3.5",
          )}
        >
          <CardTypeLabel type={data.type} />

          {isLanding ? (
            <>
              <h3 className="line-clamp-2 font-heading text-[0.95rem] font-semibold tracking-tight text-foreground sm:text-base">
                {data.destination || data.title || "Destino"}
              </h3>
              {data.title && data.title !== data.destination ? (
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground sm:text-sm">
                  {data.title}
                </p>
              ) : null}
            </>
          ) : isDetailed ? (
            <ListingHeading data={data} />
          ) : (
            <h3 className="line-clamp-2 font-heading text-base font-semibold tracking-tight text-foreground sm:text-[1.05rem]">
              {data.title || "Título do pacote"}
            </h3>
          )}

          {showOrigin ? (
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Saindo de{" "}
              <span className="font-medium text-brand underline decoration-brand/30 underline-offset-4">
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
    daysCount: pkg.daysCount,
    nightsCount: pkg.nightsCount,
    featured: pkg.featured,
  };
}
