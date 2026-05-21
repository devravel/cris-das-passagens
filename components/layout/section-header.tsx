import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

export type SectionHeaderProps = {
  id: string;
  title: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
};

export const sectionHeadingClassName =
  "font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl md:text-3xl lg:text-[2rem] lg:leading-tight";

export const sectionSubtitleClassName =
  "mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg";

export function SectionHeader({
  id,
  title,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
}: SectionHeaderProps) {
  return (
    <Container
      size="prose"
      padding="none"
      className={cn("mb-8 text-center sm:mb-12 lg:mb-14", className)}
    >
      <h2 id={id} className={cn(sectionHeadingClassName, titleClassName)}>
        {title}
      </h2>
      {subtitle ? (
        <p className={cn(sectionSubtitleClassName, subtitleClassName)}>
          {subtitle}
        </p>
      ) : null}
    </Container>
  );
}
