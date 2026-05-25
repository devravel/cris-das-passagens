import Link from "next/link";
import { ArrowRight, Scale, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import {
  sectionHeadingClassName,
  SectionHeader,
  bodyTextClassName,
} from "@/components/layout/section-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Button } from "@/components/ui/button";
import { content, type ContentCta } from "@/config/content";
import {
  cardInteractiveClassName,
  cardShadowClassName,
} from "@/lib/card-styles";
import { scrollRevealDefaults } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { whatsappSolidButtonClassName } from "@/lib/whatsapp-styles";

export type AboutSectionProps = {
  sectionId?: string;
  title?: string;
  paragraphs?: readonly string[];
  cta?: ContentCta;
  className?: string;
};

export function AboutSection({
  sectionId = "sobre",
  title = content.about.title,
  paragraphs = content.about.paragraphs,
  cta = content.about.cta,
  className,
}: AboutSectionProps) {
  const headingId = `${sectionId}-heading`;

  return (
    <Section
      id={sectionId}
      background="soft"
      spacing="default"
      bordered
      className={className}
      aria-labelledby={headingId}
    >
      <ScrollReveal>
        <Container size="narrow" padding="none">
          <h2 id={headingId} className={sectionHeadingClassName}>
            {title}
          </h2>

          <div className="mt-6 space-y-4 sm:mt-8">
            {paragraphs.map((paragraph) => (
              <p key={paragraph} className={bodyTextClassName}>
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-8 flex justify-center sm:mt-10">
            <Button
              asChild
              size="lg"
              className="h-11 rounded-lg bg-brand px-6 text-sm text-brand-foreground shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-brand/90 hover:shadow-md active:translate-y-0"
            >
              <Link href={cta.href} className="gap-2">
                {cta.label}
                <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
              </Link>
            </Button>
          </div>
        </Container>
      </ScrollReveal>
    </Section>
  );
}

type SupportHighlight = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const defaultHighlights: SupportHighlight[] = [
  {
    title: content.support.highlights[0].title,
    description: content.support.highlights[0].description,
    icon: Users,
  },
  {
    title: content.support.highlights[1].title,
    description: content.support.highlights[1].description,
    icon: Scale,
  },
];

export type SupportSectionProps = {
  sectionId?: string;
  title?: string;
  intro?: string;
  paragraphs?: readonly string[];
  highlights?: SupportHighlight[];
  closing?: string;
  cta?: ContentCta;
  className?: string;
};

function SupportCta({ cta }: { cta: ContentCta }) {
  const isExternal = cta.href.startsWith("http");
  const buttonClassName =
    "h-11 rounded-lg px-6 text-sm shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-md active:translate-y-0";

  if (isExternal) {
    return (
      <Button
        asChild
        size="lg"
        className={cn(buttonClassName, whatsappSolidButtonClassName)}
      >
        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          className="gap-2"
        >
          {cta.label}
          <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
        </a>
      </Button>
    );
  }

  return (
    <Button
      asChild
      size="lg"
      className={cn(
        buttonClassName,
        "bg-brand text-brand-foreground hover:bg-brand/90",
      )}
    >
      <Link href={cta.href} className="gap-2">
        {cta.label}
        <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
      </Link>
    </Button>
  );
}

export function SupportSection({
  sectionId = "suporte-total",
  title = content.support.title,
  intro = content.support.intro,
  paragraphs = content.support.paragraphs,
  highlights = defaultHighlights,
  closing = content.support.closing,
  cta = content.support.cta,
  className,
}: SupportSectionProps) {
  const headingId = `${sectionId}-heading`;

  return (
    <Section
      background="default"
      spacing="default"
      bordered
      className={className}
      aria-labelledby={headingId}
    >
      <ScrollReveal>
        <SectionHeader id={headingId} title={title} subtitle={intro} />
      </ScrollReveal>

      <Container padding="none" className="max-w-4xl">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {highlights.map(
            ({ title: highlightTitle, description, icon: Icon }, index) => (
              <ScrollReveal
                key={highlightTitle}
                delay={index * scrollRevealDefaults.stagger}
              >
                <div
                  className={cn(
                    "rounded-2xl bg-background p-5 ring-1 ring-border/50 sm:p-6",
                    cardInteractiveClassName,
                    cardShadowClassName,
                  )}
                >
                  <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-brand/10 text-brand ring-1 ring-brand/15">
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3 className="font-heading text-base font-semibold tracking-tight text-foreground">
                    {highlightTitle}
                  </h3>
                  <p className={cn("mt-2", bodyTextClassName, "sm:text-base md:text-lg")}>
                    {description}
                  </p>
                </div>
              </ScrollReveal>
            ),
          )}
        </div>
      </Container>

      <ScrollReveal delay={0.12}>
        <Container
          size="narrow"
          padding="none"
          className="mt-10 space-y-4 sm:mt-12"
        >
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className={bodyTextClassName}>
              {paragraph}
            </p>
          ))}

          {closing ? (
            <p
              className={cn(
                "pt-2 font-medium text-foreground",
                bodyTextClassName,
              )}
            >
              {closing}
            </p>
          ) : null}

          <div className="flex justify-center pt-4 sm:pt-6">
            <SupportCta cta={cta} />
          </div>
        </Container>
      </ScrollReveal>
    </Section>
  );
}
