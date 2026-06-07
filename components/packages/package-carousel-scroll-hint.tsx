import { cn } from "@/lib/utils";

type PackageCarouselScrollHintProps = {
  className?: string;
};

export function PackageCarouselScrollHint({
  className,
}: PackageCarouselScrollHintProps) {
  return (
    <p className={cn("text-center text-muted-foreground", className)}>
      Confirmar disponibilidade do pacote e condições.
    </p>
  );
}
