"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { CouponApplyForm } from "@/components/coupon/coupon-apply-form";
import { HeroFeaturedPackages } from "@/components/sections/hero/hero-featured-packages";
import { ReiDaCopaHeroCta } from "@/components/rei-da-copa/rei-da-copa-hero-cta";
import { Section } from "@/components/layout/section";
import { bodyTextClassName } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import { content, type ContentCta, type ServiceItem } from "@/config/content";
import { reiDaCopaHomeHeroCta } from "@/config/rei-da-copa-campaign";
import { useEntranceMotion } from "@/hooks/use-entrance-motion";
import type { PublicPackage } from "@/lib/package/queries";
import { trackMetaLeadFromHref } from "@/lib/meta-pixel";
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

/** Coluna esquerda no grid lg — CTAs em linha sem quebra no desktop. */
const heroCtaRowClassName = "lg:!flex-nowrap lg:gap-3";

const heroCtaDesktopClassName = "lg:h-12 lg:px-6 lg:text-base xl:h-14 xl:px-7";

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
          heroCtaDesktopClassName,
          className,
        )}
      >
        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackMetaLeadFromHref(cta.href, {
              source: "hero_quote",
              content_name: cta.label,
            })
          }
        >
          {cta.label}
          {variant === "primary" ? (
            <ArrowRight className="size-4 lg:size-5" strokeWidth={1.75} aria-hidden />
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
        heroCtaDesktopClassName,
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
            className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5 lg:size-5"
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
      <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
        <div className="flex min-w-0 flex-col gap-6 sm:gap-7">
          <motion.h1
            id="hero-headline"
            className="font-heading text-balance text-center text-[2.25rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-left sm:text-4xl md:text-[2.75rem] md:leading-[1.06] lg:text-5xl"
            {...headlineEntrance}
          >
            {headline}
          </motion.h1>

          <motion.p
            className={cn(
              "max-w-2xl",
              bodyTextClassName,
              "!text-center [hyphens:none] sm:!text-left sm:[hyphens:auto]",
            )}
            {...subheadlineEntrance}
          >
            {subheadline}
          </motion.p>

          <motion.ul
            className="flex flex-nowrap justify-center gap-0 max-[477px]:w-[100vw] max-[477px]:max-w-[100vw] max-[477px]:relative max-[477px]:left-1/2 max-[477px]:-translate-x-1/2 max-[477px]:px-2.5 sm:justify-start sm:w-auto sm:max-w-none sm:left-auto sm:translate-x-0 sm:px-0 lg:translate-x-4 xl:translate-x-5"
            {...servicesEntrance}
            aria-label="Serviços oferecidos"
          >
            {services.map((service) => (
              <li
                key={service.label}
                className="relative text-xs max-[477px]:text-[0.625rem] sm:text-sm lg:text-xs xl:text-sm not-first:pl-[0.7em] not-first:before:pointer-events-none not-first:before:absolute not-first:before:top-1/2 not-first:before:left-0 not-first:before:-translate-y-1/2 not-first:before:text-[0.75em] not-first:before:leading-none not-first:before:text-brand-light not-first:before:content-['•'] max-[477px]:not-first:pl-[0.55em]"
              >
                <span className="inline-flex whitespace-nowrap px-2.5 py-1 font-bold tracking-wide text-brand-light uppercase max-[477px]:px-1.5 max-[477px]:py-0.5 max-[477px]:leading-tight sm:px-3 lg:px-2 xl:px-3">
                  {service.compactLabel ? (
                    <>
                      <span className="max-[477px]:hidden">{service.label}</span>
                      <span className="hidden max-[477px]:inline">
                        {service.compactLabel}
                      </span>
                    </>
                  ) : (
                    service.label
                  )}
                </span>
              </li>
            ))}
          </motion.ul>

          <motion.div
            className={cn(
              "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
              heroCtaRowClassName,
            )}
            {...ctaEntrance}
          >
            {primaryCta.href === reiDaCopaHomeHeroCta.href ? (
              <ReiDaCopaHeroCta className={heroCtaDesktopClassName} />
            ) : (
              <HeroCtaLink cta={primaryCta} variant="primary" />
            )}
            <HeroCtaLink
              cta={secondaryCta}
              variant="secondary"
              className="hidden sm:inline-flex"
            />
          </motion.div>

          {hasFeatured ? (
            <div className="hidden w-full lg:block">
              <CouponApplyForm
                inputId="coupon-code-input-desktop"
                showDescription
                className="w-full max-w-none flex-none lg:max-w-none"
              />
            </div>
          ) : null}
        </div>

        <div className="min-w-0 w-full sm:min-w-[280px] lg:min-w-[300px]">
          <HeroFeaturedPackages
            packages={featuredPackages}
            departureCity={departureCity}
            title={featuredTitle}
            mobilePackagesCta={secondaryCta}
          />
        </div>
      </div>
    </Section>
  );
}
