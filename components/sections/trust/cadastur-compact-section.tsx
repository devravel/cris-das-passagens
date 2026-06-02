"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { Section } from "@/components/layout/section";
import { content } from "@/config/content";
import { useEntranceMotion } from "@/hooks/use-entrance-motion";
import { cn } from "@/lib/utils";

export type CadasturCompactSectionProps = {
  sectionId?: string;
  className?: string;
};

export function CadasturCompactSection({
  sectionId = "cadastur",
  className,
}: CadasturCompactSectionProps) {
  const entrance = useEntranceMotion(0.08);
  const headingId = `${sectionId}-heading`;

  return (
    <Section
      id={sectionId}
      background="soft"
      spacing="compact"
      bordered
      className={className}
      aria-labelledby={headingId}
    >
      <motion.div
        className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center sm:gap-8"
        {...entrance}
      >
        <h2
          id={headingId}
          className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl"
        >
          {content.cadastur.title}
        </h2>

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
          <div className="flex items-center gap-5 sm:gap-6">
            <div className="size-24 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm sm:size-28">
              <Image
                src={content.cadastur.qrCode}
                alt={content.cadastur.qrCodeAlt}
                width={112}
                height={112}
                className="size-full object-cover object-center"
              />
            </div>

            <div className="flex size-20 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background p-3 shadow-sm sm:size-24">
              <Image
                src={content.cadastur.logo}
                alt={content.cadastur.logoAlt}
                width={96}
                height={48}
                className="h-auto w-full object-contain"
              />
            </div>
          </div>

          <div className="max-w-md space-y-3">
            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {content.cadastur.shortText}
            </p>
            <Link
              href={content.cadastur.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group inline-flex items-center justify-center gap-1 text-sm font-medium text-brand underline-offset-4 transition-colors duration-200 hover:text-brand/90 hover:underline sm:justify-start",
              )}
            >
              {content.cadastur.verifyUrlLabel}
              <ArrowUpRight
                className="size-3.5 opacity-60 transition-transform duration-200 group-hover:translate-x-px group-hover:-translate-y-px"
                strokeWidth={1.75}
                aria-hidden
              />
            </Link>
          </div>
        </div>
      </motion.div>
    </Section>
  );
}
