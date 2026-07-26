"use client";

import Link from "next/link";
import {
  ChevronRight,
  Globe,
  Hotel,
  MessageCircle,
  Plane,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Section } from "@/components/layout/section";
import { SectionHeader, bodyTextClassName } from "@/components/layout/section-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { content, type QuickActionItem } from "@/config/content";
import {
  cardContentContainerClassName,
  cardInteractiveClassName,
  cardShadowClassName,
} from "@/lib/card-styles";
import { scrollRevealDefaults } from "@/lib/motion";
import { trackMetaLeadFromHref } from "@/lib/meta-pixel";
import { cn } from "@/lib/utils";

export type QuickActionsProps = {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  items?: QuickActionItem[];
  className?: string;
};

const iconMap: Record<QuickActionItem["id"], LucideIcon> = {
  passagens: Plane,
  pacotes: Globe,
  hospedagem: Hotel,
  whatsapp: MessageCircle,
};

function QuickActionCard({ item }: { item: QuickActionItem }) {
  const Icon = iconMap[item.id];
  const isWhatsApp = item.id === "whatsapp";

  const cardClassName = cn(
    "group flex h-full flex-col rounded-2xl bg-background p-4 ring-1 ring-border/50 sm:p-5",
    cardContentContainerClassName,
    cardInteractiveClassName,
    cardShadowClassName,
    "hover:ring-border/80",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    isWhatsApp && "hover:ring-brand-whatsapp/30"
  );

  const iconWrapClassName = cn(
    "mb-4 flex size-11 items-center justify-center rounded-xl ring-1 transition-colors duration-300",
    isWhatsApp
      ? "bg-brand-whatsapp/12 text-brand-whatsapp ring-brand-whatsapp/20 group-hover:bg-brand-whatsapp/18"
      : "bg-brand/10 text-brand ring-brand/15 group-hover:bg-brand/15"
  );

  const ctaClassName = cn(
    "mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold transition-colors duration-200",
    isWhatsApp
      ? "text-brand-whatsapp group-hover:text-brand-whatsapp/90"
      : "text-brand group-hover:text-brand/90"
  );

  const body = (
    <>
      <div className={iconWrapClassName} aria-hidden>
        <Icon className="size-5" strokeWidth={1.75} />
      </div>
      <h3 className="font-heading text-base font-semibold tracking-tight text-foreground">
        {item.title}
      </h3>
      <p className={cn("mt-2 flex-1", bodyTextClassName)}>
        {item.description}
      </p>
      <span className={ctaClassName}>
        {item.ctaLabel}
        <ChevronRight
          className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
          strokeWidth={1.75}
          aria-hidden
        />
      </span>
    </>
  );

  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClassName}
        onClick={() =>
          trackMetaLeadFromHref(item.href, {
            source: "quick_action_whatsapp",
            content_name: item.title,
          })
        }
      >
        {body}
      </a>
    );
  }

  return (
    <Link href={item.href} className={cardClassName}>
      {body}
    </Link>
  );
}

export function QuickActions({
  sectionId = "acesso-rapido",
  title = content.quickActions.title,
  subtitle = content.quickActions.subtitle,
  items = content.quickActions.items,
  className,
}: QuickActionsProps) {
  const headingId = `${sectionId}-heading`;

  return (
    <Section
      background="default"
      spacing="compact"
      bordered
      className={className}
      aria-labelledby={headingId}
    >
      <ScrollReveal>
        <SectionHeader id={headingId} title={title} subtitle={subtitle} />
      </ScrollReveal>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4 lg:gap-6">
        {items.map((item, index) => (
          <li key={item.id}>
            <ScrollReveal delay={index * scrollRevealDefaults.stagger}>
              <QuickActionCard item={item} />
            </ScrollReveal>
          </li>
        ))}
      </ul>
    </Section>
  );
}
