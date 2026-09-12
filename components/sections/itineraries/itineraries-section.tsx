import Image from "next/image";

import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { ContentCtaButton } from "@/components/ui/content-cta-button";
import { content } from "@/config/content";
import { scrollRevealDefaults } from "@/lib/motion";

const copy = content.itineraries;

/**
 * Demonstração de "roteiros" pro Cris (produto ainda não existe).
 * Conteúdo estático em `content.itineraries`; desligar com `enabled: false`.
 */
export function ItinerariesSection({
  sectionId = "roteiros",
}: {
  sectionId?: string;
}) {
  const headingId = `${sectionId}-heading`;

  return (
    <Section
      id={sectionId}
      background="soft"
      spacing="compact"
      aria-labelledby={headingId}
    >
      <ScrollReveal>
        <SectionHeader
          id={headingId}
          title={copy.title}
          subtitle={copy.subtitle}
        />
      </ScrollReveal>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {copy.items.map((item, index) => (
          <ScrollReveal
            key={item.title}
            delay={index * scrollRevealDefaults.stagger}
          >
            <TiltCard scale={1.05} lift={12} tilt={5}>
              <article className="relative isolate flex aspect-[16/10] flex-col justify-end overflow-hidden rounded-2xl bg-brand-navy text-white sm:aspect-[3/2]">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-[1.06] motion-reduce:transition-none"
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-linear-to-t from-brand-navy via-brand-navy/40 to-transparent"
                />
                <div className="relative p-4 sm:p-5">
                  <h3 className="font-heading text-xl font-bold leading-tight tracking-tight sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/80">
                    {item.description}
                  </p>
                </div>
              </article>
            </TiltCard>
          </ScrollReveal>
        ))}
      </div>

      <ScrollReveal delay={0.12}>
        <div className="mt-8 flex justify-center sm:mt-10">
          <ContentCtaButton cta={copy.cta} />
        </div>
      </ScrollReveal>
    </Section>
  );
}
