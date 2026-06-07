import { unstable_cache } from "next/cache";
import { cache } from "react";

import { FEATURED_HOME_BLOG_POSTS_CACHE_TAG } from "@/lib/blog/cache-tags";
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

async function fetchFeaturedHomeBlogPostsFromDb(): Promise<HomeBlogPostPreview[]> {
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
}

const getCachedFeaturedHomeBlogPosts = unstable_cache(
  fetchFeaturedHomeBlogPostsFromDb,
  ["featured-home-blog-posts"],
  { tags: [FEATURED_HOME_BLOG_POSTS_CACHE_TAG] },
);

export const getFeaturedHomeBlogPosts = cache(async (): Promise<HomeBlogPostPreview[]> => {
  try {
    return await getCachedFeaturedHomeBlogPosts();
  } catch (error) {
    console.error("[getFeaturedHomeBlogPosts] Failed to load featured home blog posts:", error);
    return [];
  }
});
