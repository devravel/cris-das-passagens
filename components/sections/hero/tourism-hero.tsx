"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Globe, Plane } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { content, type ContentCta, type ServiceItem } from "@/config/content";
import { cn } from "@/lib/utils";

export type HeroServiceCard = {
  label: string;
  description: string;
  icon: LucideIcon;
};

export type TourismHeroProps = {
  headline?: string;
  subheadline?: string;
  services?: ServiceItem[];
  serviceCards?: HeroServiceCard[];
  primaryCta?: ContentCta;
  secondaryCta?: ContentCta;
  imageSrc?: string;
  imageAlt?: string;
  imageCaption?: string;
  className?: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

const defaultServiceCards: HeroServiceCard[] = [
  {
    label: "Viagens Nacionais",
    description: "Passagens e roteiros pelo Brasil com economia e suporte.",
    icon: Plane,
  },
  {
    label: "Internacionais",
    description: "Destinos premium com assessoria do início ao fim.",
    icon: Globe,
  },
];

const defaultHeroImage =
  "https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=1400&q=80";

function useHeroMotion() {
  const reduce = useReducedMotion();

  const fade = React.useCallback(
    (delay = 0) => ({
      initial: reduce ? false : { opacity: 0, y: 14 },
      animate: reduce ? false : { opacity: 1, y: 0 },
      transition: { duration: 0.55, ease, delay: reduce ? 0 : delay },
    }),
    [reduce]
  );

  return { fade, reduce };
}

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
    "h-11 w-full rounded-lg border-border/80 bg-background/80 px-6 text-sm backdrop-blur-sm transition-[transform,background-color] duration-200 hover:bg-background active:scale-[0.99] sm:w-auto";

  if (isExternal) {
    return (
      <Button asChild size="lg" variant={variant === "primary" ? "default" : "outline"} className={cn(variant === "primary" ? primaryClasses : secondaryClasses, className)}>
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
    <Button asChild size="lg" variant={variant === "primary" ? "default" : "outline"} className={cn(variant === "primary" ? primaryClasses : secondaryClasses, className)}>
      <Link href={cta.href} className={variant === "primary" ? "gap-2" : undefined}>
        {cta.label}
        {variant === "primary" ? (
          <ArrowRight className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5" strokeWidth={1.75} aria-hidden />
        ) : null}
      </Link>
    </Button>
  );
}

function ServiceCard({ card, delay }: { card: HeroServiceCard; delay: number }) {
  const { fade } = useHeroMotion();
  const Icon = card.icon;

  return (
    <motion.div
      className="flex gap-3 rounded-xl bg-background p-4 shadow-[0_8px_30px_-12px_rgba(52,91,167,0.18)] ring-1 ring-border/50 transition-[box-shadow,transform] duration-300 hover:-translate-y-px hover:shadow-[0_12px_36px_-12px_rgba(52,91,167,0.22)]"
      {...fade(delay)}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand ring-1 ring-brand/15">
        <Icon className="size-[18px]" strokeWidth={1.75} aria-hidden />
      </div>
      <div className="min-w-0 space-y-0.5">
        <p className="font-heading text-sm font-semibold tracking-tight text-foreground">
          {card.label}
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {card.description}
        </p>
      </div>
    </motion.div>
  );
}

export function TourismHero({
  headline = content.hero.headline,
  subheadline = content.meta.tagline,
  services = content.hero.services,
  serviceCards = defaultServiceCards,
  primaryCta = content.hero.primaryCta,
  secondaryCta = content.hero.secondaryCta,
  imageSrc = defaultHeroImage,
  imageAlt = "Viajante admirando um destino internacional ao pôr do sol",
  imageCaption = "Assessoria completa do início ao fim da sua viagem.",
  className,
}: TourismHeroProps) {
  const { fade, reduce } = useHeroMotion();

  return (
    <Section
      background="soft"
      spacing="none"
      bordered
      className={cn(
        "overflow-hidden pb-12 pt-8 sm:pb-20 sm:pt-14 lg:pb-24 lg:pt-16",
        className
      )}
      aria-labelledby="hero-headline"
    >
      <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-14 xl:gap-16">
        <motion.div
          className="relative order-2 mx-auto w-full max-w-xl lg:order-1 lg:mx-0 lg:max-w-none"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={reduce ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: reduce ? 0 : 0.12, ease }}
        >
          <div className="relative aspect-4/3 overflow-hidden rounded-2xl shadow-[0_24px_80px_-24px_rgba(52,91,167,0.28)] ring-1 ring-border/40 sm:aspect-[5/4] lg:aspect-[4/5] xl:aspect-[5/4]">
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-brand-navy/55 via-brand-navy/10 to-transparent" />
            {imageCaption ? (
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="max-w-md rounded-lg bg-brand-navy/75 px-4 py-3 text-sm leading-relaxed text-white/95 backdrop-blur-sm">
                  {imageCaption}
                </p>
              </div>
            ) : null}
          </div>
        </motion.div>

        <div className="order-1 flex flex-col gap-6 sm:gap-7 lg:order-2">
          <motion.h1
            id="hero-headline"
            className="font-heading text-balance text-center text-[1.875rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-left sm:text-4xl md:text-[2.75rem] md:leading-[1.06] lg:text-5xl"
            {...fade(0)}
          >
            {headline}
          </motion.h1>

          <Container size="prose" padding="none" asChild>
            <motion.p
              className="text-center text-sm leading-relaxed text-muted-foreground sm:text-left sm:text-base md:text-lg"
              {...fade(0.06)}
            >
              {subheadline}
            </motion.p>
          </Container>

          <motion.ul
            className="flex flex-wrap justify-center gap-2 sm:justify-start"
            {...fade(0.1)}
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

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {serviceCards.map((card, index) => (
              <ServiceCard key={card.label} card={card} delay={0.14 + index * 0.05} />
            ))}
          </div>

          <motion.div
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            {...fade(0.24)}
          >
            <HeroCtaLink cta={primaryCta} variant="primary" />
            <HeroCtaLink cta={secondaryCta} variant="secondary" />
          </motion.div>
        </div>
      </div>
    </Section>
  );
}
