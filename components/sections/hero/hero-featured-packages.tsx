import { CouponApplyForm } from "@/components/coupon/coupon-apply-form";
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
      <div
        className={cn(
          "flex w-full min-w-0 flex-col gap-3 max-[425px]:gap-2",
          "min-[426px]:max-lg:flex-row min-[426px]:max-lg:flex-wrap min-[426px]:max-lg:items-start min-[426px]:max-lg:justify-between sm:max-lg:items-center",
          "min-[568px]:max-[768px]:flex-nowrap min-[568px]:max-[768px]:items-center min-[568px]:max-[768px]:gap-4",
        )}
      >
        <h2 className="min-w-0 shrink-0 font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl min-[568px]:max-[768px]:min-w-0 min-[568px]:max-[768px]:flex-1 lg:text-[1.35rem]">
          {title}
        </h2>
        <CouponApplyForm
          inputId="coupon-code-input-mobile"
          className={cn(
            "max-[425px]:w-full max-[425px]:max-w-none max-[425px]:flex-none lg:hidden",
            "min-[568px]:max-[768px]:w-auto min-[568px]:max-[768px]:max-w-[min(100%,17.5rem)] min-[568px]:max-[768px]:shrink-0 min-[568px]:max-[768px]:flex-none",
          )}
        />
      </div>

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
