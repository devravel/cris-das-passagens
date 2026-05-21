"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Calendar, MapPin, Phone } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import {
  sectionHeadingClassName,
  sectionSubtitleClassName,
} from "@/components/layout/section-header";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import {
  content,
  type ContentCta,
  type FinalCtaAction,
} from "@/config/content";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

const iconMap: Record<FinalCtaAction["id"], LucideIcon> = {
  phone: Phone,
  whatsapp: Calendar,
  quote: MapPin,
};

export type FinalCtaProps = {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  footnote?: string;
  actions?: FinalCtaAction[];
  primaryCta?: ContentCta;
  className?: string;
};

function useCtaMotion() {
  const reduce = useReducedMotion();

  const item = React.useCallback(
    (index: number) => ({
      initial: reduce ? false : { opacity: 0, y: 16 },
      whileInView: reduce ? undefined : { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-60px" },
      transition: {
        duration: 0.5,
        ease,
        delay: reduce ? 0 : index * 0.08,
      },
    }),
    [reduce]
  );

  return { item };
}

function ActionCard({ action, index }: { action: FinalCtaAction; index: number }) {
  const { item } = useCtaMotion();
  const Icon = iconMap[action.id];

  const cardClassName = cn(
    "group flex flex-col items-center rounded-2xl bg-brand-soft px-5 py-6 text-center transition-[transform,box-shadow] duration-300 sm:px-6 sm:py-7",
    "hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-16px_rgba(0,0,0,0.35)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
  );

  const body = (
    <>
      <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15">
        <Icon className="size-5" strokeWidth={1.75} aria-hidden />
      </div>
      <h3 className="font-heading text-base font-semibold tracking-tight text-brand-navy">
        {action.title}
      </h3>
      <p className="mt-1.5 text-sm text-brand-navy/75">{action.description}</p>
    </>
  );

  if (action.external) {
    return (
      <motion.a
        href={action.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClassName}
        {...item(index)}
      >
        {body}
      </motion.a>
    );
  }

  return (
    <motion.div {...item(index)}>
      <Link href={action.href} className={cardClassName}>
        {body}
      </Link>
    </motion.div>
  );
}

export function FinalCta({
  sectionId = "cta-final",
  title = content.finalCta.title,
  subtitle = content.finalCta.subtitle,
  footnote = content.finalCta.footnote,
  actions = content.finalCta.actions,
  primaryCta = content.finalCta.primaryCta,
  className,
}: FinalCtaProps) {
  const { item } = useCtaMotion();
  const headingId = `${sectionId}-heading`;

  return (
    <Section
      background="navy"
      spacing="default"
      className={className}
      aria-labelledby={headingId}
    >
      <Container size="prose" padding="none" className="text-center">
        <motion.h2
          id={headingId}
          className={cn(sectionHeadingClassName, "text-white")}
          {...item(0)}
        >
          {title}
        </motion.h2>
        {subtitle ? (
          <motion.p
            className={cn(sectionSubtitleClassName, "mt-4 text-white/75")}
            {...item(1)}
          >
            {subtitle}
          </motion.p>
        ) : null}
      </Container>

      <ul className="mt-10 grid list-none grid-cols-1 gap-4 p-0 sm:mt-12 md:grid-cols-3 md:gap-5 lg:mt-14">
        {actions.map((action, index) => (
          <li key={action.id}>
            <ActionCard action={action} index={index + 2} />
          </li>
        ))}
      </ul>

      <motion.div
        className="mt-10 flex flex-col items-center gap-3 sm:mt-12"
        {...item(5)}
      >
        <Button
          asChild
          size="lg"
          className="h-11 w-full rounded-lg bg-brand-soft px-6 text-sm font-semibold text-brand-navy shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-brand-soft/90 hover:shadow-md active:translate-y-0 sm:w-auto"
        >
          <Link href={primaryCta.href} className="gap-2">
            {primaryCta.label}
            <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
          </Link>
        </Button>
        {footnote ? (
          <p className="text-center text-sm text-white/60">{footnote}</p>
        ) : null}
      </motion.div>
    </Section>
  );
}
