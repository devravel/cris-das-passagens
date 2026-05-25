"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { Section } from "@/components/layout/section";
import { SectionHeader, bodyTextClassName } from "@/components/layout/section-header";
import { content, type TestimonialItem } from "@/config/content";
import { useMotionReady } from "@/hooks/use-motion-ready";
import {
  cardInteractiveClassName,
  cardShadowClassName,
} from "@/lib/card-styles";
import { cn } from "@/lib/utils";

const ease = [0.22, 1, 0.36, 1] as const;

export type TestimonialsModernProps = {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  testimonials?: TestimonialItem[];
  className?: string;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function GoogleMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-label="Google"
      className={cn("size-4", className)}
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function StarRating({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} de 5 estrelas`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className={cn(
            "size-4",
            index < rating
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          )}
          strokeWidth={1.5}
          aria-hidden
        />
      ))}
    </div>
  );
}

function useCardMotion(index: number) {
  const { shouldAnimate } = useMotionReady();

  return {
    initial: shouldAnimate ? { opacity: 0, y: 16 } : false,
    whileInView: shouldAnimate ? { opacity: 1, y: 0 } : undefined,
    viewport: { once: true, margin: "-50px" },
    transition: {
      duration: 0.5,
      ease,
      delay: shouldAnimate ? index * 0.08 : 0,
    },
  };
}

function TestimonialCard({
  testimonial,
  authorId,
  index,
}: {
  testimonial: TestimonialItem;
  authorId: string;
  index: number;
}) {
  const initials = getInitials(testimonial.author);
  const motionProps = useCardMotion(index);

  return (
    <motion.article
      aria-labelledby={authorId}
      className={cn(
        "flex h-full flex-col rounded-2xl bg-background p-5 ring-1 ring-border/50 sm:p-6",
        cardInteractiveClassName,
        cardShadowClassName
      )}
      {...motionProps}
    >
      <header className="flex items-center gap-3">
        <div
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand/10 font-heading text-xs font-semibold tracking-tight text-brand ring-1 ring-brand/15"
          aria-hidden
        >
          {initials}
        </div>
        <div className="min-w-0">
          <p
            id={authorId}
            className="truncate font-heading text-sm font-semibold tracking-tight text-foreground"
          >
            <cite className="not-italic">{testimonial.author}</cite>
          </p>
          <p className="truncate text-sm text-muted-foreground">
            {testimonial.destination}
          </p>
        </div>
      </header>

      <blockquote className="mt-5 flex-1 border-l-0 pl-0">
        <p className={cn("italic", bodyTextClassName, "sm:text-[0.9375rem] md:text-lg")}>
          &ldquo;{testimonial.quote}&rdquo;
        </p>
      </blockquote>

      <footer className="mt-5 flex flex-wrap items-center gap-2 border-t border-border/50 pt-4">
        <StarRating rating={testimonial.rating} />
        <span className="text-sm tabular-nums text-muted-foreground">
          — {testimonial.rating?.toFixed(1) ?? "5.0"}
        </span>
        {testimonial.source === "google" ? <GoogleMark /> : null}
      </footer>
    </motion.article>
  );
}

export function TestimonialsModern({
  sectionId = "depoimentos",
  title = content.testimonials.title,
  subtitle = content.testimonials.subtitle,
  testimonials = content.testimonials.items,
  className,
}: TestimonialsModernProps) {
  const headingId = `${sectionId}-heading`;

  return (
    <Section
      background="soft"
      spacing="default"
      bordered
      className={className}
      aria-labelledby={headingId}
    >
      <SectionHeader
        id={headingId}
        title={title}
        subtitle={subtitle}
        subtitleClassName="mt-4"
        className="mb-12 sm:mb-14 lg:mb-16"
      />

      <ul
        className="grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6"
        role="list"
      >
        {testimonials.map((item, index) => {
          const authorId = `${sectionId}-author-${index}`;

          return (
            <li key={authorId}>
              <TestimonialCard
                testimonial={item}
                authorId={authorId}
                index={index}
              />
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
