"use client";

import { PackagesGrid } from "@/components/packages/packages-grid";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import type { PackagesPageSectionConfig } from "@/config/packages-page";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type PackagesListingSectionProps = {
  config: PackagesPageSectionConfig;
  packages: PublicPackage[];
  emptyMessage?: string;
  className?: string;
};

export function PackagesListingSection({
  config,
  packages,
  emptyMessage,
  className,
}: PackagesListingSectionProps) {
  const headingId = `${config.sectionId}-heading`;
  const panelId = `${config.sectionId}-panel`;

  return (
    <ScrollReveal>
      <section
        id={config.sectionId}
        aria-labelledby={headingId}
        className={cn("scroll-mt-36 sm:scroll-mt-40", className)}
      >
        {packages.length > 0 ? (
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
        ) : (
          <div id={panelId} role="tabpanel" aria-labelledby={headingId}>
            <h2
              id={headingId}
              className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl md:text-3xl"
            >
              {config.title}
            </h2>
            {emptyMessage ? (
              <p className="mt-6 rounded-2xl border border-dashed border-border/70 bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground sm:text-base">
                {emptyMessage}
              </p>
            ) : null}
          </div>
        )}
      </section>
    </ScrollReveal>
  );
}
