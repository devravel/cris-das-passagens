"use client";

import Image from "next/image";

import type { GoogleReview } from "@/config/google-reviews-fallback";
import { GoogleVerifiedBadge } from "@/components/sections/testimonials/google-reviews/google-reviews-logo";
import { GoogleReviewStars } from "@/components/sections/testimonials/google-reviews/google-review-stars";
import {
  getAvatarColorClass,
  getReviewInitials,
  getReviewPreviewText,
  shouldTruncateReviewText,
} from "@/components/sections/testimonials/google-reviews/google-review-utils";
import { cn } from "@/lib/utils";

type GoogleReviewCardProps = {
  review: GoogleReview;
  onOpen: (reviewId: string) => void;
  className?: string;
};

export function GoogleReviewCard({
  review,
  onOpen,
  className,
}: GoogleReviewCardProps) {
  const isTruncated = shouldTruncateReviewText(review.text);
  const previewText = getReviewPreviewText(review.text);
  const initials = getReviewInitials(review.name);

  return (
    <article
      className={cn(
        "flex h-full min-w-0 flex-col rounded-2xl border border-border/60 bg-background p-4 shadow-sm ring-1 ring-border/40 transition-[box-shadow,border-color] duration-200 hover:border-brand/25 hover:shadow-[0_8px_24px_-12px_rgba(52,91,167,0.2)] sm:p-5",
        className,
      )}
    >
      <button
        type="button"
        className="flex min-w-0 flex-1 flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        onClick={() => onOpen(review.id)}
        aria-label={`Abrir avaliação completa de ${review.name}`}
      >
        <div className="flex items-start gap-3">
          {review.avatar ? (
            <Image
              src={review.avatar}
              alt=""
              width={40}
              height={40}
              className="size-10 shrink-0 rounded-full object-cover"
            />
          ) : (
            <span
              className={cn(
                "inline-flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white",
                getAvatarColorClass(review.name),
              )}
              aria-hidden
            >
              {initials}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                {review.name}
              </p>
              <GoogleVerifiedBadge />
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <GoogleReviewStars rating={review.rating} size="sm" />
            </div>
          </div>
        </div>

        <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-foreground/90 sm:text-[0.95rem]">
          {previewText}
        </p>

        {isTruncated ? (
          <span className="mt-3 inline-flex text-sm font-medium text-brand hover:underline">
            Leia mais
          </span>
        ) : null}
      </button>
    </article>
  );
}
