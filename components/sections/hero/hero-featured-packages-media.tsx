"use client";

import { PublicPackageCard } from "@/components/packages/public-package-card";
import { HeroFeaturedPackagesCarousel } from "@/components/sections/hero/hero-featured-packages-carousel";
import type { PublicPackage } from "@/lib/package/queries";

type HeroFeaturedPackagesMediaProps = {
  packages: PublicPackage[];
  departureCity: string;
};

/**
 * Sempre o carrossel finito com setas (mobile e desktop ≥1024px).
 * Sem marquee/autoplay — navegação só por setas ou arraste.
 */
export function HeroFeaturedPackagesMedia({
  packages,
  departureCity,
}: HeroFeaturedPackagesMediaProps) {
  return (
    <HeroFeaturedPackagesCarousel
      packages={packages}
      departureCity={departureCity}
    />
  );
}
