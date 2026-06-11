"use client";

import { useCallback, useMemo, useState } from "react";

import {
  computeGoogleReviewsStats,
  googleReviewsFallbackConfig,
} from "@/config/google-reviews-fallback";
import { GoogleReviewModal } from "@/components/sections/testimonials/google-reviews/google-review-modal";
import { findReviewIndex } from "@/components/sections/testimonials/google-reviews/google-review-utils";
import { GoogleReviewsCarousel } from "@/components/sections/testimonials/google-reviews/google-reviews-carousel";
import { GoogleReviewsHeader } from "@/components/sections/testimonials/google-reviews/google-reviews-header";
import { cn } from "@/lib/utils";

type GoogleReviewsFallbackProps = {
  className?: string;
};

export function GoogleReviewsFallback({ className }: GoogleReviewsFallbackProps) {
  const { reviews, reviewUrl, reviewButtonLabel } = googleReviewsFallbackConfig;
  const stats = useMemo(() => computeGoogleReviewsStats(reviews), [reviews]);

  const [modalOpen, setModalOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleOpenReview = useCallback(
    (reviewId: string) => {
      const index = findReviewIndex(reviews, reviewId);

      if (index >= 0) {
        setActiveIndex(index);
        setModalOpen(true);
      }
    },
    [reviews],
  );

  const handleNavigate = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  return (
    <div className={cn("min-w-0 space-y-5 sm:space-y-6", className)}>
      <GoogleReviewsHeader
        averageRating={stats.average}
        reviewCount={stats.count}
        reviewUrl={reviewUrl}
        reviewButtonLabel={reviewButtonLabel}
      />

      <GoogleReviewsCarousel reviews={reviews} onOpenReview={handleOpenReview} />

      <GoogleReviewModal
        reviews={reviews}
        activeIndex={activeIndex}
        open={modalOpen}
        onOpenChange={setModalOpen}
        onNavigate={handleNavigate}
      />
    </div>
  );
}
