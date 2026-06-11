import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

type GoogleReviewStarsProps = {
  rating: number;
  size?: "sm" | "md";
  className?: string;
};

const sizeClassName = {
  sm: "size-3.5",
  md: "size-4",
} as const;

export function GoogleReviewStars({
  rating,
  size = "md",
  className,
}: GoogleReviewStarsProps) {
  const clampedRating = Math.max(0, Math.min(5, Math.round(rating)));

  return (
    <div
      className={cn("flex items-center gap-0.5 text-[#fbbc04]", className)}
      role="img"
      aria-label={`${clampedRating} de 5 estrelas`}
    >
      {Array.from({ length: 5 }, (_, index) => {
        const isFilled = index < clampedRating;

        return (
          <Star
            key={index}
            className={cn(
              sizeClassName[size],
              isFilled ? "fill-current" : "fill-transparent stroke-current opacity-35",
            )}
            aria-hidden
          />
        );
      })}
    </div>
  );
}
