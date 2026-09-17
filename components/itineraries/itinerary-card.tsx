import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";

import { StorageImage } from "@/components/ui/storage-image";
import { cn } from "@/lib/utils";

export type ItineraryCardData = {
  title: string;
  slug: string;
  coverImage: string;
  duration: string;
};

type ItineraryCardProps = {
  itinerary: ItineraryCardData;
  priority?: boolean;
  className?: string;
};

/** Card da referência: foto, título, duração e "Ver roteiro". Sem preço. */
export function ItineraryCard({ itinerary, priority, className }: ItineraryCardProps) {
  return (
    <Link
      href={`/roteiros/${itinerary.slug}`}
      className={cn(
        "group relative isolate flex aspect-[16/10] flex-col justify-end overflow-hidden rounded-2xl bg-brand-navy text-white outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:aspect-[3/2]",
        className,
      )}
    >
      <StorageImage
        src={itinerary.coverImage}
        alt={itinerary.title}
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
        containerClassName="absolute inset-0 bg-brand-navy"
        className="transition-transform duration-1000 ease-out group-hover:scale-[1.06] motion-reduce:transition-none"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-linear-to-t from-brand-navy via-brand-navy/40 to-transparent"
      />
      <div className="relative flex items-end justify-between gap-3 p-4 sm:p-5">
        <div className="min-w-0">
          <h3 className="font-heading text-xl font-bold leading-tight tracking-tight sm:text-2xl">
            {itinerary.title}
          </h3>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-white/80">
            <Clock className="size-3.5" aria-hidden />
            {itinerary.duration}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur transition-colors group-hover:bg-white group-hover:text-brand-navy">
          Ver roteiro
          <ArrowUpRight className="size-3.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}
