import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";

const containerVariants = cva("mx-auto w-full min-w-0", {
  variants: {
    size: {
      /** Largura padrão das secções (navbar, footer, grids). */
      default: "max-w-6xl",
      /** Conteúdo de leitura ou blocos estreitos (FAQ, formulários). */
      narrow: "max-w-3xl",
      /** Cabeçalhos de secção e texto introdutório centrado. */
      prose: "max-w-2xl",
      /** Layouts mais amplos (hero, galerias). */
      wide: "max-w-7xl",
      /** Apenas padding horizontal, sem limite de largura. */
      full: "max-w-none",
    },
    padding: {
      /** Margens laterais generosas — mobile first. */
      default: "px-4 sm:px-6 lg:px-8",
      none: "px-0",
    },
  },
  defaultVariants: {
    size: "default",
    padding: "default",
  },
});

export type ContainerProps = React.ComponentProps<"div"> &
  VariantProps<typeof containerVariants> & {
    asChild?: boolean;
  };

export function Container({
  className,
  size,
  padding,
  asChild = false,
  ...props
}: ContainerProps) {
  const Comp = asChild ? Slot.Root : "div";

  return (
    <Comp
      data-slot="container"
      className={cn(containerVariants({ size, padding }), className)}
      {...props}
    />
  );
}

export { containerVariants };
