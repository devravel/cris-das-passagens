import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Button } from "@/components/ui/button";
import { content, type ContentCta } from "@/config/content";
import {
  HOME_BLOG_EMPTY_MESSAGE,
  HOME_BLOG_PLACEHOLDER_POSTS,
} from "@/lib/blog/placeholders";
import type { HomeBlogPostPreview } from "@/lib/blog/queries";
import {
  cardInteractiveClassName,
  cardShadowClassName,
} from "@/lib/card-styles";
import { scrollRevealDefaults } from "@/lib/motion";
import { cn } from "@/lib/utils";

export type BlogPreviewSectionProps = {
  sectionId?: string;
  title?: string;
  subtitle?: string;
  posts: HomeBlogPostPreview[];
  isPlaceholder?: boolean;
  emptyMessage?: string;
  cta?: ContentCta;
  className?: string;
};

function BlogCard({
  post,
  isPlaceholder = false,
  priority = false,
}: {
  post: HomeBlogPostPreview;
  isPlaceholder?: boolean;
  priority?: boolean;
}) {
  const cardClassName = cn(
    "group flex h-full flex-col overflow-hidden rounded-2xl bg-background ring-1 ring-border/50",
    !isPlaceholder && cardInteractiveClassName,
    cardShadowClassName,
    isPlaceholder && "opacity-95",
  );

  const imageBlock = (
    <div className="relative aspect-[16/10] overflow-hidden bg-muted/30">
      <Image
        src={post.coverImage}
        alt={isPlaceholder ? "" : post.title}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        className={cn(
          "object-cover transition-transform duration-500",
          !isPlaceholder && "group-hover:scale-[1.03]",
        )}
        aria-hidden={isPlaceholder}
      />
      {isPlaceholder ? (
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-brand-navy/25 via-transparent to-brand-soft/20"
        />
      ) : null}
    </div>
  );

  const body = (
    <div className="flex flex-1 flex-col p-4 sm:p-6">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-brand">
        {isPlaceholder ? "Em breve" : "Blog"}
      </p>
      {isPlaceholder ? (
        <h3 className="font-heading text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg md:text-xl">
          {post.title}
        </h3>
      ) : (
        <h3 className="font-heading text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg md:text-xl">
          <Link
            href={post.href}
            className="outline-none transition-colors duration-200 hover:text-brand focus-visible:rounded-sm focus-visible:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {post.title}
          </Link>
        </h3>
      )}
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
        {post.excerpt}
      </p>
      {!isPlaceholder ? (
        <Link
          href={post.href}
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand transition-colors duration-200 hover:text-brand/90"
        >
          Leia mais
          <ArrowRight
            className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
            strokeWidth={1.75}
            aria-hidden
          />
        </Link>
      ) : (
        <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-muted-foreground/80">
          Conteudo em preparacao
        </span>
      )}
    </div>
  );

  if (isPlaceholder) {
    return (
      <article className={cardClassName} aria-hidden>
        {imageBlock}
        {body}
      </article>
    );
  }

  return (
    <article className={cardClassName}>
      <Link href={post.href} className="block outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
        {imageBlock}
      </Link>
      {body}
    </article>
  );
}

export function BlogPreviewSection({
  sectionId = "blog-preview",
  title = content.blog.title,
  subtitle = content.blog.subtitle,
  posts,
  isPlaceholder = false,
  emptyMessage = HOME_BLOG_EMPTY_MESSAGE,
  cta = content.blog.cta,
  className,
}: BlogPreviewSectionProps) {
  const headingId = `${sectionId}-heading`;
  const displayPosts = isPlaceholder ? HOME_BLOG_PLACEHOLDER_POSTS : posts;

  return (
    <Section
      background="soft"
      spacing="default"
      bordered
      className={className}
      aria-labelledby={headingId}
    >
      <ScrollReveal>
        <SectionHeader
          id={headingId}
          title={title}
          subtitle={subtitle}
          subtitleClassName="mt-4"
          className="mb-8 sm:mb-10 lg:mb-12"
        />
      </ScrollReveal>

      {isPlaceholder ? (
        <ScrollReveal delay={scrollRevealDefaults.stagger}>
          <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-center shadow-sm sm:mb-10 sm:px-6 sm:py-4">
            <p className="inline-flex items-center justify-center gap-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <Sparkles className="size-4 shrink-0 text-brand" aria-hidden />
              {emptyMessage}
            </p>
          </div>
        </ScrollReveal>
      ) : null}

      <Container padding="none" className="max-w-6xl">
        <ul
          className="grid list-none grid-cols-1 gap-5 p-0 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
          role="list"
        >
          {displayPosts.map((post, index) => (
            <li key={post.id}>
              <ScrollReveal delay={index * scrollRevealDefaults.stagger}>
                <BlogCard
                  post={post}
                  isPlaceholder={isPlaceholder}
                  priority={!isPlaceholder && index === 0}
                />
              </ScrollReveal>
            </li>
          ))}
        </ul>
      </Container>

      <ScrollReveal delay={0.15}>
        <div className="mt-10 flex justify-center sm:mt-12 lg:mt-14">
          <Button
            asChild
            size="lg"
            className="h-11 w-full rounded-lg bg-brand px-6 text-sm text-brand-foreground shadow-sm transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-brand/90 hover:shadow-md active:translate-y-0 sm:w-auto"
          >
            <Link href={cta.href} className="gap-2">
              {cta.label}
              <ArrowRight className="size-4" strokeWidth={1.75} aria-hidden />
            </Link>
          </Button>
        </div>
      </ScrollReveal>
    </Section>
  );
}
