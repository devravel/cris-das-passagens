import { ExternalLink } from "lucide-react";

import { GoogleReviewStars } from "@/components/sections/testimonials/google-reviews/google-review-stars";
import { formatAverageRating } from "@/components/sections/testimonials/google-reviews/google-review-utils";
import { GoogleReviewsLogo } from "@/components/sections/testimonials/google-reviews/google-reviews-logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type GoogleReviewsHeaderProps = {
  averageRating: number;
  reviewCount: number;
  reviewUrl: string;
  reviewButtonLabel: string;
  className?: string;
};

export function GoogleReviewsHeader({
  averageRating,
  reviewCount,
  reviewUrl,
  reviewButtonLabel,
  className,
}: GoogleReviewsHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-5 rounded-2xl border border-border/60 bg-background/90 p-4 shadow-[0_8px_30px_-14px_rgba(52,91,167,0.12)] ring-1 ring-border/50 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <GoogleReviewsLogo />
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-2xl font-semibold leading-none text-foreground sm:text-3xl">
            {formatAverageRating(averageRating)}
          </span>
          <GoogleReviewStars rating={averageRating} size="md" />
          <span className="text-sm text-muted-foreground sm:text-base">
            ({reviewCount})
          </span>
        </div>
      </div>

      <Button
        asChild
        variant="outline"
        size="lg"
        className="h-10 w-full shrink-0 rounded-lg border-border/80 bg-background px-4 text-sm font-medium shadow-sm transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-px hover:border-brand/35 hover:bg-brand/5 hover:shadow-md active:translate-y-0 sm:w-auto"
      >
        <a
          href={reviewUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${reviewButtonLabel} (abre em nova aba)`}
        >
          {reviewButtonLabel}
          <ExternalLink className="size-4" aria-hidden />
        </a>
      </Button>
    </div>
  );
}
