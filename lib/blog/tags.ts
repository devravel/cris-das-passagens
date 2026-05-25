import "server-only";

import { prisma } from "@/lib/prisma";
import { normalizeSlug } from "@/lib/blog/utils";
import { parseTagNames } from "@/lib/blog/tag-utils";

export { MAX_TAGS_PER_POST } from "@/lib/blog/tag-utils";

export async function syncPostTags(postId: string, tagNames: string[]) {
  try {
    const names = parseTagNames(tagNames);

    await prisma.postTag.deleteMany({
      where: { postId },
    });

    if (names.length === 0) {
      return true;
    }

    for (const name of names) {
      const slug = normalizeSlug(name);

      const tag = await prisma.tag.upsert({
        where: { slug },
        create: { name, slug },
        update: {},
        select: { id: true },
      });

      await prisma.postTag.create({
        data: {
          postId,
          tagId: tag.id,
        },
      });
    }

    return true;
  } catch {
    return false;
  }
}

export async function getTagsForPost(postId: string) {
  try {
    const relations = await prisma.postTag.findMany({
      where: { postId },
      select: {
        tag: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: {
        tag: {
          name: "asc",
        },
      },
    });

    return relations.map((relation) => relation.tag);
  } catch {
    return [];
  }
}

export async function getPostLikeCount(postId: string) {
  try {
    return await prisma.postLike.count({
      where: { postId },
    });
  } catch {
    return 0;
  }
}
