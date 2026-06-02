import { PackageCardsCarousel } from "@/components/packages/package-cards-carousel";
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
    <div className={cn("flex min-w-0 flex-col gap-4 sm:gap-5", className)}>
      <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl lg:text-[1.35rem]">
        {title}
      </h2>

      <PackageCardsCarousel
        packages={packages}
        departureCity={departureCity}
        ariaLabel="Pacotes em destaque"
        variant="landing"
      />
    </div>
  );
}
