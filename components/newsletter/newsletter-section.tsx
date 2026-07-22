"use client";

import { motion } from "framer-motion";

import { Container } from "@/components/layout/container";
import {
  sectionHeadingClassName,
  sectionSubtitleClassName,
} from "@/components/layout/section-header";
import { Section } from "@/components/layout/section";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { newsletterSectionContent } from "@/config/newsletter";
import { useEntranceMotion } from "@/hooks/use-entrance-motion";
import { cn } from "@/lib/utils";

export type NewsletterSectionProps = {
  sectionId?: string;
  className?: string;
};

export function NewsletterSection({
  sectionId = newsletterSectionContent.id,
  className,
}: NewsletterSectionProps) {
  const headingEntrance = useEntranceMotion(0);
  const bodyEntrance = useEntranceMotion(0.08);
  const formEntrance = useEntranceMotion(0.14);
  const headingId = `${sectionId}-heading`;

  return (
    <Section
      id={sectionId}
      background="soft"
      spacing="compact"
      bordered
      className={className}
      aria-labelledby={headingId}
    >
      <Container size="narrow" padding="none">
        <div className="mx-auto max-w-xl text-center">
          <motion.p
            className="text-xs font-semibold uppercase tracking-[0.14em] text-brand"
            {...headingEntrance}
          >
            {newsletterSectionContent.eyebrow}
          </motion.p>

          <motion.h2
            id={headingId}
            className={cn(sectionHeadingClassName, "mt-3")}
            {...headingEntrance}
          >
            {newsletterSectionContent.title}
          </motion.h2>

          <motion.p
            className={cn(sectionSubtitleClassName, "mt-4")}
            {...bodyEntrance}
          >
            {newsletterSectionContent.subtitle}
          </motion.p>
        </div>

        <motion.div
          className="mx-auto mt-8 max-w-md sm:mt-10"
          {...formEntrance}
        >
          <NewsletterForm />
        </motion.div>
      </Container>
    </Section>
  );
}
