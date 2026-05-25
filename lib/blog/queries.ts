import { cache } from "react";

import { MAX_FEATURED_HOME_POSTS } from "@/lib/blog/constants";
import { normalizeBlogImageUrl } from "@/lib/blog/image-url";
import { prisma } from "@/lib/prisma";

export type HomeBlogPostPreview = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  href: string;
};

export const getFeaturedHomeBlogPosts = cache(async (): Promise<HomeBlogPostPreview[]> => {
  const posts = await prisma.post.findMany({
    where: {
      published: true,
      featuredOnHomepage: true,
    },
    orderBy: { createdAt: "desc" },
    take: MAX_FEATURED_HOME_POSTS,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      coverImage: true,
    },
  });

  return posts.map((post) => ({
    ...post,
    coverImage: normalizeBlogImageUrl(post.coverImage),
    href: `/blog/${post.slug}`,
  }));
});
