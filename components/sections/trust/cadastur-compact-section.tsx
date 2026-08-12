"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

import { Section } from "@/components/layout/section";
import { sectionHeadingClassName } from "@/components/layout/section-header";
import { content } from "@/config/content";
import { useEntranceMotion } from "@/hooks/use-entrance-motion";
import { cn } from "@/lib/utils";

/** Azul escuro amostrado da logo (`cris-das-passagens-logo-nav.png`). */
const LOGO_BLUE_DARK = "#345aa6";

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
      background="default"
      spacing="compact"
      bordered
      className={cn("border-white/10 text-white", className)}
      style={{ backgroundColor: LOGO_BLUE_DARK }}
      aria-labelledby={headingId}
    >
      <motion.div
        className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center sm:gap-8"
        {...entrance}
      >
        <h2
          id={headingId}
          className={cn(
            sectionHeadingClassName,
            "flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-white sm:gap-x-3",
          )}
        >
          <span>{content.cadastur.title}</span>
          <Image
            src={content.cadastur.logo}
            alt={content.cadastur.logoAlt}
            width={220}
            height={35}
            className="h-[1.15em] w-auto translate-y-px object-contain"
            unoptimized
            priority
          />
        </h2>

        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-10">
          <div className="size-24 shrink-0 sm:size-28">
            <Image
              src={content.cadastur.qrCode}
              alt={content.cadastur.qrCodeAlt}
              width={112}
              height={112}
              className="size-full object-contain object-center"
              unoptimized
            />
          </div>

          <div className="max-w-md space-y-3">
            <p className="text-base leading-relaxed text-white/85 sm:text-lg">
              {content.cadastur.shortText}
            </p>
            <Link
              href={content.cadastur.verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group inline-flex items-center justify-center gap-1 text-sm font-medium text-white underline-offset-4 transition-colors duration-200 hover:text-white/90 hover:underline sm:justify-start",
              )}
            >
              {content.cadastur.verifyUrlLabel}
              <ArrowUpRight
                className="size-3.5 opacity-70 transition-transform duration-200 group-hover:translate-x-px group-hover:-translate-y-px"
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
