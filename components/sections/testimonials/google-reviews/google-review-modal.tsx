"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, XIcon } from "lucide-react";
import { useCallback, useEffect } from "react";

import type { GoogleReview } from "@/config/google-reviews-fallback";
import { GoogleReviewStars } from "@/components/sections/testimonials/google-reviews/google-review-stars";
import {
  formatReviewDate,
  getAvatarColorClass,
  getReviewInitials,
} from "@/components/sections/testimonials/google-reviews/google-review-utils";
import { GoogleVerifiedBadge } from "@/components/sections/testimonials/google-reviews/google-reviews-logo";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type GoogleReviewModalProps = {
  reviews: readonly GoogleReview[];
  activeIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (index: number) => void;
};

const navButtonClassName =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-border/80 bg-background text-muted-foreground shadow-sm transition-[transform,background-color,border-color,color,box-shadow] duration-200 hover:scale-[1.04] hover:border-brand/35 hover:bg-brand/5 hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-35 motion-reduce:transition-none motion-reduce:hover:scale-100";

export function GoogleReviewModal({
  reviews,
  activeIndex,
  open,
  onOpenChange,
  onNavigate,
}: GoogleReviewModalProps) {
  const review = reviews[activeIndex];
  const hasMultiple = reviews.length > 1;
  const canGoPrev = hasMultiple && activeIndex > 0;
  const canGoNext = hasMultiple && activeIndex < reviews.length - 1;

  const goPrev = useCallback(() => {
    if (canGoPrev) {
      onNavigate(activeIndex - 1);
    }
  }, [activeIndex, canGoPrev, onNavigate]);

  const goNext = useCallback(() => {
    if (canGoNext) {
      onNavigate(activeIndex + 1);
    }
  }, [activeIndex, canGoNext, onNavigate]);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goPrev();
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNext();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, open]);

  if (!review) {
    return null;
  }

  const initials = getReviewInitials(review.name);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50 backdrop-blur-sm duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 outline-none duration-300 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 sm:w-[calc(100%-2rem)]",
          )}
          aria-describedby={`review-modal-text-${review.id}`}
        >
        <DialogPrimitive.Close asChild>
          <Button
            variant="ghost"
            className="absolute -top-10 right-0 z-10 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white"
            size="icon-sm"
            aria-label="Fechar avaliação"
          >
            <XIcon />
          </Button>
        </DialogPrimitive.Close>

        <div className="grid max-h-[min(88vh,720px)] gap-0 overflow-hidden rounded-xl border border-border/70 bg-popover text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/10">
        <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-4 sm:px-6">
          <button
            type="button"
            className={navButtonClassName}
            onClick={goPrev}
            disabled={!canGoPrev}
            aria-label="Avaliação anterior"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>

          <p className="text-center text-xs text-muted-foreground sm:text-sm">
            {activeIndex + 1} de {reviews.length}
          </p>

          <button
            type="button"
            className={navButtonClassName}
            onClick={goNext}
            disabled={!canGoNext}
            aria-label="Próxima avaliação"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex items-start gap-3 sm:gap-4">
            {review.avatar ? (
              <Image
                src={review.avatar}
                alt=""
                width={48}
                height={48}
                className="size-12 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span
                className={cn(
                  "inline-flex size-12 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white",
                  getAvatarColorClass(review.name),
                )}
                aria-hidden
              >
                {initials}
              </span>
            )}

            <div className="min-w-0 flex-1">
              <DialogTitle className="text-base font-semibold sm:text-lg">
                {review.name}
              </DialogTitle>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <GoogleReviewStars rating={review.rating} />
                <GoogleVerifiedBadge />
                <time
                  dateTime={review.date}
                  className="text-sm text-muted-foreground"
                >
                  {formatReviewDate(review.date)}
                </time>
              </div>
            </div>
          </div>

          <DialogDescription
            id={`review-modal-text-${review.id}`}
            className="mt-5 text-sm leading-relaxed text-foreground/90 sm:text-base"
          >
            {review.text}
          </DialogDescription>
        </div>
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
