import { cn } from "@/lib/utils";

/** Hover suave para cards clicáveis — referência premium (branding.md). */
export const cardInteractiveClassName = cn(
  "transition-[box-shadow,transform,border-color] duration-300",
  "hover:-translate-y-0.5",
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0"
);

export const cardShadowClassName =
  "shadow-[0_8px_30px_-14px_rgba(52,91,167,0.16)] hover:shadow-[0_14px_40px_-16px_rgba(52,91,167,0.22)]";
