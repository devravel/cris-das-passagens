"use client";

import { InfiniteDragMarquee } from "@/components/infinite-drag-marquee";
import { GoogleReviewCard } from "@/components/sections/testimonials/google-reviews/google-review-card";
import type { GoogleReview } from "@/config/google-reviews-fallback";
import { cn } from "@/lib/utils";

type GoogleReviewsCarouselProps = {
  reviews: readonly GoogleReview[];
  onOpenReview: (reviewId: string) => void;
  className?: string;
};

export function GoogleReviewsCarousel({
  reviews,
  onOpenReview,
  className,
}: GoogleReviewsCarouselProps) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <div className={cn("relative min-w-0", className)}>
      <InfiniteDragMarquee
        speed={28}
        gapClassName="gap-3 pr-3 sm:gap-4 sm:pr-4"
        ariaLabel="Avaliações do Google"
        className="py-0.5"
      >
        {reviews.map((review) => (
          <div
            key={review.id}
            className="w-[min(300px,85vw)] sm:w-[280px] lg:w-[300px]"
          >
            <GoogleReviewCard
              review={review}
              onOpen={onOpenReview}
              className="h-full"
            />
          </div>
        ))}
      </InfiniteDragMarquee>
    </div>
  );
}
