"use client";

import Image from "next/image";

import { sectionHeadingClassName } from "@/components/layout/section-header";
import { Section } from "@/components/layout/section";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { NewsletterForm } from "@/components/newsletter/newsletter-form";
import { newsletterSectionContent } from "@/config/newsletter";
import { scrollRevealDefaults } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type NewsletterSectionProps = {
  sectionId?: string;
  className?: string;
};

/**
 * Faixa única: foto escurecida de fundo (public/newsletter/fundo.webp), título
 * centralizado e o formulário numa linha só — sem card branco.
 */
export function NewsletterSection({
  sectionId = newsletterSectionContent.id,
  className,
}: NewsletterSectionProps) {
  const headingId = `${sectionId}-heading`;

  return (
    <Section
      id={sectionId}
      background="navy"
      spacing="none"
      className={cn("isolate overflow-hidden py-14 sm:py-16 lg:py-20", className)}
      aria-labelledby={headingId}
    >
      <Image
        src="/newsletter/fundo.webp"
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,oklch(0.18_0.04_264/0.82),oklch(0.18_0.04_264/0.9)),radial-gradient(60%_80%_at_50%_0%,oklch(0.483_0.13_262.2/0.55),transparent_70%)]"
      />

      <div className="mx-auto max-w-4xl text-center">
        <ScrollReveal>
          <p className="text-xs font-bold tracking-[0.16em] text-brand-cyan uppercase">
            {newsletterSectionContent.eyebrow}
          </p>
          <h2 id={headingId} className={cn(sectionHeadingClassName, "mt-3 text-white")}>
            {newsletterSectionContent.title}
          </h2>
          <p className="mt-3 text-base text-white/75 sm:text-lg">
            {newsletterSectionContent.subtitle}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={scrollRevealDefaults.stagger} className="mt-8 sm:mt-10">
          <NewsletterForm />
        </ScrollReveal>
      </div>
    </Section>
  );
}
