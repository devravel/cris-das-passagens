"use client";

import { PackagesGrid } from "@/components/packages/packages-grid";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import type { PackagesPageSectionConfig } from "@/config/packages-page";
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
  const headingId = `${config.sectionId}-heading`;
  const panelId = `${config.sectionId}-panel`;

  if (packages.length === 0) {
    return null;
  }

  return (
    <ScrollReveal>
      <section
        id={config.sectionId}
        aria-labelledby={headingId}
        className={cn("scroll-mt-36 sm:scroll-mt-40", className)}
      >
        <PackagesGrid
          id={panelId}
          role="tabpanel"
          aria-labelledby={headingId}
          packages={packages}
          header={
            <h2
              id={headingId}
              className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl md:text-3xl"
            >
              {config.title}
            </h2>
          }
        />
      </section>
    </ScrollReveal>
  );
}
