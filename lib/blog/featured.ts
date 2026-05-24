import { MAX_FEATURED_HOME_POSTS } from "@/lib/blog/constants";
import { prisma } from "@/lib/prisma";

export async function countFeaturedHomePosts(excludeId?: string) {
  return prisma.post.count({
    where: {
      featuredOnHomepage: true,
      published: true,
      ...(excludeId
        ? {
            NOT: { id: excludeId },
          }
        : {}),
    },
  });
}

export async function getFeaturedHomePostsLimitMessage(excludeId?: string) {
  const count = await countFeaturedHomePosts(excludeId);

  if (count >= MAX_FEATURED_HOME_POSTS) {
    return `Limite de ${MAX_FEATURED_HOME_POSTS} posts destacados na homepage atingido. Remova um destaque antes de adicionar outro.`;
  }

  return null;
}
