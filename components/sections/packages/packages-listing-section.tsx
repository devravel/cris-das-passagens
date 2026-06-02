"use client";

import { useMemo, useState } from "react";

import { PackageCategoryToggle } from "@/components/packages/package-category-toggle";
import { PackagesGrid } from "@/components/packages/packages-grid";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { packagesPageContent, type PackagesPageSectionConfig } from "@/config/packages-page";
import type { PackageCategoryValue } from "@/lib/package/constants";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type PackagesListingSectionProps = {
  config: PackagesPageSectionConfig;
  packages: PublicPackage[];
  className?: string;
};

export function PackagesListingSection({
  config,
  packages,
  className,
}: PackagesListingSectionProps) {
  const [category, setCategory] = useState<PackageCategoryValue>("NATIONAL");
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
        <div className="mx-auto mb-6 max-w-3xl space-y-3 text-center sm:mb-8">
          <h2
            id={headingId}
            className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl md:text-3xl"
          >
            {config.title}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {config.description}
          </p>
        </div>

        {config.hasCategoryFilter ? (
          <div className="mb-6 flex justify-center sm:mb-8">
            <PackageCategoryToggle
              value={category}
              onChange={setCategory}
              layoutId={config.sectionId}
              panelId={panelId}
              labelledBy={headingId}
              className="w-full sm:w-auto"
            />
          </div>
        ) : null}

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
