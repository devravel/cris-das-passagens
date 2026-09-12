import { Sparkles } from "lucide-react";

import { CouponApplyForm } from "@/components/coupon/coupon-apply-form";
import { Section } from "@/components/layout/section";
import {
  highlightTitle,
  sectionHeadingClassName,
} from "@/components/layout/section-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { FeaturedPackagesCarousel } from "@/components/packages/featured-packages-carousel";
import { PackageCarouselScrollHint } from "@/components/packages/package-carousel-scroll-hint";
import { CtaButton } from "@/components/ui/cta-button";
import { content } from "@/config/content";
import { DEFAULT_DEPARTURE_CITY } from "@/config/packages-showcase";
import { scrollRevealDefaults } from "@/lib/motion";
import { getFeaturedPackages } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

function FeaturedPackagesEmpty({ message }: { message: string }) {
  return (
    <div
      className="hero-featured-packages-empty relative flex min-h-[12.5rem] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border/70 bg-background/70 px-6 py-10 sm:min-h-[15rem] sm:px-8 sm:py-12"
      role="status"
      aria-live="polite"
    >
      <div
        aria-hidden
        className="hero-featured-packages-empty__glow pointer-events-none absolute inset-0 bg-linear-to-br from-brand-soft/35 via-transparent to-brand/10"
      />
      <p className="hero-featured-packages-empty__message relative max-w-sm text-center font-heading text-base font-semibold leading-snug text-foreground/85 sm:text-lg">
        <Sparkles
          className="hero-featured-packages-empty__icon mx-auto mb-3 size-5 text-brand sm:mb-3.5 sm:size-6"
          aria-hidden
        />
        {message}
      </p>
    </div>
  );
}

const copy = content.featuredPackages;

export async function FeaturedPackagesSection({
  sectionId = "pacotes-em-destaque",
  className,
}: {
  sectionId?: string;
  className?: string;
}) {
  const packages = await getFeaturedPackages();
  const headingId = `${sectionId}-heading`;
  const hasPackages = packages.length > 0;

  return (
    <Section
      id={sectionId}
      background="default"
      spacing="compact"
      className={cn("scroll-mt-20", className)}
      aria-labelledby={headingId}
    >
      <ScrollReveal>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
          <div className="max-w-2xl">
            <h2 id={headingId} className={cn(sectionHeadingClassName, "text-left")}>
              {highlightTitle(copy.title)}
            </h2>
            <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
              {copy.subtitle}
            </p>
          </div>

          {hasPackages ? (
            <CouponApplyForm
              inputId="coupon-code-input"
              className="w-full lg:w-[22rem] lg:shrink-0"
            />
          ) : null}
        </div>
      </ScrollReveal>

      {/* Carrossel entra como um bloco só, logo depois do cabeçalho. */}
      <ScrollReveal delay={scrollRevealDefaults.stagger} className="mt-8 sm:mt-10">
        {hasPackages ? (
          <>
            <FeaturedPackagesCarousel
              packages={packages}
              departureCity={DEFAULT_DEPARTURE_CITY}
              visibleCards={4}
            />
            <div className="mt-6 flex flex-col items-center gap-6 sm:mt-8">
              <PackageCarouselScrollHint className="text-center text-xs" />
              <CtaButton href={copy.cta.href} label={copy.cta.label} size="xl" />
            </div>
          </>
        ) : (
          <FeaturedPackagesEmpty message={copy.emptyMessage} />
        )}
      </ScrollReveal>
    </Section>
  );
}
