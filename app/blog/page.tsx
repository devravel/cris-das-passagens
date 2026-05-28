import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { BlogImage } from "@/components/blog/blog-image";
import { HOME_BLOG_SECTION_ID } from "@/config/navigation";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/layout/section-header";
import {
  blogCardBodyClassName,
  blogCardCtaClassName,
  blogCardExcerptClassName,
  blogCardTitleClassName,
} from "@/lib/blog/card-styles";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/seo";
import { normalizeBlogImageUrl } from "@/lib/blog/image-url";
import { prisma } from "@/lib/prisma";
import {
  cardContentContainerClassName,
  cardInteractiveClassName,
  cardShadowClassName,
} from "@/lib/card-styles";
import { cn } from "@/lib/utils";

const POSTS_PER_PAGE = 6;

type BlogPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getPageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);

  if (!raw || Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

function getBlogHref(page: number) {
  if (page <= 1) return "/blog";
  return `/blog?page=${page}`;
}

export async function generateMetadata({
  searchParams,
}: BlogPageProps): Promise<Metadata> {
  const resolvedSearchParams = (await searchParams) ?? {};
  const page = getPageParam(resolvedSearchParams.page);
  const path = page <= 1 ? "/blog" : `/blog?page=${page}`;

  return createMetadata({
    title:
      page <= 1
        ? "Blog de Viagens e Dicas"
        : `Blog de Viagens — Página ${page}`,
    description:
      "Conteúdos exclusivos da Cris das Passagens com dicas de viagem, destinos e orientações para viajar com mais tranquilidade.",
    path,
    keywords: [
      "blog de viagens",
      "dicas de viagem",
      "passagens aereas",
      "Cris das Passagens",
    ],
  });
}

export const revalidate = 3600;

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const requestedPage = getPageParam(resolvedSearchParams.page);

  const totalPublishedPosts = await prisma.post.count({
    where: { published: true },
  });

  const totalPages = Math.max(
    1,
    Math.ceil(totalPublishedPosts / POSTS_PER_PAGE),
  );
  const currentPage = Math.min(requestedPage, totalPages);
  const skip = (currentPage - 1) * POSTS_PER_PAGE;

  const posts = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
      createdAt: true,
    },
    take: POSTS_PER_PAGE,
    skip,
  });

  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <Section spacing="default" background="default" bordered>
      <div className="mb-6 sm:mb-8">
        <Button
          asChild
          variant="ghost"
          className="h-9 rounded-lg px-3 text-sm text-muted-foreground hover:text-foreground"
        >
          <Link href={`/#${HOME_BLOG_SECTION_ID}`}>
            <ArrowLeft className="size-4" aria-hidden />
            Voltar para a página inicial
          </Link>
        </Button>
      </div>

      <SectionHeader
        id="blog-page-heading"
        title="Blogs"
        subtitle="Dicas, roteiros e inspiração para você viajar com segurança e experiência premium."
        className="mb-10 sm:mb-12"
      />

      {posts.length === 0 ? (
        <div className="mx-auto max-w-2xl rounded-2xl border border-border/60 bg-muted/20 px-6 py-14 text-center shadow-sm">
          <p className="text-base text-muted-foreground sm:text-lg">
            Ainda não existem posts publicados.
          </p>
        </div>
      ) : (
        <>
          <ul className="grid list-none grid-cols-1 items-stretch gap-5 p-0 sm:gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => {
              const href = `/blog/${post.slug}`;
              const formattedDate = new Intl.DateTimeFormat("pt-BR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }).format(post.createdAt);

              return (
                <li key={post.id} className="flex">
                  <article
                    className={cn(
                      "group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-background ring-1 ring-border/50",
                      cardContentContainerClassName,
                      cardInteractiveClassName,
                      cardShadowClassName,
                    )}
                  >
                    <Link
                      href={href}
                      className="relative block aspect-16/10 overflow-hidden"
                    >
                      <BlogImage
                        src={normalizeBlogImageUrl(post.coverImage)}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="transition-transform duration-500 group-hover:scale-[1.03]"
                        containerClassName="absolute inset-0"
                      />
                    </Link>

                    <div className={cn(blogCardBodyClassName, "p-5 sm:p-6")}>
                      <p className="shrink-0 text-xs font-medium uppercase tracking-wider text-brand">
                        {formattedDate}
                      </p>

                      <h2 className={cn(blogCardTitleClassName, "mt-2 text-lg sm:text-xl")}>
                        <Link
                          href={href}
                          className="outline-none transition-colors duration-200 hover:text-brand focus-visible:rounded-sm focus-visible:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
                        >
                          {post.title}
                        </Link>
                      </h2>

                      <p className={blogCardExcerptClassName}>{post.excerpt}</p>

                      <Link
                        href={href}
                        className={cn(blogCardCtaClassName, "mt-5")}
                      >
                        Ler artigo
                        <ArrowRight
                          className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </Link>
                    </div>
                  </article>
                </li>
              );
            })}
          </ul>

          <nav
            className="mt-10 flex items-center justify-center gap-3 sm:mt-12"
            aria-label="Paginação do blog"
          >
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-10 min-w-28 rounded-lg border-border/70 bg-background"
            >
              <Link
                href={hasPreviousPage ? getBlogHref(currentPage - 1) : "#"}
                aria-disabled={!hasPreviousPage}
                tabIndex={hasPreviousPage ? 0 : -1}
                className={cn(
                  !hasPreviousPage && "pointer-events-none opacity-50",
                )}
              >
                <ArrowLeft className="size-4" aria-hidden />
                Anterior
              </Link>
            </Button>

            <p className="min-w-28 text-center text-sm font-medium text-muted-foreground">
              Página {currentPage} de {totalPages}
            </p>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-10 min-w-28 rounded-lg border-border/70 bg-background"
            >
              <Link
                href={hasNextPage ? getBlogHref(currentPage + 1) : "#"}
                aria-disabled={!hasNextPage}
                tabIndex={hasNextPage ? 0 : -1}
                className={cn(!hasNextPage && "pointer-events-none opacity-50")}
              >
                Próxima
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </nav>
        </>
      )}
    </Section>
  );
}
