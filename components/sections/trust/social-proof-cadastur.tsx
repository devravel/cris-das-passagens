"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  ShieldCheck,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Container } from "@/components/layout/container";
import {
  sectionHeadingClassName,
  sectionSubtitleClassName,
} from "@/components/layout/section-header";
import { Section } from "@/components/layout/section";
import { content } from "@/config/content";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

type StatItem = {
  id: string;
  value: string;
  label: string;
  accent: string;
  icon?: LucideIcon;
};

const defaultStats: StatItem[] = [
  {
    id: "emissions",
    value: content.socialProof.emissions,
    label: content.socialProof.emissionsLabel,
    accent: "bg-brand/10 text-brand ring-brand/20",
  },
  {
    id: "clients",
    value: content.socialProof.clients,
    label: content.socialProof.clientsLabel,
    accent: "bg-brand-light/15 text-brand ring-brand-light/25",
  },
  {
    id: "cadastur",
    value: "CADASTUR",
    label: content.socialProof.certificationLabel,
    icon: ShieldCheck,
    accent: "bg-brand-whatsapp/12 text-brand-whatsapp ring-brand-whatsapp/20",
  },
];

export type SocialProofCadasturProps = {
  sectionId?: string;
  statsTitle?: string;
  statsSubtitle?: string;
  stats?: StatItem[];
  cadasturTitle?: string;
  cadasturParagraphs?: readonly string[];
  verification?: string;
  verifyUrl?: string;
  verifyUrlLabel?: string;
  className?: string;
};

function useSectionMotion() {
  const reduce = useReducedMotion();

  const item = React.useCallback(
    (index: number) => ({
      initial: reduce ? false : { opacity: 0, y: 16 },
      whileInView: reduce ? undefined : { opacity: 1, y: 0 },
      viewport: { once: true, margin: "-60px" },
      transition: {
        duration: 0.5,
        ease,
        delay: reduce ? 0 : index * 0.08,
      },
    }),
    [reduce]
  );

  return { item };
}

function StatCard({ stat, index }: { stat: StatItem; index: number }) {
  const { item } = useSectionMotion();
  const Icon = stat.icon;
  const isCadastur = stat.id === "cadastur";

  return (
    <motion.li
      className="flex flex-col items-center text-center"
      {...item(index)}
    >
      <div
        className={cn(
          "flex size-14 items-center justify-center rounded-full ring-1 sm:size-16",
          stat.accent
        )}
      >
        {isCadastur && Icon ? (
          <Icon className="size-6 sm:size-7" strokeWidth={1.75} aria-hidden />
        ) : (
          <span className="text-lg font-semibold tabular-nums sm:text-xl">
            {stat.value}
          </span>
        )}
      </div>
      <h3 className="mt-4 font-heading text-base font-semibold tracking-tight text-foreground capitalize sm:text-[1.05rem]">
        {isCadastur ? stat.value : stat.label}
      </h3>
      {isCadastur ? (
        <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground sm:text-base">
          {stat.label}
        </p>
      ) : null}
    </motion.li>
  );
}

export function SocialProofCadastur({
  sectionId = "confianca-cadastur",
  statsTitle = content.socialProof.title,
  statsSubtitle = content.socialProof.subtitle,
  stats = defaultStats,
  cadasturTitle = content.cadastur.title,
  cadasturParagraphs = content.cadastur.paragraphs,
  verification = content.cadastur.verification,
  verifyUrl = content.cadastur.verifyUrl,
  verifyUrlLabel = content.cadastur.verifyUrlLabel,
  className,
}: SocialProofCadasturProps) {
  const { item } = useSectionMotion();
  const headingId = `${sectionId}-heading`;

  return (
    <Section
      background="default"
      spacing="default"
      bordered
      className={className}
      aria-labelledby={headingId}
    >
      <Container
        size="prose"
        padding="none"
        className="mb-12 text-center sm:mb-14 lg:mb-16"
      >
        <motion.h2
          id={headingId}
          className={sectionHeadingClassName}
          {...item(0)}
        >
          {statsTitle}
        </motion.h2>
        {statsSubtitle ? (
          <motion.p
            className={sectionSubtitleClassName}
            {...item(1)}
          >
            {statsSubtitle}
          </motion.p>
        ) : null}
      </Container>

      <ul className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-8">
        {stats.map((stat, index) => (
          <StatCard key={stat.id} stat={stat} index={index + 2} />
        ))}
      </ul>

      <Container padding="none" className="mt-14 max-w-4xl lg:mt-16" asChild>
        <motion.div {...item(5)}>
          <div className="rounded-2xl bg-muted/30 p-6 ring-1 ring-border/50 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[auto_1fr] lg:items-start lg:gap-10">
            <div className="mx-auto flex flex-col items-center gap-3 lg:mx-0">
              <div
                className="flex size-28 items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-background/80 text-center sm:size-32"
                aria-hidden
              >
                <div className="space-y-1 px-2">
                  <ShieldCheck
                    className="mx-auto size-8 text-brand"
                    strokeWidth={1.5}
                  />
                  <span className="block text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    QR Code
                  </span>
                </div>
              </div>
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                Depoimentos no {content.socialProof.reviewSources}
              </p>
            </div>

            <div className="space-y-4 text-center lg:text-left">
              <h3 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                {cadasturTitle}
              </h3>
              <div className="space-y-3">
                {cadasturParagraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="text-sm leading-relaxed text-muted-foreground sm:text-base"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
              <p className="break-words text-sm leading-relaxed text-muted-foreground sm:text-base">
                {verification}{" "}
                <Link
                  href={verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex flex-wrap items-center gap-1 font-medium text-brand underline-offset-4 transition-colors duration-200 hover:text-brand/90 hover:underline"
                >
                  {verifyUrlLabel}
                  <ArrowUpRight
                    className="size-3.5 opacity-60 transition-transform duration-200 group-hover:translate-x-px group-hover:-translate-y-px"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </Link>
              </p>
            </div>
          </div>
          </div>
        </motion.div>
      </Container>
    </Section>
  );
}
