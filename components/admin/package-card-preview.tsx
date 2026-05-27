"use client";

import {
  Anchor,
  Hotel,
  MapPin,
  Plane,
  Sparkles,
  Ticket,
} from "lucide-react";

import { BlogImage } from "@/components/blog/blog-image";
import {
  PACKAGE_CATEGORY_LABELS,
  PACKAGE_IMAGE_ASPECT_RATIO,
  PACKAGE_TYPE_LABELS,
  PACKAGE_TYPES_WITH_CATEGORY,
} from "@/lib/package/constants";
import { formatPackagePrice } from "@/lib/package/format";
import type { PackageCardPreviewData } from "@/lib/package/schemas";
import { cardShadowClassName } from "@/lib/card-styles";
import { cn } from "@/lib/utils";

type PackageCardPreviewProps = {
  data: PackageCardPreviewData;
  imageSrc?: string;
  className?: string;
};

function IncludeBadge({
  icon: Icon,
  label,
}: {
  icon: typeof Plane;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-background/90 px-2 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur-sm">
      <Icon className="size-3 shrink-0 text-brand" aria-hidden />
      {label}
    </span>
  );
}

export function PackageCardPreview({ data, imageSrc, className }: PackageCardPreviewProps) {
  const showCategory = PACKAGE_TYPES_WITH_CATEGORY.has(data.type) && data.category;
  const resolvedImageSrc = imageSrc || data.image;

  const includeBadges = [
    data.includesFlight ? { icon: Plane, label: "Voo" } : null,
    data.includesHotel ? { icon: Hotel, label: "Hotel" } : null,
    data.includesTickets ? { icon: Ticket, label: "Ingressos" } : null,
    data.includesCruise ? { icon: Anchor, label: "Cruzeiro" } : null,
  ].filter(Boolean) as Array<{ icon: typeof Plane; label: string }>;

  const detailLine =
    data.type === "FLIGHT"
      ? data.airline
      : data.type === "HOTEL" || data.type === "CRUISE"
        ? data.hotelName
        : null;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-border/70 bg-card",
        cardShadowClassName,
        className,
      )}
    >
      <div className="relative overflow-hidden bg-muted/40" style={{ aspectRatio: PACKAGE_IMAGE_ASPECT_RATIO }}>
        {resolvedImageSrc ? (
          <BlogImage
            src={resolvedImageSrc}
            alt={data.title || "Preview do pacote"}
            fill
            sizes="(max-width: 768px) 100vw, 420px"
            className="object-cover"
            containerClassName="absolute inset-0"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
            Imagem do pacote
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
          <div className="flex flex-wrap gap-1.5">
            {showCategory ? (
              <span className="rounded-full bg-brand px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white uppercase">
                {PACKAGE_CATEGORY_LABELS[data.category!]}
              </span>
            ) : null}
            <span className="rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground shadow-sm backdrop-blur-sm">
              {PACKAGE_TYPE_LABELS[data.type]}
            </span>
          </div>

          {data.featured ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/95 px-2.5 py-1 text-[11px] font-semibold text-amber-950">
              <Sparkles className="size-3" aria-hidden />
              Destaque
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-3 p-4 sm:p-5">
        <div className="space-y-1">
          <p className="inline-flex items-center gap-1 text-xs font-medium tracking-wide text-brand uppercase">
            <MapPin className="size-3.5" aria-hidden />
            {data.destination || "Destino"}
          </p>
          <h3 className="font-heading text-lg font-semibold tracking-tight text-foreground">
            {data.title || "Título do pacote"}
          </h3>
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
            {data.shortDescription || "Descrição curta do pacote aparecerá aqui."}
          </p>
        </div>

        {detailLine ? (
          <p className="text-xs font-medium text-foreground/80">{detailLine}</p>
        ) : null}

        {includeBadges.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {includeBadges.map((badge) => (
              <IncludeBadge key={badge.label} icon={badge.icon} label={badge.label} />
            ))}
          </div>
        ) : null}

        <div className="space-y-1 border-t border-border/70 pt-3">
          <div className="flex flex-wrap items-end gap-2">
            <p className="font-heading text-2xl font-semibold tracking-tight text-foreground">
              {formatPackagePrice(data.price)}
            </p>
            {data.oldPrice != null && data.oldPrice > data.price ? (
              <p className="pb-0.5 text-sm text-muted-foreground line-through">
                {formatPackagePrice(data.oldPrice)}
              </p>
            ) : null}
          </div>
          {data.installmentText ? (
            <p className="text-xs font-medium text-emerald-700">{data.installmentText}</p>
          ) : (
            <p className="text-xs text-muted-foreground">Parcelamento opcional</p>
          )}
        </div>
      </div>
    </article>
  );
}
