"use client";

import { motion } from "framer-motion";

import { Container } from "@/components/layout/container";
import { sectionHeadingClassName } from "@/components/layout/section-header";
import { Section } from "@/components/layout/section";
import { PartnersLogosMarquee } from "@/components/sections/trust/partners-logos-marquee";
import { content } from "@/config/content";
import { useEntranceMotion } from "@/hooks/use-entrance-motion";
import { cn } from "@/lib/utils";

export type PartnersSectionProps = {
  sectionId?: string;
  className?: string;
};

export function PartnersSection({
  sectionId = "parceiros",
  className,
}: PartnersSectionProps) {
  const entrance = useEntranceMotion(0.08);
  const headingId = `${sectionId}-heading`;
  const logos = content.partners.logos;

  return (
    <Section
      id={sectionId}
      background="default"
      spacing="compact"
      contained={false}
      className={cn(
        "border-b border-border/50 py-12 sm:py-14 lg:py-16",
        className,
      )}
      aria-labelledby={headingId}
    >
      <Container>
        <motion.div className="overflow-hidden" {...entrance}>
          <h2
            id={headingId}
            className={cn(sectionHeadingClassName, "mb-8 sm:mb-10 lg:mb-12")}
          >
            {content.partners.title}
          </h2>
        </motion.div>

        <PartnersLogosMarquee logos={logos} />
      </Container>
    </Section>
  );
}
