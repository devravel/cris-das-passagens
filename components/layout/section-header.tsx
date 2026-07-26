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
  "text-center font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl md:text-3xl lg:text-[2rem] lg:leading-tight";

export const bodyTextClassName =
  "w-full text-justify-smart text-base leading-relaxed text-muted-foreground sm:text-lg md:text-xl";

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
      className={cn("mb-8 sm:mb-12 lg:mb-14", className)}
    >
      <HeadingTag id={id} className={cn(sectionHeadingClassName, titleClassName)}>
        {title}
      </HeadingTag>
      {subtitle ? (
        <p className={cn(sectionSubtitleClassName, subtitleClassName)}>
          {subtitle}
        </p>
      ) : null}
    </Container>
  );
}
