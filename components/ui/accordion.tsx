"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "radix-ui";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("w-full", className)}
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-border/60 last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionHeader({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Header>) {
  return (
    <AccordionPrimitive.Header
      data-slot="accordion-header"
      className={cn("flex", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Trigger
      data-slot="accordion-trigger"
      className={cn(
        "group/accordion-trigger flex flex-1 items-start justify-between gap-3 py-4 text-left font-heading text-sm font-semibold tracking-tight text-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:py-5 sm:text-[0.9375rem] md:text-base",
        "[&[data-state=open]>svg:last-child]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown
        className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-transform duration-200"
        strokeWidth={1.75}
        aria-hidden
      />
    </AccordionPrimitive.Trigger>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(
        "overflow-hidden text-sm",
        "data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up",
        "duration-300",
        "motion-reduce:animate-none",
      )}
      {...props}
    >
      <div
        className={cn(
          "pb-4 text-muted-foreground leading-relaxed sm:pb-5 sm:text-[0.9375rem]",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export {
  Accordion,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
};
