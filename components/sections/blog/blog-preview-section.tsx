import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { Button } from "@/components/ui/button";
import {
  content,
  type BlogPostPreview,
  type ContentCta,
} from "@/config/content";
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
  posts?: BlogPostPreview[];
  cta?: ContentCta;
  className?: string;
};

function BlogCard({ post }: { post: BlogPostPreview }) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-2xl bg-background ring-1 ring-border/50",
        cardInteractiveClassName,
        cardShadowClassName
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={post.image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-brand">
          {post.category}
        </p>
        <h3 className="font-heading text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg md:text-xl">
          <Link
            href={post.href}
            className="outline-none transition-colors duration-200 hover:text-brand focus-visible:rounded-sm focus-visible:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            {post.title}
          </Link>
        </h3>
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {post.excerpt}
        </p>
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
      </div>
    </article>
  );
}

export function BlogPreviewSection({
  sectionId = "blog-preview",
  title = content.blog.title,
  subtitle = content.blog.subtitle,
  posts = content.blog.posts,
  cta = content.blog.cta,
  className,
}: BlogPreviewSectionProps) {
  const headingId = `${sectionId}-heading`;

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
          className="mb-12 sm:mb-14 lg:mb-16"
        />
      </ScrollReveal>

      <Container padding="none" className="max-w-4xl">
        <ul
          className="grid list-none grid-cols-1 gap-5 p-0 sm:gap-6 md:grid-cols-2"
          role="list"
        >
          {posts.map((post, index) => (
            <li key={post.href}>
              <ScrollReveal delay={index * scrollRevealDefaults.stagger}>
                <BlogCard post={post} />
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
