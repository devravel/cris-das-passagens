import { PackageCardsCarousel } from "@/components/packages/package-cards-carousel";
import { PackageSectionIcon } from "@/components/packages/package-section-icon";
import { Section } from "@/components/layout/section";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import {
  DEFAULT_DEPARTURE_CITY,
  type PackageShowcaseConfig,
} from "@/config/packages-showcase";
import { scrollRevealDefaults } from "@/lib/motion";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type PackageShowcaseSectionProps = {
  config: PackageShowcaseConfig;
  packages: PublicPackage[];
  departureCity?: string;
};

function ShowcaseHeading({
  config,
  headingId,
  departureCity,
}: {
  config: PackageShowcaseConfig;
  headingId: string;
  departureCity: string;
}) {
  const { heading } = config;

  return (
    <div className="space-y-5 sm:space-y-6">
      <PackageSectionIcon variant={config.icon} />

      <div className="space-y-3">
        <h2
          id={headingId}
          className="max-w-md font-heading text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.08] font-semibold tracking-tight text-foreground"
        >
          {heading.full ? (
            heading.full
          ) : (
            <>
              {heading.before}
              {heading.highlight ? (
                <span className="text-brand">{heading.highlight}</span>
              ) : null}
              {heading.after}
            </>
          )}
        </h2>

        {config.originLabel ? (
          <p className="text-sm text-muted-foreground sm:text-base">
            Saindo de{" "}
            <span className="font-medium text-brand underline decoration-brand/30 underline-offset-4">
              {departureCity}
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function PackageShowcaseSection({
  config,
  packages,
  departureCity = DEFAULT_DEPARTURE_CITY,
}: PackageShowcaseSectionProps) {
  if (packages.length === 0) {
    return null;
  }

  const headingId = `${config.sectionId}-heading`;
  const carouselLabel =
    config.type === "PACKAGE_COMPLETE"
      ? "Pacotes completos em destaque"
      : config.type === "FLIGHT"
        ? "Passagens aéreas em destaque"
        : config.type === "HOTEL"
          ? "Hospedagem em destaque"
          : config.type === "TICKET"
            ? "Ingressos em destaque"
            : "Cruzeiros em destaque";

  return (
    <Section
      spacing="compact"
      background="default"
      bordered
      aria-labelledby={headingId}
    >
      <div
        className={cn(
          "grid items-center gap-8 lg:gap-10 xl:gap-14",
          config.reverse
            ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,34%)]"
            : "lg:grid-cols-[minmax(0,34%)_minmax(0,1fr)]",
        )}
      >
        <ScrollReveal
          y={scrollRevealDefaults.y}
          className={cn(
            "flex min-w-0 flex-col",
            config.reverse ? "order-1 lg:order-2" : "order-1",
          )}
        >
          <ShowcaseHeading
            config={config}
            headingId={headingId}
            departureCity={departureCity}
          />
        </ScrollReveal>

        <ScrollReveal
          y={scrollRevealDefaults.y}
          delay={scrollRevealDefaults.stagger}
          className={cn(
            "min-w-0",
            config.reverse ? "order-2 lg:order-1" : "order-2",
          )}
        >
          <PackageCardsCarousel
            packages={packages}
            departureCity={departureCity}
            ariaLabel={carouselLabel}
          />
        </ScrollReveal>
      </div>
    </Section>
  );
}
