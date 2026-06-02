"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { Container } from "@/components/layout/container";
import { sectionHeadingClassName } from "@/components/layout/section-header";
import { Section } from "@/components/layout/section";
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

  return (
    <Section
      id={sectionId}
      background="navy"
      spacing="compact"
      contained={false}
      className={cn("border-b border-white/10 pb-10 pt-12 sm:pb-12 sm:pt-14 lg:pb-14", className)}
      aria-labelledby={headingId}
    >
      <Container>
        <motion.div className="space-y-8 sm:space-y-10" {...entrance}>
          <h2
            id={headingId}
            className={cn(sectionHeadingClassName, "text-white/90")}
          >
            {content.partners.title}
          </h2>

          <ul className="flex flex-wrap items-center justify-center gap-8 sm:gap-10 md:gap-12 lg:gap-14">
            {content.partners.logos.map((logo) => (
              <li key={logo.src}>
                <div className="flex h-14 w-28 items-center justify-center sm:h-16 sm:w-32 md:h-[4.5rem] md:w-36">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={144}
                    height={72}
                    className="max-h-full max-w-full object-contain opacity-90 brightness-0 invert"
                  />
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </Container>
    </Section>
  );
}
