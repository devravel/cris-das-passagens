import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Section } from "@/components/layout/section";
import { SectionHeader, bodyTextClassName } from "@/components/layout/section-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Button } from "@/components/ui/button";
import { content, type ContentCta, type ProcessStep } from "@/config/content";
import { scrollRevealDefaults } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type ProcessStepsProps = {
  sectionId?: string;
  title?: string;
  steps?: ProcessStep[];
  cta?: ContentCta;
  className?: string;
};

const stepAccentClasses = [
  "bg-brand/10 text-brand ring-brand/20",
  "bg-brand-light/15 text-brand ring-brand-light/25",
  "bg-brand-whatsapp/12 text-brand-whatsapp ring-brand-whatsapp/20",
  "bg-brand/12 text-brand ring-brand/18",
] as const;

function ProcessStepCard({
  step,
  accentClass,
}: {
  step: ProcessStep;
  accentClass: string;
}) {
  const stepLabel = String(step.step).padStart(2, "0");

  return (
    <div className="flex flex-col items-center text-center">
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-full text-lg font-semibold tabular-nums ring-1 sm:size-16 sm:text-xl",
          accentClass
        )}
        aria-hidden
      >
        {stepLabel}
      </div>

      <h3 className="mt-4 font-heading text-base font-semibold tracking-tight text-foreground sm:mt-5">
        {step.title}
      </h3>
      <p className={cn("mt-2 max-w-xs", bodyTextClassName, "sm:text-base md:text-lg")}>
        {step.description}
      </p>
    </div>
  );
}

export function ProcessSteps({
  sectionId = "como-funciona",
  title = content.process.title,
  steps = content.process.steps,
  cta = content.process.cta,
  className,
}: ProcessStepsProps) {
  const headingId = `${sectionId}-heading`;

  return (
    <Section
      background="soft"
      spacing="default"
      bordered
      className={className}
      aria-labelledby={headingId}
    >
      <ScrollReveal>
        <SectionHeader id={headingId} title={title} className="mb-12 sm:mb-14 lg:mb-16" />
      </ScrollReveal>

      <ol className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-8 lg:grid-cols-4 lg:gap-6">
        {steps.map((step, index) => (
          <li key={step.step}>
            <ScrollReveal delay={index * scrollRevealDefaults.stagger}>
              <ProcessStepCard
                step={step}
                accentClass={stepAccentClasses[index % stepAccentClasses.length]}
              />
            </ScrollReveal>
          </li>
        ))}
      </ol>

      <ScrollReveal delay={0.2}>
        <div className="mt-10 flex justify-center sm:mt-12 lg:mt-14">
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
      </ScrollReveal>
    </Section>
  );
}
