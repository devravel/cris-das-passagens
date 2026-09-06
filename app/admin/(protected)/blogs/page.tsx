import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, Eye, FileText, Plus, Star } from "lucide-react";

import { BlogsTable } from "@/components/admin/blogs-table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Admin Blogs | Cris das Passagens",
  description: "Gerencie artigos do blog no painel administrativo.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminBlogsPage() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      featuredOnHomepage: true,
      views: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <section className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Blogs
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Organize o fluxo editorial com uma experiência simples, clara e
            pronta para escalar.
          </p>
        </div>
        <Button asChild className="rounded-xl">
          <Link href="/admin/blogs/new">
            <Plus className="size-4" aria-hidden />
            Novo post
          </Link>
        </Button>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4 text-brand" aria-hidden />
              Total de posts
            </CardTitle>
            <CardDescription>
              Quantidade total cadastrada no painel.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {posts.length}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CircleCheck className="size-4 text-brand" aria-hidden />
              Publicados
            </CardTitle>
            <CardDescription>Posts visíveis no blog público.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {posts.filter((post) => post.published).length}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="size-4 text-brand" aria-hidden />
              Destaques na homepage
            </CardTitle>
            <CardDescription>
              Posts selecionados para a landing page (max. 3).
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {
              posts.filter((post) => post.featuredOnHomepage && post.published)
                .length
            }
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="size-4 text-brand" aria-hidden />
              Acessos no blog
            </CardTitle>
            <CardDescription>
              Soma das visitas em todos os posts publicados.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {posts
              .reduce((total, post) => total + post.views, 0)
              .toLocaleString("pt-BR")}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="size-4 text-brand" aria-hidden />
              Rascunhos
            </CardTitle>
            <CardDescription>Posts ainda não publicados.</CardDescription>
          </CardHeader>
          <CardContent className="text-3xl font-semibold tracking-tight text-foreground">
            {posts.filter((post) => !post.published).length}
          </CardContent>
        </Card>
      </div>

      <BlogsTable
        posts={posts.map((post) => ({
          ...post,
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
        }))}
      />
    </section>
  );
}
