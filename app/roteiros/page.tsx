import type { Metadata } from "next";

import { ItineraryBanner } from "@/components/itineraries/itinerary-banner";
import { ItineraryCard } from "@/components/itineraries/itinerary-card";
import { Container } from "@/components/layout/container";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { CtaButton } from "@/components/ui/cta-button";
import { getItinerariesGroupedByCategory } from "@/lib/itinerary/queries";
import { getQuoteWhatsAppUrl } from "@/lib/coupon/whatsapp";
import { scrollRevealDefaults } from "@/lib/motion";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Roteiros de viagem",
  description:
    "Todos os roteiros da Cris das Passagens: viagens prontas com itinerário, hospedagem e saídas, organizadas por temporada e estilo.",
  path: "/roteiros",
  keywords: ["roteiros de viagem", "pacotes prontos", "viagens nacionais", "viagens internacionais", "Cris das Passagens"],
});

export const revalidate = 3600;

const breadcrumbs = [
  { name: "Início", path: "/" },
  { name: "Roteiros", path: "/roteiros" },
] as const;

/** Foto da faixa de topo — a mesma dos cards de serviço da hero. */
const BANNER_IMAGE = "/hero/servicos/pacotes.webp";

export default async function RoteirosPage() {
  const categories = await getItinerariesGroupedByCategory();

  return (
    <>
      <PageBreadcrumb items={breadcrumbs} />
      <ItineraryBanner title="Todos os roteiros" image={BANNER_IMAGE} priority>
        <p>Viagens prontas, do embarque ao passeio. Escolha uma e a gente ajusta datas, hotel e orçamento.</p>
      </ItineraryBanner>

      <Container className="py-8 sm:py-10">
        {categories.length === 0 ? (
          <div className="mx-auto max-w-xl space-y-4 rounded-2xl border border-dashed border-border/70 p-8 text-center">
            <p className="text-muted-foreground">
              Os roteiros estão sendo preparados. Enquanto isso, a gente monta o seu no WhatsApp.
            </p>
            <div className="flex justify-center">
              <CtaButton href={getQuoteWhatsAppUrl()} label="Montar meu roteiro" trackingSource="content_cta" />
            </div>
          </div>
        ) : (
          <div className="space-y-10 sm:space-y-12">
            {categories.map((category, categoryIndex) => (
              <section key={category.id} id={category.slug} aria-labelledby={`categoria-${category.slug}`}>
                <ScrollReveal>
                  <h2
                    id={`categoria-${category.slug}`}
                    className="mb-4 flex items-center gap-3 font-heading text-2xl font-bold uppercase tracking-tight text-foreground before:h-7 before:w-1.5 before:rounded-full before:bg-brand sm:text-[1.65rem]"
                  >
                    {category.name}
                  </h2>
                </ScrollReveal>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {category.itineraries.map((itinerary, index) => (
                    <ScrollReveal key={itinerary.id} delay={index * scrollRevealDefaults.stagger}>
                      <ItineraryCard itinerary={itinerary} priority={categoryIndex === 0 && index < 4} />
                    </ScrollReveal>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </Container>
    </>
  );
}
