import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { BlogPostCreateScreen } from "@/components/admin/blog-post-create-screen";

export const metadata: Metadata = {
  title: "Novo Post | Admin Blogs",
  description: "Crie um novo post no painel administrativo.",
  robots: {
    index: false,
    follow: false,
  },
};

type NewBlogPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function NewBlogPage({ searchParams }: NewBlogPageProps) {
  const params = (await searchParams) ?? {};

  if (params.done === "1") {
    redirect("/admin/blogs");
  }

  return <BlogPostCreateScreen />;
}
