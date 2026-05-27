import { Anchor, BedDouble, Luggage, Plane, Sparkles, Ticket } from "lucide-react";

import { BlogImage } from "@/components/blog/blog-image";
import {
  PACKAGE_CATEGORY_LABELS,
  PACKAGE_TYPES_WITH_CATEGORY,
} from "@/lib/package/constants";
import { formatPackagePrice } from "@/lib/package/format";
import type { PublicPackage } from "@/lib/package/queries";
import { getPackageWhatsAppUrl } from "@/lib/package/whatsapp";
import { cardInteractiveClassName, cardShadowClassName } from "@/lib/card-styles";
import { cn } from "@/lib/utils";

type PublicPackageCardProps = {
  pkg: PublicPackage;
  departureCity: string;
  priority?: boolean;
  layout?: "carousel" | "grid";
  className?: string;
};

function CardTypeIcon({ type }: { type: PublicPackage["type"] }) {
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
    <span className="mb-2 inline-flex text-muted-foreground/80" aria-hidden>
      <Icon className="size-4" strokeWidth={1.75} />
    </span>
  );
}

function PriceBlock({ pkg }: { pkg: PublicPackage }) {
  if (pkg.type === "FLIGHT") {
    return (
      <div className="space-y-0.5">
        {pkg.installmentText ? (
          <p className="font-heading text-[1.35rem] font-semibold leading-none tracking-tight text-foreground sm:text-2xl">
            {pkg.installmentText}
          </p>
        ) : (
          <p className="font-heading text-[1.35rem] font-semibold leading-none tracking-tight text-foreground sm:text-2xl">
            {formatPackagePrice(pkg.price)}
          </p>
        )}
        <p className="text-xs text-muted-foreground sm:text-sm">
          A partir de {formatPackagePrice(pkg.price)}
        </p>
      </div>
    );
  }

  const priceLabel = pkg.type === "HOTEL" ? "Diária a partir de" : "A partir de";

  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground sm:text-sm">{priceLabel}</p>
      <p className="font-heading text-[1.35rem] font-semibold leading-none tracking-tight text-foreground sm:text-2xl">
        {formatPackagePrice(pkg.price)}
      </p>
      {pkg.oldPrice != null && pkg.oldPrice > pkg.price ? (
        <p className="text-xs text-muted-foreground line-through sm:text-sm">
          {formatPackagePrice(pkg.oldPrice)}
        </p>
      ) : null}
    </div>
  );
}

const layoutClassNames = {
  carousel:
    "w-[min(100%,240px)] shrink-0 sm:w-[250px] md:w-[260px] lg:w-[272px] xl:w-[288px]",
  grid: "w-full sm:max-w-none",
} as const;

export function PublicPackageCard({
  pkg,
  departureCity,
  priority = false,
  layout = "carousel",
  className,
}: PublicPackageCardProps) {
  const showCategory = PACKAGE_TYPES_WITH_CATEGORY.has(pkg.type) && pkg.category;
  const showOrigin = pkg.type !== "HOTEL" && pkg.type !== "TICKET";
  const showHotelName = (pkg.type === "HOTEL" || pkg.type === "CRUISE") && pkg.hotelName;

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-border/60",
        layoutClassNames[layout],
        cardShadowClassName,
        cardInteractiveClassName,
        className,
      )}
    >
      <a
        href={getPackageWhatsAppUrl(pkg)}
        target="_blank"
        rel="noopener noreferrer"
        className="group flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        aria-label={`Consultar ${pkg.title}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-muted/30">
          <BlogImage
            src={pkg.image}
            alt={pkg.title}
            fill
            priority={priority}
            sizes={
              layout === "grid"
                ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 288px"
                : "(max-width: 640px) 240px, (max-width: 1024px) 260px, 288px"
            }
            className="transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            containerClassName="absolute inset-0"
          />
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            {showCategory ? (
              <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
                {PACKAGE_CATEGORY_LABELS[pkg.category!]}
              </span>
            ) : null}
            {pkg.featured ? (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-400/95 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-amber-950 uppercase">
                <Sparkles className="size-2.5" aria-hidden />
                Destaque
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex flex-1 flex-col px-3.5 pt-3 pb-3 sm:px-4 sm:pt-3.5 sm:pb-3.5">
          <CardTypeIcon type={pkg.type} />

          <h3 className="line-clamp-2 font-heading text-base font-semibold tracking-tight text-foreground sm:text-[1.05rem]">
            {pkg.title}
          </h3>

          {showHotelName ? (
            <p className="mt-1 line-clamp-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase sm:text-xs">
              {pkg.hotelName}
            </p>
          ) : null}

          {showOrigin ? (
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Saindo de {departureCity}
            </p>
          ) : null}

          {pkg.type === "FLIGHT" && pkg.airline ? (
            <p className="mt-1 text-xs font-medium text-foreground/75 sm:text-sm">{pkg.airline}</p>
          ) : null}

          {pkg.shortDescription ? (
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-foreground/80 sm:text-sm">
              {pkg.shortDescription}
            </p>
          ) : null}

          {pkg.type === "FLIGHT" ? (
            <p className="mt-2 text-[11px] text-muted-foreground sm:text-xs">Ida e volta</p>
          ) : null}

          <div className="mt-auto pt-3">
            <PriceBlock pkg={pkg} />
          </div>
        </div>

        {pkg.installmentText ? (
          <div className="border-t border-border/70 px-3.5 py-2.5 text-center sm:px-4 sm:py-3">
            <p className="text-xs font-semibold text-foreground sm:text-sm">{pkg.installmentText}</p>
          </div>
        ) : null}
      </a>
    </article>
  );
}
