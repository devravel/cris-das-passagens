import { cache } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import { BlogArticleContent } from "@/components/blog/blog-article-content";
import { BlogPostReadingUi } from "@/components/blog/blog-post-reading-ui";
import { StorageImage } from "@/components/ui/storage-image";
import { BlogPostLikeButton, BlogPostLikeProvider } from "@/components/blog/blog-post-like";
import { BlogPostShare } from "@/components/blog/blog-post-share";
import { BlogPostTags } from "@/components/blog/blog-post-tags";
import { BlogVipCta } from "@/components/blog/blog-vip-cta";
import { JsonLdScript } from "@/components/seo/json-ld-script";
import { bodyTextClassName } from "@/components/layout/section-header";
import { Button } from "@/components/ui/button";
import { normalizeBlogImageUrl } from "@/lib/blog/image-url";
import { formatBlogSidebarDate } from "@/lib/blog/utils";
import { getPostLikeCount, getTagsForPost } from "@/lib/blog/tags";
import { prisma } from "@/lib/prisma";
import {
  createArticleJsonLd,
  createArticleMetadata,
  createBreadcrumbJsonLd,
  createNoIndexMetadata,
} from "@/lib/seo";
import { buildCanonicalUrl } from "@/lib/seo/site-url";
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

  const tags = await getTagsForPost(post.id);

  return createArticleMetadata({
    title: post.title,
    description: post.excerpt,
    slug: post.slug,
    coverImage: normalizeBlogImageUrl(post.coverImage),
    publishedAt: post.createdAt,
    updatedAt: post.updatedAt,
    keywords: [
      "blog",
      "viagens",
      "dicas de viagem",
      post.title,
      ...tags.map((tag) => tag.name),
    ],
  });
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const tags = await getTagsForPost(post.id);
  const likeCount = await getPostLikeCount(post.id);
  const canonicalUrl = buildCanonicalUrl(`/blog/${post.slug}`);
  const coverImage = normalizeBlogImageUrl(post.coverImage);

  const publishedAt = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(post.createdAt);

  const sidebarPublishedAt = formatBlogSidebarDate(post.createdAt);

  const structuredData = [
    createArticleJsonLd({
      title: post.title,
      description: post.excerpt,
      slug: post.slug,
      coverImage,
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
    <BlogPostLikeProvider postId={post.id} initialLikeCount={likeCount}>
      <section className="border-b border-border/50 bg-background py-10 sm:py-12 lg:py-16">
        <BlogPostReadingUi
          publishedAtLabel={sidebarPublishedAt}
          publishedAtIso={post.createdAt.toISOString()}
          title={post.title}
          url={canonicalUrl}
        />
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
              <p className={cn("mt-4", bodyTextClassName, "sm:text-base md:text-lg")}>
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
              <StorageImage
                src={coverImage}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 900px"
                className="object-cover"
                containerClassName="relative aspect-16/10 w-full"
              />
            </div>

            <div className="px-5 py-7 sm:px-8 sm:py-9 lg:px-10 lg:py-10">
              <BlogArticleContent html={post.content} />

              <div className="mt-10 space-y-8 border-t border-border/60 pt-8">
                <BlogVipCta />

                <BlogPostTags tags={tags} />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <BlogPostLikeButton />
                  <BlogPostShare url={canonicalUrl} title={post.title} />
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </BlogPostLikeProvider>
  );
}
