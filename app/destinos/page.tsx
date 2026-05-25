import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { DestinationsGallery } from "@/components/sections/gallery/destinations-gallery";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import { destinationsGalleryConfig } from "@/config/destinations-gallery";
import { getDestinationsGalleryPhotos } from "@/lib/google-places/gallery-photos";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Galeria de Destinos",
  description: destinationsGalleryConfig.subtitle,
  path: "/destinos",
  keywords: [
    "galeria de destinos",
    "viagens",
    "passagens aereas",
    "Cris das Passagens",
  ],
});

export const revalidate = 86_400;

export default async function DestinosPage() {
  const { photos } = await getDestinationsGalleryPhotos();

  return (
    <Section spacing="default" background="default" bordered>
      <div className="mb-6 sm:mb-8">
        <Button
          asChild
          variant="ghost"
          className="h-9 rounded-lg px-3 text-sm text-muted-foreground hover:text-foreground"
        >
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden />
            Voltar para a página inicial
          </Link>
        </Button>
      </div>

      <SectionHeader
        id="destinos-gallery-heading"
        title={destinationsGalleryConfig.title}
        subtitle={destinationsGalleryConfig.subtitle}
        className="mb-10 sm:mb-12"
      />

      <DestinationsGallery
        photos={photos}
        emptyMessage={destinationsGalleryConfig.emptyMessage}
      />
    </Section>
  );
}
