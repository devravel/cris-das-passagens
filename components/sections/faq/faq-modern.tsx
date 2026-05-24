import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Section } from "@/components/layout/section";
import { Container } from "@/components/layout/container";
import { SectionHeader } from "@/components/layout/section-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import {
  Accordion,
  AccordionContent,
  AccordionHeader,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { content, type ContentCta, type FaqItem } from "@/config/content";
import { scrollRevealDefaults } from "@/lib/motion";
import { createFaqPageJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";

export type FaqModernProps = {
  sectionId?: string;
  title?: string;
  items?: FaqItem[];
  cta?: ContentCta;
  className?: string;
};

export function FaqModern({
  sectionId = "faq",
  title = content.faq.title,
  items = content.faq.items,
  cta = content.faq.cta,
  className,
}: FaqModernProps) {
  const headingId = `${sectionId}-heading`;

  return (
    <Section
      background="default"
      spacing="default"
      bordered
      className={className}
      aria-labelledby={headingId}
    >
      <JsonLdScript data={createFaqPageJsonLd(items)} />

      <ScrollReveal>
        <SectionHeader id={headingId} title={title} />
      </ScrollReveal>

      <ScrollReveal delay={scrollRevealDefaults.stagger}>
        <Container size="narrow" padding="none">
        <div
          className={cn(
            "rounded-2xl border border-border/60 bg-background px-1 shadow-[0_8px_30px_-14px_rgba(52,91,167,0.12)] ring-1 ring-border/50 sm:px-2"
          )}
        >
          <Accordion
            type="single"
            collapsible
            className="px-4 sm:px-5"
            defaultValue={items[0] ? `${sectionId}-0` : undefined}
          >
            {items.map((item, index) => {
              const value = `${sectionId}-${index}`;

              return (
                <AccordionItem key={value} value={value}>
                  <AccordionHeader>
                    <AccordionTrigger className="gap-4 text-left [&>svg:last-child]:mt-1">
                      {item.question}
                    </AccordionTrigger>
                  </AccordionHeader>
                  <AccordionContent>
                    <p className="text-muted-foreground">{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        <div className="mt-10 flex justify-center sm:mt-12">
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
