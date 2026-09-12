"use client";


import { Container } from "@/components/layout/container";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { sectionHeadingClassName } from "@/components/layout/section-header";
import { Section } from "@/components/layout/section";
import { PartnersLogosMarquee } from "@/components/sections/trust/partners-logos-marquee";
import { content } from "@/config/content";
import { cn } from "@/lib/utils";

export type PartnersSectionProps = {
  sectionId?: string;
  className?: string;
};

export function PartnersSection({
  sectionId = "parceiros",
  className,
}: PartnersSectionProps) {
  const headingId = `${sectionId}-heading`;
  const logos = content.partners.logos;

  return (
    <Section
      id={sectionId}
      background="default"
      spacing="compact"
      contained={false}
      className={cn(
        "border-b border-border/50 py-10 sm:py-12 lg:py-14",
        className,
      )}
      aria-labelledby={headingId}
    >
      <Container>
        <ScrollReveal className="overflow-hidden">
          <h2
            id={headingId}
            className={cn(sectionHeadingClassName, "mb-8 sm:mb-10 lg:mb-12")}
          >
            {content.partners.title}
          </h2>
        </ScrollReveal>

        <PartnersLogosMarquee logos={logos} />
      </Container>
    </Section>
  );
}
