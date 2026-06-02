import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import {
  Container,
  type ContainerProps,
} from "@/components/layout/container";
import { cn } from "@/lib/utils";

const sectionVariants = cva("relative w-full", {
  variants: {
    spacing: {
      /** Espaçamento padrão das secções — mobile first (referência). */
      default: "py-16 sm:py-20 lg:py-24 xl:py-32",
      /** Secções mais compactas (FAQ, blocos auxiliares). */
      compact: "py-12 sm:py-16 lg:py-20 xl:py-24",
      /** Páginas internas — respiro mínimo abaixo do navbar, padding inferior padrão. */
      page: "pt-3 pb-16 sm:pt-4 sm:pb-20 lg:pb-24 xl:pb-32",
      none: "py-0",
    },
    background: {
      /** Fundo branco — secções principais. */
      default: "bg-background text-foreground",
      /** Off-white / azul muito claro — alternância da referência. */
      soft: "bg-muted/25 text-foreground",
      /** Navy escuro — CTA final e blocos de conversão. */
      navy: "bg-brand-navy text-white",
    },
    bordered: {
      true: "border-b border-border/50",
      false: "",
    },
  },
  defaultVariants: {
    spacing: "default",
    background: "default",
    bordered: false,
  },
});

export type SectionProps = Omit<React.ComponentProps<"section">, "children"> &
  VariantProps<typeof sectionVariants> & {
    asChild?: boolean;
    children?: React.ReactNode;
    /** Envolve o conteúdo no Container; omitir para layouts full-bleed. */
    contained?: boolean;
    containerSize?: ContainerProps["size"];
    containerPadding?: ContainerProps["padding"];
    containerClassName?: string;
  };

export function Section({
  className,
  spacing,
  background,
  bordered,
  asChild = false,
  contained = true,
  containerSize,
  containerPadding,
  containerClassName,
  children,
  ...props
}: SectionProps) {
  const Comp = asChild ? Slot.Root : "section";

  const content = contained ? (
    <Container
      size={containerSize}
      padding={containerPadding}
      className={containerClassName}
    >
      {children}
    </Container>
  ) : (
    children
  );

  return (
    <Comp
      data-slot="section"
      data-background={background ?? "default"}
      className={cn(sectionVariants({ spacing, background, bordered }), className)}
      {...props}
    >
      {content}
    </Comp>
  );
}

export { sectionVariants };
