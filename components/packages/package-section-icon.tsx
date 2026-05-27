import { Anchor, BedDouble, Luggage, Plane, Ticket } from "lucide-react";

import { cn } from "@/lib/utils";

type PackageSectionIconProps = {
  variant: "suitcase" | "plane" | "bed" | "ticket" | "anchor";
  className?: string;
};

export function PackageSectionIcon({ variant, className }: PackageSectionIconProps) {
  const Icon =
    variant === "suitcase"
      ? Luggage
      : variant === "plane"
        ? Plane
        : variant === "bed"
          ? BedDouble
          : variant === "ticket"
            ? Ticket
            : Anchor;

  return (
    <div className={cn("relative inline-flex size-16 shrink-0 sm:size-[4.5rem]", className)}>
      <span
        aria-hidden
        className={cn(
          "absolute rounded-full bg-amber-300/90",
          variant === "suitcase" && "-top-1 -left-1 size-5 sm:size-6",
          variant === "plane" && "bottom-1 left-0 size-6 sm:size-7",
          variant === "bed" && "-top-0.5 left-1 size-5 sm:size-6",
          variant === "ticket" && "-top-0.5 right-0 size-5 sm:size-6",
          variant === "anchor" && "bottom-1 right-0 size-5 sm:size-6",
        )}
      />
      <span
        aria-hidden
        className={cn(
          "absolute rounded-full bg-amber-200/80",
          (variant === "plane" || variant === "anchor") && "bottom-0 left-2 size-8 sm:size-9",
        )}
      />
      <span className="relative flex size-full items-center justify-center rounded-2xl bg-brand/8 ring-1 ring-brand/10">
        <Icon className="size-8 text-brand sm:size-9" strokeWidth={1.5} aria-hidden />
      </span>
    </div>
  );
}
