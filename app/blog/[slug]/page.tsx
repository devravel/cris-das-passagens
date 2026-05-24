import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { JsonLdScript } from "@/components/seo/json-ld-script";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import {
  createArticleJsonLd,
  createArticleMetadata,
  createBreadcrumbJsonLd,
  createNoIndexMetadata,
} from "@/lib/seo";
import {
  cardInteractiveClassName,
  cardShadowClassName,
} from "@/lib/card-styles";
import { cn } from "@/lib/utils";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

const getPublishedPostBySlug = cache(async (slug: string) => {
  return prisma.post.findFirst({
    where: {
      slug,
      published: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      createdAt: true,
      updatedAt: true,
    },
  });
});

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { slug: true },
  });

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    return createNoIndexMetadata({
      title: "Post não encontrado",
      description: "O conteúdo solicitado não está disponível.",
    });
  }

  return createArticleMetadata({
    title: post.title,
    description: post.excerpt,
    slug: post.slug,
    coverImage: post.coverImage,
    publishedAt: post.createdAt,
    updatedAt: post.updatedAt,
    keywords: ["blog", "viagens", "dicas de viagem", post.title],
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const publishedAt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(post.createdAt);

  const structuredData = [
    createArticleJsonLd({
      title: post.title,
      description: post.excerpt,
      slug: post.slug,
      coverImage: post.coverImage,
      publishedAt: post.createdAt,
      updatedAt: post.updatedAt,
    }),
    createBreadcrumbJsonLd([
      { name: "Inicio", path: "/" },
      { name: "Blog", path: "/blog" },
      { name: post.title, path: `/blog/${post.slug}` },
    ]),
  ];

  return (
    <section className="border-b border-border/50 bg-background py-10 sm:py-12 lg:py-16">
      <JsonLdScript data={structuredData} />
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-6 w-full max-w-3xl sm:mb-8">
          <Button
            asChild
            variant="ghost"
            className="h-9 rounded-lg px-3 text-sm text-muted-foreground hover:text-foreground"
          >
            <Link href="/blog">
              <ArrowLeft className="size-4" aria-hidden />
              Voltar para o blog
            </Link>
          </Button>
        </div>

        <article
          className={cn(
            "mx-auto w-full max-w-3xl overflow-hidden rounded-3xl bg-card ring-1 ring-border/60",
            cardInteractiveClassName,
            cardShadowClassName,
          )}
        >
          <header className="px-5 pt-6 sm:px-8 sm:pt-8 lg:px-10 lg:pt-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">
              Blog Cris das Passagens
            </p>
            <h1 className="mt-3 text-balance font-heading text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-3xl lg:text-4xl">
              {post.title}
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              {post.excerpt}
            </p>
            <time
              dateTime={post.createdAt.toISOString()}
              className="mt-4 block text-xs font-medium uppercase tracking-wide text-muted-foreground/90"
            >
              Publicado em {publishedAt}
            </time>
          </header>

          <div className="mt-6 sm:mt-8">
            <div className="relative aspect-16/10 w-full overflow-hidden">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 900px"
                className="object-cover"
              />
            </div>
          </div>

          <div className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
            <div
              className={cn(
                "text-[1.02rem] leading-8 text-foreground/95",
                "[&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight",
                "[&_h3]:mt-8 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:tracking-tight",
                "[&_p]:mt-5 [&_p]:text-pretty",
                "[&_ul]:mt-5 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5",
                "[&_ol]:mt-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5",
                "[&_a]:font-medium [&_a]:text-brand [&_a]:underline-offset-4 hover:[&_a]:underline",
                "[&_blockquote]:my-6 [&_blockquote]:rounded-xl [&_blockquote]:border-l-4 [&_blockquote]:border-brand/40 [&_blockquote]:bg-muted/35 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:italic",
                "[&_strong]:font-semibold",
              )}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>
        </article>
      </div>
    </section>
  );
}
