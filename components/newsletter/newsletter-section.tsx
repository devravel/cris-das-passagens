"use client";

import { motion } from "framer-motion";

import {
  sectionHeadingClassName,
  sectionSubtitleClassName,
} from "@/components/layout/section-header";
import { Section } from "@/components/layout/section";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { newsletterSectionContent } from "@/config/newsletter";
import { useEntranceMotion } from "@/hooks/use-entrance-motion";
import { cn } from "@/lib/utils";

/** Azul escuro amostrado da logo (`cris-das-passagens-logo-nav.png`). */
const LOGO_BLUE_DARK = "#345aa6";

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
      background="default"
      spacing="compact"
      bordered
      className={cn("border-white/10 text-white", className)}
      style={{ backgroundColor: LOGO_BLUE_DARK }}
      aria-labelledby={headingId}
    >
      <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-10 xl:gap-14">
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:max-w-none lg:text-left">
          <motion.p
            className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80"
            {...headingEntrance}
          >
            {newsletterSectionContent.eyebrow}
          </motion.p>

          <motion.h2
            id={headingId}
            className={cn(
              sectionHeadingClassName,
              "mt-3 text-white lg:text-left",
            )}
            {...headingEntrance}
          >
            {newsletterSectionContent.title}
          </motion.h2>

          <motion.p
            className={cn(
              sectionSubtitleClassName,
              "mt-3 text-white/85 lg:mt-4 lg:text-left",
            )}
            {...bodyEntrance}
          >
            {newsletterSectionContent.subtitle}
          </motion.p>
        </div>

        <motion.div
          className="mx-auto w-full max-w-md rounded-2xl bg-background p-5 text-foreground shadow-sm ring-1 ring-border/50 sm:p-6 lg:mx-0 lg:max-w-none"
          {...formEntrance}
        >
          <NewsletterForm className="space-y-3.5 sm:space-y-4" />
        </motion.div>
      </div>
    </Section>
  );
}
