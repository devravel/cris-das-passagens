import Image from "next/image";

import { Container } from "@/components/layout/container";
import { NavbarCtaButton } from "@/components/layout/navbar";
import { Section } from "@/components/layout/section";
import {
  sectionHeadingClassName,
  SectionHeader,
  bodyTextClassName,
} from "@/components/layout/section-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { ContentCtaButton } from "@/components/ui/content-cta-button";
import { content, type ContentCta } from "@/config/content";
import { navbarCta } from "@/config/navigation";
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

/** Azul da logo (texto/swoosh). */
const LOGO_BLUE_DARK = "#345aa6";

type SupportHighlight = {
  title: string;
  description: string;
  /** PNG sem fundo, funciona como um ícone grande na lateral do card. */
  image: string;
};

const defaultHighlights: SupportHighlight[] = [
  {
    title: content.support.highlights[0].title,
    description: content.support.highlights[0].description,
    image: "/suporte/atendimento.png",
  },
  {
    title: content.support.highlights[1].title,
    description: content.support.highlights[1].description,
    image: "/suporte/juridico.png",
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

      <Container padding="none" className="max-w-5xl">
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
          {highlights.map(({ title: highlightTitle, description, image }, index) => (
            <ScrollReveal
              key={highlightTitle}
              delay={index * scrollRevealDefaults.stagger}
            >
              <TiltCard
                className={cn(
                  "relative flex h-full min-h-[200px] overflow-hidden rounded-2xl text-white ring-1 ring-[#345aa6]/40 sm:min-h-[190px]",
                  "shadow-[0_8px_30px_-14px_rgba(52,90,166,0.4)] hover:z-10 hover:shadow-[0_36px_70px_-24px_rgba(52,90,166,0.7)]",
                  "transition-shadow duration-700 ease-out",
                )}
                style={{ backgroundColor: LOGO_BLUE_DARK }}
              >
                <div className="relative w-[38%] shrink-0 self-stretch sm:w-[36%]">
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 896px) 200px, 38vw"
                    className="object-contain object-left transition-transform duration-1000 ease-out group-hover:scale-110 motion-reduce:transition-none"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-center py-5 pr-5 pl-2 sm:py-6 sm:pr-6 sm:pl-2">
                  <h3 className="font-heading text-base font-bold uppercase leading-snug tracking-[0.06em] sm:text-[1.0625rem]">
                    {highlightTitle}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-white/85 sm:text-[1.0625rem]">
                    {description}
                  </p>
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </Container>

      <ScrollReveal delay={0.12}>
        <Container
          size="narrow"
          padding="none"
          className="mt-10 space-y-4 sm:mt-12"
        >
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className={cn(bodyTextClassName, "text-center")}>
              {paragraph}
            </p>
          ))}

          {closing ? (
            <p
              className={cn(
                "pt-2 font-medium text-foreground",
                bodyTextClassName,
                "text-center",
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
