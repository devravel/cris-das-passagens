"use client";

import { InfiniteDragMarquee } from "@/components/infinite-drag-marquee";
import { PackageCarouselScrollHint } from "@/components/packages/package-carousel-scroll-hint";
import { PublicPackageCard } from "@/components/packages/public-package-card";
import { HeroFeaturedPackagesCarousel } from "@/components/sections/hero/hero-featured-packages-carousel";
import { useMediaQuery } from "@/hooks/use-media-query";
import type { PublicPackage } from "@/lib/package/queries";

type HeroFeaturedPackagesMediaProps = {
  packages: PublicPackage[];
  departureCity: string;
};

const LG_MIN_WIDTH_QUERY = "(min-width: 1024px)";

export function HeroFeaturedPackagesMedia({
  packages,
  departureCity,
}: HeroFeaturedPackagesMediaProps) {
  // Mobile-first: SSR + primeira pintura montam o carousel; desktop troca após mount.
  const isDesktop = useMediaQuery(LG_MIN_WIDTH_QUERY, false);

  if (isDesktop) {
    return (
      <div className="relative min-w-0">
        <InfiniteDragMarquee
          speed={28}
          gapClassName="gap-3 pr-3 sm:gap-3.5 sm:pr-3.5"
          ariaLabel="Pacotes em destaque"
          className="hero-featured-packages-marquee py-1"
        >
          {packages.map((pkg) => (
            <div key={pkg.id} className="flex w-[190px] items-stretch">
              <PublicPackageCard
                pkg={pkg}
                departureCity={departureCity}
                layout="carousel"
                variant="landing"
                size="compact"
                narrowMobileTypography
                className="h-full min-w-0"
              />
            </div>
          ))}
        </InfiniteDragMarquee>

        <PackageCarouselScrollHint className="mt-[0.525rem] text-center text-[0.7725rem] sm:mt-[0.65625rem] md:mt-[0.7875rem]" />
      </div>
    );
  }

  return (
    <HeroFeaturedPackagesCarousel
      packages={packages}
      departureCity={departureCity}
    />
  );
}
