"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { BlogPostForm } from "@/components/admin/blog-post-form";
import { Button } from "@/components/ui/button";
import type { BlogPostInput } from "@/lib/blog/schemas";

type BlogPostEditScreenProps = {
  post: BlogPostInput & {
    id: string;
    tags?: string[];
  };
};

export function BlogPostEditScreen({ post }: BlogPostEditScreenProps) {
  const router = useRouter();

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-foreground">
            Editar post
          </h1>
          <p className="text-sm text-muted-foreground">
            Atualize conteúdo, status de publicação e capa com segurança.
          </p>
        </div>
        <Button variant="outline" className="rounded-xl" onClick={() => router.push("/admin/blogs")}>
          <ArrowLeft className="size-4" aria-hidden />
          Voltar
        </Button>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card/90 p-4 shadow-sm sm:p-6">
        <BlogPostForm
          mode="edit"
          postId={post.id}
          initialValues={{
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            coverImage: post.coverImage,
            tags: post.tags ?? [],
            published: post.published,
            featuredOnHomepage: post.featuredOnHomepage,
          }}
          onSuccess={() => {
            router.push("/admin/blogs");
            router.refresh();
          }}
        />
      </div>
    </section>
  );
}
