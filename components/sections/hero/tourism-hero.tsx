"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { HeroFeaturedPackages } from "@/components/sections/hero/hero-featured-packages";
import { Section } from "@/components/layout/section";
import { bodyTextClassName } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import { content, type ContentCta, type ServiceItem } from "@/config/content";
import { useEntranceMotion } from "@/hooks/use-entrance-motion";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

export type TourismHeroProps = {
  headline?: string;
  subheadline?: string;
  services?: ServiceItem[];
  primaryCta?: ContentCta;
  secondaryCta?: ContentCta;
  featuredPackages?: PublicPackage[];
  featuredTitle?: string;
  departureCity?: string;
  className?: string;
};

function HeroCtaLink({
  cta,
  variant,
  className,
}: {
  cta: ContentCta;
  variant: "primary" | "secondary";
  className?: string;
}) {
  const isExternal = cta.href.startsWith("http");

  const primaryClasses =
    "h-11 w-full rounded-lg bg-brand px-6 text-sm text-brand-foreground shadow-sm transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-px hover:bg-brand/90 hover:shadow-md active:translate-y-0 sm:w-auto";
  const secondaryClasses =
    "h-11 w-full rounded-lg border-border/80 bg-background/80 px-6 text-sm text-foreground backdrop-blur-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:scale-[1.02] hover:!bg-background/80 hover:!text-foreground hover:shadow-md active:translate-y-0 active:scale-100 sm:w-auto";

  if (isExternal) {
    return (
      <Button
        asChild
        size="lg"
        variant={variant === "primary" ? "default" : "outline"}
        className={cn(
          variant === "primary" ? primaryClasses : secondaryClasses,
          className,
        )}
      >
        <a href={cta.href} target="_blank" rel="noopener noreferrer">
          {cta.label}
          {variant === "primary" ? (
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
          ) : null}
        </a>
      </Button>
    );
  }

  return (
    <Button
      asChild
      size="lg"
      variant={variant === "primary" ? "default" : "outline"}
      className={cn(
        variant === "primary" ? primaryClasses : secondaryClasses,
        className,
      )}
    >
      <Link
        href={cta.href}
        className={variant === "primary" ? "gap-2" : undefined}
      >
        {cta.label}
        {variant === "primary" ? (
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5"
            strokeWidth={1.75}
            aria-hidden
          />
        ) : null}
      </Link>
    </Button>
  );
}

export function TourismHero({
  headline = content.hero.headline,
  subheadline = content.meta.tagline,
  services = content.hero.services,
  primaryCta = content.hero.primaryCta,
  secondaryCta = content.hero.secondaryCta,
  featuredPackages = [],
  featuredTitle = content.hero.featuredPackages.title,
  departureCity = "São Paulo",
  className,
}: TourismHeroProps) {
  const headlineEntrance = useEntranceMotion(0);
  const subheadlineEntrance = useEntranceMotion(0.06);
  const servicesEntrance = useEntranceMotion(0.1);
  const ctaEntrance = useEntranceMotion(0.16);
  const featuredEntrance = useEntranceMotion(0.12, { y: 18, duration: 0.65 });
  const hasFeatured = featuredPackages.length > 0;

  return (
    <Section
      background="soft"
      spacing="none"
      bordered
      className={cn(
        "overflow-hidden pb-12 pt-8 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16",
        className,
      )}
      aria-labelledby="hero-headline"
    >
      <div
        className={cn(
          "grid items-start gap-8 sm:gap-10 lg:gap-14",
          hasFeatured ? "lg:grid-cols-2 xl:gap-16" : "max-w-3xl",
        )}
      >
        <div className="flex min-w-0 flex-col gap-6 sm:gap-7">
          <motion.h1
            id="hero-headline"
            className="font-heading text-balance text-center text-[1.875rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-left sm:text-4xl md:text-[2.75rem] md:leading-[1.06] lg:text-5xl"
            {...headlineEntrance}
          >
            {headline}
          </motion.h1>

          <motion.p
            className={cn("max-w-2xl", bodyTextClassName)}
            {...subheadlineEntrance}
          >
            {subheadline}
          </motion.p>

          <motion.ul
            className="flex flex-wrap justify-center gap-2 sm:justify-start"
            {...servicesEntrance}
            aria-label="Serviços oferecidos"
          >
            {services.map((service) => (
              <li key={service.label}>
                <span className="inline-flex rounded-full bg-background/90 px-3 py-1 text-xs font-medium text-foreground/85 ring-1 ring-border/60 sm:text-sm">
                  {service.label}
                </span>
              </li>
            ))}
          </motion.ul>

          <motion.div
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            {...ctaEntrance}
          >
            <HeroCtaLink cta={primaryCta} variant="primary" />
            <HeroCtaLink cta={secondaryCta} variant="secondary" />
          </motion.div>
        </div>

        {hasFeatured ? (
          <motion.div className="min-w-0" {...featuredEntrance}>
            <HeroFeaturedPackages
              packages={featuredPackages}
              departureCity={departureCity}
              title={featuredTitle}
            />
          </motion.div>
        ) : null}
      </div>
    </Section>
  );
}
