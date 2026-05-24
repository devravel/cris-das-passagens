import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlogPostEditScreen } from "@/components/admin/blog-post-edit-screen";
import { prisma } from "@/lib/prisma";

type EditBlogPageProps = {
  params: Promise<{ id: string }>;
};

export const metadata: Metadata = {
  title: "Editar Post | Admin Blogs",
  description: "Edite um post no painel administrativo.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function EditBlogPage({ params }: EditBlogPageProps) {
  const { id } = await params;

  const post = await prisma.post.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      content: true,
      coverImage: true,
      published: true,
      featuredOnHomepage: true,
    },
  });

  if (!post) {
    notFound();
  }

  return <BlogPostEditScreen post={post} />;
}
