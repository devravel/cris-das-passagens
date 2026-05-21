"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type HeroCta = {
  label: string;
  href: string;
};

export type HeroModernProps = {
  eyebrow?: string;
  headline: React.ReactNode;
  subheadline: React.ReactNode;
  primaryCta: HeroCta;
  secondaryCta: HeroCta;
  className?: string;
};

const ease = [0.22, 1, 0.36, 1] as const;

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

export function HeroModern({
  eyebrow = "Novo",
  headline,
  subheadline,
  primaryCta,
  secondaryCta,
  className,
}: HeroModernProps) {
  const { fade, reduce } = useHeroMotion();

  return (
    <Section
      background="default"
      spacing="none"
      bordered
      className={cn("overflow-hidden pb-16 pt-20 sm:pb-20 sm:pt-24 lg:pb-28 lg:pt-28", className)}
      aria-labelledby="hero-headline"
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 bg-[radial-gradient(65%_55%_at_50%_-10%,color-mix(in_oklch,var(--foreground)_6%,transparent),transparent_55%)]"
          aria-hidden
        />
        <div
          className="absolute -top-32 left-1/2 h-112 w-[min(58rem,120vw)] -translate-x-1/2 rounded-[40%] bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--primary)_12%,transparent),transparent)] blur-2xl sm:-top-40 sm:h-128"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-size-[48px_48px] bg-[linear-gradient(to_right,color-mix(in_oklch,var(--foreground)_12%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklch,var(--foreground)_12%,transparent)_1px,transparent_1px)] opacity-[0.22] mask-[radial-gradient(ellipse_70%_60%_at_50%_25%,black_20%,transparent_70%)] [-webkit-mask-image:radial-gradient(ellipse_70%_60%_at_50%_25%,black_20%,transparent_70%)] dark:opacity-[0.14]"
          aria-hidden
        />
      </div>

      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-6 sm:gap-8">
          {eyebrow ? (
            <motion.p
              className="inline-flex w-fit items-center gap-2 self-center rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-muted-foreground backdrop-blur-sm sm:self-start sm:text-xs"
              {...fade(0)}
            >
              <span className="size-1.5 rounded-full bg-foreground/50" />
              {eyebrow}
            </motion.p>
          ) : null}

          <motion.h1
            id="hero-headline"
            className="font-heading text-center text-3xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-left sm:text-4xl md:text-5xl lg:text-[3.25rem] lg:leading-[1.06]"
            {...fade(eyebrow ? 0.06 : 0)}
          >
            {headline}
          </motion.h1>

          <Container size="prose" padding="none" asChild>
            <motion.p
              className="text-center text-base leading-relaxed text-muted-foreground sm:text-left sm:text-lg"
              {...fade(eyebrow ? 0.12 : 0.06)}
            >
              {subheadline}
            </motion.p>
          </Container>

          <motion.div
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
            {...fade(eyebrow ? 0.18 : 0.12)}
          >
            <Button
              asChild
              size="lg"
              className="h-11 w-full rounded-lg px-6 text-sm shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-md active:translate-y-0 sm:w-auto"
            >
              <Link href={primaryCta.href} className="gap-2">
                {primaryCta.label}
                <ArrowRight
                  className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5"
                  strokeWidth={1.75}
                  aria-hidden
                />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 w-full rounded-lg border-border/80 bg-background/60 px-6 text-sm backdrop-blur-sm transition-[transform,background-color] duration-200 hover:bg-muted/60 active:scale-[0.99] sm:w-auto"
            >
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none"
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={reduce ? false : { opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: reduce ? 0 : 0.24, ease }}
          aria-hidden
        >
          <div className="aspect-4/3 rounded-2xl border border-border/60 bg-card/40 p-1 shadow-[0_24px_80px_-24px_color-mix(in_oklch,var(--foreground)_25%,transparent)] backdrop-blur-md supports-backdrop-filter:bg-card/30 sm:aspect-video">
            <div className="flex h-9 items-center gap-1.5 rounded-xl border-b border-border/50 bg-muted/30 px-3">
              <span className="size-2 rounded-full bg-border" />
              <span className="size-2 rounded-full bg-border/80" />
              <span className="size-2 rounded-full bg-border/60" />
            </div>
            <div className="relative m-3 flex h-[calc(100%-3.25rem)] flex-col gap-3 rounded-xl border border-border/40 bg-linear-to-b from-muted/25 to-background/40 p-4 sm:m-4 sm:p-5">
              <div className="flex items-center justify-between gap-3">
                <div className="h-2.5 w-24 max-w-[40%] rounded-full bg-foreground/12" />
                <div className="h-7 w-20 rounded-lg bg-foreground/8 sm:w-24" />
              </div>
              <div className="grid flex-1 grid-cols-3 gap-2 sm:gap-3">
                <div className="col-span-2 space-y-2 rounded-lg border border-border/35 bg-background/50 p-3 shadow-sm">
                  <div className="h-2 w-3/4 max-w-48 rounded-full bg-foreground/10" />
                  <div className="h-2 w-full rounded-full bg-foreground/6" />
                  <div className="h-2 w-5/6 rounded-full bg-foreground/6" />
                </div>
                <div className="space-y-2 rounded-lg border border-border/35 bg-background/40 p-3">
                  <div className="h-2 w-full rounded-full bg-foreground/10" />
                  <div className="h-2 w-4/5 rounded-full bg-foreground/7" />
                  <div className="mt-auto h-16 rounded-md bg-linear-to-br from-primary/15 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}
