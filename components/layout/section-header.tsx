import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

export type SectionHeaderProps = {
  id: string;
  title: string;
  subtitle?: string;
  headingLevel?: "h1" | "h2";
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

export const sectionHeadingClassName =
  "text-center font-heading text-[1.75rem] font-bold leading-[1.1] tracking-[-0.02em] text-foreground md:text-4xl lg:text-[2.75rem]";

export const bodyTextClassName =
  "w-full text-justify-smart text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl";

/**
 * Palavra entre *asteriscos* no título vira degradê azul da marca.
 * `onDark` usa os azuis claros (cyan → light) pra não sumir em fundo navy.
 */
export function highlightTitle(title: string, onDark = false) {
  return title.split(/\*([^*]+)\*/).map((part, index) =>
    index % 2 === 1 ? (
      <span
        key={index}
        className={cn(
          "bg-linear-to-r bg-clip-text text-transparent",
          onDark ? "from-brand-cyan to-brand-light" : "from-brand-light to-brand",
        )}
      >
        {part}
      </span>
    ) : (
      part
    ),
  );
}

export const sectionSubtitleClassName =
  "mt-3 w-full text-pretty text-center text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl";

export function SectionHeader({
  id,
  title,
  subtitle,
  headingLevel = "h2",
  className,
  titleClassName,
  subtitleClassName,
}: SectionHeaderProps) {
  const HeadingTag = headingLevel;

  return (
    <Container
      size="prose"
      padding="none"
      className={cn("mb-7 sm:mb-9 lg:mb-10", className)}
    >
      <HeadingTag id={id} className={cn(sectionHeadingClassName, titleClassName)}>
        {highlightTitle(title)}
      </HeadingTag>
      {subtitle ? (
        <p className={cn(sectionSubtitleClassName, subtitleClassName)}>
          {subtitle}
        </p>
      ) : null}
    </Container>
  );
}
