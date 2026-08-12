import { cn } from "@/lib/utils";

type CarouselNavOutlineProps = {
  active: boolean;
  /** Reinicia o keyframe quando o pulso dispara novamente. */
  pulseKey?: number;
  /** Stagger opcional (ex.: botão direito quando ambos animam). */
  delayMs?: number;
  className?: string;
};

/**
 * Contorno fino SVG que percorre o botão circular no sentido horário.
 * Posicionado por fora; não altera layout, pointer-events ou o interior do botão.
 */
export function CarouselNavOutline({
  active,
  pulseKey = 0,
  delayMs = 0,
  className,
}: CarouselNavOutlineProps) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute -inset-0.75 z-0 overflow-visible",
        className,
      )}
    >
      <svg
        viewBox="0 0 42 42"
        className="size-full overflow-visible"
        fill="none"
      >
        {/* rotate(-90) faz o traço começar no topo e seguir horário */}
        <g transform="rotate(-90 21 21)">
          <circle
            key={active ? pulseKey : "idle"}
            cx="21"
            cy="21"
            r="19.25"
            pathLength={100}
            className={cn(
              "carousel-nav-outline-hint__path",
              active && "carousel-nav-outline-hint__path--active",
            )}
            style={
              delayMs > 0 && active
                ? { animationDelay: `${delayMs}ms` }
                : undefined
            }
          />
        </g>
      </svg>
    </span>
  );
}
