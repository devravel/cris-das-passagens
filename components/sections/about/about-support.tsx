import { Scale, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import { NavbarCtaButton } from "@/components/layout/navbar";
import { Section } from "@/components/layout/section";
import {
  sectionHeadingClassName,
  SectionHeader,
  bodyTextClassName,
} from "@/components/layout/section-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { ContentCtaButton } from "@/components/ui/content-cta-button";
import { content, type ContentCta } from "@/config/content";
import { navbarCta } from "@/config/navigation";
import {
  cardContentContainerClassName,
  cardInteractiveClassName,
} from "@/lib/card-styles";
import { scrollRevealDefaults } from "@/lib/motion";
import { cn } from "@/lib/utils";

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
            <ContentCtaButton cta={cta} />
          </div>
        </Container>
      </ScrollReveal>
    </Section>
  );
}

/** Cores exatas da logo (texto/swoosh e “C” ciano). */
const LOGO_BLUE_DARK = "#345aa6";
const LOGO_BLUE_LIGHT = "#08bfff";

type SupportHighlightTone = "logo-dark" | "logo-light";

type SupportHighlight = {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: SupportHighlightTone;
};

const highlightToneStyles: Record<
  SupportHighlightTone,
  {
    backgroundColor: string;
    card: string;
    iconWrap: string;
    title: string;
    body: string;
  }
> = {
  "logo-dark": {
    backgroundColor: LOGO_BLUE_DARK,
    card: "ring-[#345aa6]/40 shadow-[0_8px_30px_-14px_rgba(52,90,166,0.4)] hover:shadow-[0_14px_40px_-16px_rgba(52,90,166,0.5)]",
    iconWrap: "bg-white/15 text-white ring-1 ring-white/25",
    title: "text-white",
    body: "text-white/85",
  },
  "logo-light": {
    backgroundColor: LOGO_BLUE_LIGHT,
    card: "ring-[#08bfff]/40 shadow-[0_8px_30px_-14px_rgba(8,191,255,0.4)] hover:shadow-[0_14px_40px_-16px_rgba(8,191,255,0.5)]",
    iconWrap: "bg-white/20 text-white ring-1 ring-white/30",
    title: "text-white",
    body: "text-white/90",
  },
};

const defaultHighlights: SupportHighlight[] = [
  {
    title: content.support.highlights[0].title,
    description: content.support.highlights[0].description,
    icon: Users,
    tone: "logo-dark",
  },
  {
    title: content.support.highlights[1].title,
    description: content.support.highlights[1].description,
    icon: Scale,
    tone: "logo-light",
  },
];

export type SupportSectionProps = {
  sectionId?: string;
  title?: string;
  intro?: string;
  paragraphs?: readonly string[];
  highlights?: SupportHighlight[];
  closing?: string;
  className?: string;
};

export function SupportSection({
  sectionId = "suporte-total",
  title = content.support.title,
  intro = content.support.intro,
  paragraphs = content.support.paragraphs,
  highlights = defaultHighlights,
  closing = content.support.closing,
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
            ({ title: highlightTitle, description, icon: Icon, tone }, index) => {
              const toneStyles = highlightToneStyles[tone];

              return (
              <ScrollReveal
                key={highlightTitle}
                delay={index * scrollRevealDefaults.stagger}
              >
                <div
                  className={cn(
                    "rounded-2xl p-5 ring-1 sm:p-6",
                    toneStyles.card,
                    cardContentContainerClassName,
                    cardInteractiveClassName,
                  )}
                  style={{ backgroundColor: toneStyles.backgroundColor }}
                >
                  <div
                    className={cn(
                      "mb-3 flex size-11 items-center justify-center rounded-xl",
                      toneStyles.iconWrap,
                    )}
                  >
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                  </div>
                  <h3
                    className={cn(
                      "font-heading text-base font-semibold tracking-tight",
                      toneStyles.title,
                    )}
                  >
                    {highlightTitle}
                  </h3>
                  <p
                    className={cn(
                      "mt-2",
                      bodyTextClassName,
                      toneStyles.body,
                    )}
                  >
                    {description}
                  </p>
                </div>
              </ScrollReveal>
              );
            },
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
            <NavbarCtaButton
              cta={navbarCta}
              className="h-12 min-h-12 max-w-none px-8 py-0 text-base sm:h-14 sm:px-10 sm:text-lg md:h-14 md:px-10 md:text-lg"
            />
          </div>
        </Container>
      </ScrollReveal>
    </Section>
  );
}
