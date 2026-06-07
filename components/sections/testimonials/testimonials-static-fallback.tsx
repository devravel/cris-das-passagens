import { Star } from "lucide-react";

import type { TestimonialItem } from "@/config/content";
import { cn } from "@/lib/utils";

type TestimonialsStaticFallbackProps = {
  items: TestimonialItem[];
  className?: string;
};

function TestimonialStars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5 text-brand"
      aria-label={`${rating} de 5 estrelas`}
    >
      {Array.from({ length: rating }, (_, index) => (
        <Star key={index} className="size-4 fill-current" aria-hidden />
      ))}
    </div>
  );
}

export function TestimonialsStaticFallback({
  items,
  className,
}: TestimonialsStaticFallbackProps) {
  return (
    <ul
      className={cn(
        "grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => (
        <li key={`${item.author}-${item.destination}`} className="flex">
          <figure className="flex h-full w-full flex-col rounded-2xl border border-border/60 bg-background/90 p-5 shadow-sm sm:p-6">
            <TestimonialStars rating={item.rating ?? 5} />
            <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground/90 sm:text-base">
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-5 border-t border-border/50 pt-4 text-sm">
              <p className="font-medium text-foreground">{item.author}</p>
              <p className="text-muted-foreground">{item.destination}</p>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
