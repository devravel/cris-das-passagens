import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

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

/**
 * Card da referência: foto, título, duração e o botão "Ver roteiro" numa
 * linha só, largura total. Sem preço. O card inteiro é o link.
 */
export function ItineraryCard({ itinerary, priority, className }: ItineraryCardProps) {
  return (
    <Link
      href={`/roteiros/${itinerary.slug}`}
      className={cn(
        "group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-brand-navy text-white outline-none transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_rgba(10,24,56,0.55)] focus-visible:ring-3 focus-visible:ring-ring/60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:aspect-[3/4]",
        className,
      )}
    >
      <StorageImage
        src={itinerary.coverImage}
        alt=""
        fill
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 300px"
        containerClassName="absolute inset-0 bg-brand-navy"
        className="transition-transform duration-1000 ease-out group-hover:scale-[1.06] motion-reduce:transition-none"
      />
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-brand-navy via-brand-navy/45 to-transparent" />

      <div className="relative space-y-3 p-4 sm:p-5">
        <div>
          <h3 className="font-heading text-xl font-bold leading-tight tracking-tight sm:text-[1.35rem]">
            {itinerary.title}
          </h3>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-white/80">
            <Clock className="size-3.5" aria-hidden />
            {itinerary.duration}
          </p>
        </div>

        <span
          aria-hidden
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/12 text-xs font-bold uppercase tracking-[0.12em] backdrop-blur transition-[background-color,border-color,color,gap] duration-300 group-hover:gap-3 group-hover:border-white group-hover:bg-white group-hover:text-brand-navy group-focus-visible:border-white group-focus-visible:bg-white group-focus-visible:text-brand-navy"
        >
          Ver roteiro
          <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5" strokeWidth={2.25} />
        </span>
      </div>
      <span className="sr-only">Ver roteiro {itinerary.title}</span>
    </Link>
  );
}
