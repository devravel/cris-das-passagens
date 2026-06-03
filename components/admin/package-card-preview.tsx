"use client";

import { PackageCard } from "@/components/packages/package-card";
import type { PackageCardPreviewData } from "@/lib/package/schemas";
import { DEFAULT_DEPARTURE_CITY } from "@/config/packages-showcase";
import { cn } from "@/lib/utils";

type PackageCardPreviewProps = {
  data: PackageCardPreviewData;
  departureCity?: string;
  imageSrc?: string;
  className?: string;
};

export function PackageCardPreview({
  data,
  departureCity = DEFAULT_DEPARTURE_CITY,
  imageSrc,
  className,
}: PackageCardPreviewProps) {
  return (
    <PackageCard
      data={data}
      departureCity={departureCity}
      imageSrc={imageSrc}
      layout="preview"
      variant="preview"
      showChecklist
      className={cn(className)}
    />
  );
}
