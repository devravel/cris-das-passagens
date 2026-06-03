import { PackageCardsContinuousCarousel } from "@/components/packages/package-cards-carousel-continuous";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type HeroFeaturedPackagesProps = {
  packages: PublicPackage[];
  departureCity: string;
  title: string;
  className?: string;
};

export function HeroFeaturedPackages({
  packages,
  departureCity,
  title,
  className,
}: HeroFeaturedPackagesProps) {
  if (packages.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-4 sm:min-w-[280px] sm:gap-5 lg:min-w-[300px]",
        className,
      )}
    >
      <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl lg:text-[1.35rem]">
        {title}
      </h2>

      <PackageCardsContinuousCarousel
        packages={packages}
        departureCity={departureCity}
        ariaLabel="Pacotes em destaque"
        variant="landing"
        showDots={packages.length > 1}
        scrollHintAlwaysVisible
        showNavButtons
      />
    </div>
  );
}
