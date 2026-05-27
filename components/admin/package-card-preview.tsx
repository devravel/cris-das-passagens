"use client";

import { PackageCard } from "@/components/packages/package-card";
import type { PackageCardPreviewData } from "@/lib/package/schemas";
import { DEFAULT_DEPARTURE_CITY } from "@/config/packages-showcase";
import { contentLinks } from "@/config/content";
import { cn } from "@/lib/utils";

type PackageCardPreviewProps = {
  data: PackageCardPreviewData;
  imageSrc?: string;
  className?: string;
};

export function PackageCardPreview({ data, imageSrc, className }: PackageCardPreviewProps) {
  return (
    <PackageCard
      data={data}
      departureCity={DEFAULT_DEPARTURE_CITY}
      imageSrc={imageSrc}
      layout="preview"
      variant="listing"
      showChecklist
      whatsAppHref={contentLinks.whatsapp}
      className={cn(className)}
    />
  );
}
