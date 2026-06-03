"use client";

import { useMemo } from "react";

import { PackagesGrid } from "@/components/packages/packages-grid";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { packagesPageContent, type PackagesPageSectionConfig } from "@/config/packages-page";
import type { PackageCategoryValue } from "@/lib/package/constants";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type PackagesListingSectionProps = {
  config: PackagesPageSectionConfig;
  packages: PublicPackage[];
  category: PackageCategoryValue;
  className?: string;
};

export function PackagesListingSection({
  config,
  packages,
  category,
  className,
}: PackagesListingSectionProps) {
  const headingId = `${config.sectionId}-heading`;
  const panelId = `${config.sectionId}-panel`;

  const filteredPackages = useMemo(() => {
    if (!config.hasCategoryFilter) {
      return packages;
    }

    return packages.filter((pkg) => pkg.category === category);
  }, [category, config.hasCategoryFilter, packages]);

  if (packages.length === 0) {
    return null;
  }

  return (
    <ScrollReveal>
      <section
        id={config.sectionId}
        aria-labelledby={`${config.sectionId}-heading`}
        className={cn("scroll-mt-24", className)}
      >
        <div className="mb-6 sm:mb-8">
          <h2
            id={headingId}
            className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl md:text-3xl"
          >
            {config.title}
          </h2>
        </div>

        <PackagesGrid
          id={config.hasCategoryFilter ? panelId : undefined}
          role={config.hasCategoryFilter ? "tabpanel" : undefined}
          aria-labelledby={config.hasCategoryFilter ? headingId : undefined}
          packages={filteredPackages}
          emptyMessage={packagesPageContent.emptyCategoryMessage}
        />

      </section>
    </ScrollReveal>
  );
}
