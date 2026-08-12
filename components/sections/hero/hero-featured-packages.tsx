import { Sparkles } from "lucide-react";
import Link from "next/link";

import { CouponApplyForm } from "@/components/coupon/coupon-apply-form";
import { PackageCarouselScrollHint } from "@/components/packages/package-carousel-scroll-hint";
import { HeroFeaturedPackagesMedia } from "@/components/sections/hero/hero-featured-packages-media";
import { Button } from "@/components/ui/button";
import { content, type ContentCta } from "@/config/content";
import type { PublicPackage } from "@/lib/package/queries";
import { cn } from "@/lib/utils";

type HeroFeaturedPackagesProps = {
  packages: PublicPackage[];
  departureCity: string;
  title: string;
  emptyMessage?: string;
  /** CTA de pacotes exibido só abaixo de 640px, acima do aviso de disponibilidade. */
  mobilePackagesCta?: ContentCta;
  className?: string;
};

function HeroFeaturedPackagesHeader({
  title,
  showCouponForm,
}: {
  title: string;
  showCouponForm: boolean;
}) {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-3 max-[425px]:gap-2",
        "min-[426px]:max-lg:flex-row min-[426px]:max-lg:flex-wrap min-[426px]:max-lg:items-start min-[426px]:max-lg:justify-between sm:max-lg:items-center",
        "min-[568px]:max-[768px]:flex-nowrap min-[568px]:max-[768px]:items-center min-[568px]:max-[768px]:gap-4",
      )}
    >
      <h2 className="min-w-0 w-full shrink-0 text-center font-heading text-xl font-semibold tracking-tight text-foreground sm:text-xl min-[568px]:max-[768px]:min-w-0 min-[568px]:max-[768px]:flex-1 lg:text-[1.35rem]">
        {title}
      </h2>
      {showCouponForm ? (
        <CouponApplyForm
          inputId="coupon-code-input-mobile"
          className={cn(
            "max-[425px]:w-full max-[425px]:max-w-none max-[425px]:flex-none lg:hidden",
            "min-[568px]:max-[768px]:w-auto min-[568px]:max-[768px]:max-w-[min(100%,17.5rem)] min-[568px]:max-[768px]:shrink-0 min-[568px]:max-[768px]:flex-none",
          )}
        />
      ) : null}
    </div>
  );
}

function HeroFeaturedPackagesEmpty({ message }: { message: string }) {
  return (
    <div
      className="hero-featured-packages-empty relative flex min-h-[12.5rem] w-full items-center justify-center overflow-hidden rounded-2xl border border-dashed border-border/70 bg-background/70 px-6 py-10 shadow-sm sm:min-h-[15rem] sm:px-8 sm:py-12"
      role="status"
      aria-live="polite"
    >
      <div
        aria-hidden
        className="hero-featured-packages-empty__glow pointer-events-none absolute inset-0 bg-linear-to-br from-brand-soft/35 via-transparent to-brand/10"
      />
      <p className="hero-featured-packages-empty__message relative max-w-sm text-center font-heading text-base font-semibold leading-snug text-foreground/85 sm:text-lg">
        <Sparkles
          className="hero-featured-packages-empty__icon mx-auto mb-3 size-5 text-brand sm:mb-3.5 sm:size-6"
          aria-hidden
        />
        {message}
      </p>
    </div>
  );
}

export function HeroFeaturedPackages({
  packages,
  departureCity,
  title,
  emptyMessage = content.hero.featuredPackages.emptyMessage,
  mobilePackagesCta,
  className,
}: HeroFeaturedPackagesProps) {
  const hasPackages = packages.length > 0;

  return (
    <div
      className={cn(
        "flex w-full min-w-0 flex-col gap-3 sm:min-w-[280px] sm:gap-3.5 lg:min-w-[300px] lg:gap-2.5",
        className,
      )}
    >
      <HeroFeaturedPackagesHeader title={title} showCouponForm={hasPackages} />

      {hasPackages ? (
        <>
          <HeroFeaturedPackagesMedia
            packages={packages}
            departureCity={departureCity}
          />
          <div className="mt-[0.525rem] flex flex-col items-center gap-2.5 sm:mt-[0.65625rem] sm:gap-0 md:mt-[0.7875rem]">
            {mobilePackagesCta ? (
              <Button
                asChild
                size="lg"
                variant="outline"
                className="h-11 w-full rounded-lg border-border/80 bg-background/80 px-6 text-sm text-foreground backdrop-blur-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:scale-[1.02] hover:!bg-background/80 hover:!text-foreground hover:shadow-md active:translate-y-0 active:scale-100 sm:hidden"
              >
                <Link href={mobilePackagesCta.href}>{mobilePackagesCta.label}</Link>
              </Button>
            ) : null}
            <PackageCarouselScrollHint className="text-center text-[0.7725rem]" />
          </div>
        </>
      ) : (
        <HeroFeaturedPackagesEmpty message={emptyMessage} />
      )}
    </div>
  );
}
