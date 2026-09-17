import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

type CarouselArrowProps = {
  side: "left" | "right";
  /** Só aparece pro lado que ainda tem conteúdo. */
  visible: boolean;
  onClick: () => void;
  ariaLabel: string;
  /** `light` sobre foto/card escuro; `brand` sobre fundo claro da página. */
  tone?: "light" | "brand";
  /** Posicionamento (absolute, coluna do grid...). */
  className?: string;
  iconClassName?: string;
};

/**
 * Seta de carrossel do site: só o chevron, sem círculo nem borda, com um
 * "pulo" pro lado que tem mais conteúdo. Invisível (mas ocupando o lugar)
 * quando não há pra onde ir.
 */
export function CarouselArrow({
  side,
  visible,
  onClick,
  ariaLabel,
  tone = "light",
  className,
  iconClassName,
}: CarouselArrowProps) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={cn(
        "inline-flex shrink-0 items-center justify-center outline-none transition-opacity duration-200 hover:opacity-80 focus-visible:opacity-70",
        tone === "light"
          ? "text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
          : "text-brand drop-shadow-[0_2px_8px_rgba(52,91,167,0.35)]",
        !visible && "pointer-events-none opacity-0",
        className,
      )}
    >
      <Icon
        className={cn(
          "size-11",
          side === "left" ? "animate-[nudge-left_1.4s_ease-in-out_infinite]" : "animate-[nudge-right_1.4s_ease-in-out_infinite]",
          iconClassName,
        )}
        strokeWidth={2.75}
        aria-hidden
      />
    </button>
  );
}
