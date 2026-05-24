import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { PromotionsSlideshow } from "@/components/sections/promotions/promotions-slideshow";
import { getActivePromotions } from "@/lib/promotion/queries";
import { scrollRevealDefaults } from "@/lib/motion";

export async function PromotionsSection() {
  const promotions = await getActivePromotions();

  if (promotions.length === 0) {
    return null;
  }

  return (
    <Section spacing="compact" background="soft" bordered aria-labelledby="promotions-heading">
      <ScrollReveal y={scrollRevealDefaults.y}>
        <SectionHeader
          id="promotions-heading"
          title="Promoções em destaque"
          subtitle="Ofertas selecionadas para você viajar pagando menos, com assessoria completa."
          className="mb-6 sm:mb-8"
        />
      </ScrollReveal>

      <ScrollReveal y={scrollRevealDefaults.y} delay={scrollRevealDefaults.stagger}>
        <PromotionsSlideshow promotions={promotions} />
      </ScrollReveal>
    </Section>
  );
}
