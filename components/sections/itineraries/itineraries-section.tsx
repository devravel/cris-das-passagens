import { ItineraryCard } from "@/components/itineraries/itinerary-card";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { ContentCtaButton } from "@/components/ui/content-cta-button";
import { content } from "@/config/content";
import { getFeaturedHomeItineraries } from "@/lib/itinerary/queries";
import { scrollRevealDefaults } from "@/lib/motion";

const copy = content.itineraries;

/** Roteiros marcados como destaque no admin. Sem destaque, a seção não renderiza. */
export async function ItinerariesSection({
  sectionId = "roteiros",
}: {
  sectionId?: string;
}) {
  const itineraries = await getFeaturedHomeItineraries();

  if (itineraries.length === 0) {
    return null;
  }

  const headingId = `${sectionId}-heading`;

  return (
    <Section
      id={sectionId}
      background="soft"
      spacing="compact"
      aria-labelledby={headingId}
    >
      <ScrollReveal>
        <SectionHeader id={headingId} title={copy.title} />
      </ScrollReveal>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {itineraries.map((itinerary, index) => (
          <ScrollReveal
            key={itinerary.id}
            delay={index * scrollRevealDefaults.stagger}
          >
            <TiltCard scale={1.05} lift={12} tilt={5}>
              {/* Na home o card é mais baixo e largo; em /roteiros fica em pé. */}
              <ItineraryCard itinerary={itinerary} className="aspect-[6/5]" />
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
