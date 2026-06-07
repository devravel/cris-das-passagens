"use server";

import { revalidatePath, updateTag } from "next/cache";
import { z } from "zod";

import type { ActionFailure, ActionResult } from "@/lib/admin/action-result";
import { getCurrentAdminSession } from "@/lib/auth/admin-auth";
import { FEATURED_HOME_BLOG_POSTS_CACHE_TAG } from "@/lib/blog/cache-tags";
import { getFeaturedHomePostsLimitMessage } from "@/lib/blog/featured";
import { normalizeBlogImageUrl } from "@/lib/blog/image-url";
import { blogPostSchema, type BlogPostInput } from "@/lib/blog/schemas";
import { uploadBlogImageToStorage } from "@/lib/blog/storage";
import { syncPostTags } from "@/lib/blog/tags";
import { prisma } from "@/lib/prisma";

const uploadImageSchema = z.object({
  fileName: z.string().min(1),
  fileType: z.string().min(1),
  fileSize: z.number().max(5 * 1024 * 1024, "A imagem deve ter no máximo 5MB."),
});

async function requireAdmin() {
  const session = await getCurrentAdminSession();

  if (!session) {
    throw new Error("Não autorizado.");
  }
}

function toFieldErrors(error: z.ZodError<BlogPostInput>) {
  return error.flatten().fieldErrors;
}

function normalizeInput(input: BlogPostInput) {
  const published = input.published;
  const featuredOnHomepage = published ? input.featuredOnHomepage : false;

  return {
    title: input.title.trim(),
    slug: input.slug.trim(),
    excerpt: input.excerpt.trim(),
    content: input.content.trim(),
    coverImage: normalizeBlogImageUrl(input.coverImage.trim()),
    published,
    featuredOnHomepage,
    tags: input.tags ?? [],
  };
}

function revalidateBlogPaths(slug: string) {
  updateTag(FEATURED_HOME_BLOG_POSTS_CACHE_TAG);
  revalidatePath("/admin/blogs");
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
  revalidatePath("/");
}

async function validateFeaturedLimit(
  featuredOnHomepage: boolean,
  postId?: string,
): Promise<ActionFailure | null> {
  if (!featuredOnHomepage) {
    return null;
  }

  const limitMessage = await getFeaturedHomePostsLimitMessage(postId);

  if (limitMessage) {
    return {
      ok: false,
      message: limitMessage,
      fieldErrors: {
        featuredOnHomepage: [limitMessage],
      },
    };
  }

  return null;
}

export async function createBlogPostAction(
  input: BlogPostInput,
): Promise<ActionResult<{ id: string; slug: string }>> {
  try {
    await requireAdmin();
    const parsed = blogPostSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Revise os campos obrigatórios.",
        fieldErrors: toFieldErrors(parsed.error),
      };
    }

    const values = normalizeInput(parsed.data);

    const featuredLimitError = await validateFeaturedLimit(values.featuredOnHomepage);
    if (featuredLimitError) {
      return featuredLimitError;
    }

    const existingSlug = await prisma.post.findUnique({
      where: { slug: values.slug },
      select: { id: true },
    });

    if (existingSlug) {
      return {
        ok: false,
        message: "Já existe um post com este slug.",
        fieldErrors: { slug: ["Escolha outro slug."] },
      };
    }

    const post = await prisma.post.create({
      data: {
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt,
        content: values.content,
        coverImage: values.coverImage,
        published: values.published,
        featuredOnHomepage: values.featuredOnHomepage,
      },
      select: {
        id: true,
        slug: true,
      },
    });

    await syncPostTags(post.id, values.tags);
    revalidateBlogPaths(post.slug);

    return {
      ok: true,
      message: values.published
        ? "Post criado e publicado com sucesso."
        : "Rascunho criado com sucesso.",
      data: post,
    };
  } catch (error) {
    console.error("createBlogPostAction failed:", error);
    return {
      ok: false,
      message: "Não foi possível criar o post agora.",
    };
  }
}

export async function updateBlogPostAction(
  id: string,
  input: BlogPostInput,
): Promise<ActionResult<{ slug: string }>> {
  try {
    await requireAdmin();
    const parsed = blogPostSchema.safeParse(input);

    if (!parsed.success) {
      return {
        ok: false,
        message: "Revise os campos obrigatórios.",
        fieldErrors: toFieldErrors(parsed.error),
      };
    }

    const values = normalizeInput(parsed.data);

    const featuredLimitError = await validateFeaturedLimit(values.featuredOnHomepage, id);
    if (featuredLimitError) {
      return featuredLimitError;
    }

    const existing = await prisma.post.findUnique({
      where: { id },
      select: { id: true, slug: true },
    });

    if (!existing) {
      return {
        ok: false,
        message: "Post não encontrado.",
      };
    }

    const slugConflict = await prisma.post.findFirst({
      where: {
        slug: values.slug,
        NOT: {
          id,
        },
      },
      select: { id: true },
    });

    if (slugConflict) {
      return {
        ok: false,
        message: "Já existe um post com este slug.",
        fieldErrors: { slug: ["Escolha outro slug."] },
      };
    }

    const updated = await prisma.post.update({
      where: { id },
      data: {
        title: values.title,
        slug: values.slug,
        excerpt: values.excerpt,
        content: values.content,
        coverImage: values.coverImage,
        published: values.published,
        featuredOnHomepage: values.featuredOnHomepage,
      },
      select: { slug: true },
    });

    const tagsSynced = await syncPostTags(id, values.tags);
    revalidateBlogPaths(existing.slug);
    if (existing.slug !== updated.slug) {
      revalidateBlogPaths(updated.slug);
    }

    const baseMessage = values.published
      ? "Post atualizado e publicado."
      : "Post atualizado como rascunho.";

    return {
      ok: true,
      message:
        !tagsSynced && values.tags.length > 0
          ? `${baseMessage} As tags não puderam ser salvas — execute a migration do banco.`
          : baseMessage,
      data: updated,
    };
  } catch (error) {
    console.error("updateBlogPostAction failed:", error);
    return {
      ok: false,
      message: "Não foi possível atualizar o post agora.",
    };
  }
}

export async function deleteBlogPostAction(id: string): Promise<ActionResult> {
  try {
    await requireAdmin();

    const post = await prisma.post.findUnique({
      where: { id },
      select: { slug: true },
    });

    if (!post) {
      return {
        ok: false,
        message: "Post não encontrado.",
      };
    }

    await prisma.post.delete({
      where: { id },
    });

    revalidateBlogPaths(post.slug);

    return {
      ok: true,
      message: "Post excluído com sucesso.",
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível excluir o post agora.",
    };
  }
}

export async function setBlogPostPublishedAction(
  id: string,
  published: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const updated = await prisma.post.update({
      where: { id },
      data: {
        published,
        ...(published ? {} : { featuredOnHomepage: false }),
      },
      select: { slug: true },
    });

    revalidateBlogPaths(updated.slug);

    return {
      ok: true,
      message: published ? "Post publicado com sucesso." : "Post despublicado com sucesso.",
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível atualizar o status do post.",
    };
  }
}

export async function setBlogPostFeaturedAction(
  id: string,
  featuredOnHomepage: boolean,
): Promise<ActionResult> {
  try {
    await requireAdmin();

    const post = await prisma.post.findUnique({
      where: { id },
      select: { id: true, slug: true, published: true, featuredOnHomepage: true },
    });

    if (!post) {
      return {
        ok: false,
        message: "Post não encontrado.",
      };
    }

    if (featuredOnHomepage && !post.published) {
      return {
        ok: false,
        message: "Publique o post antes de destacá-lo na homepage.",
      };
    }

    if (featuredOnHomepage) {
      const featuredLimitError = await validateFeaturedLimit(true, id);
      if (featuredLimitError) {
        return featuredLimitError;
      }
    }

    await prisma.post.update({
      where: { id },
      data: { featuredOnHomepage },
    });

    revalidateBlogPaths(post.slug);

    return {
      ok: true,
      message: featuredOnHomepage
        ? "Post destacado na homepage."
        : "Post removido dos destaques da homepage.",
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível atualizar o destaque do post.",
    };
  }
}

async function uploadBlogImageFromFormData(
  formData: FormData,
  folder: "covers" | "content",
): Promise<ActionResult<{ imageUrl: string }>> {
  try {
    await requireAdmin();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return {
        ok: false,
        message: "Arquivo inválido.",
      };
    }

    const parsedUpload = uploadImageSchema.safeParse({
      fileName: file.name,
      fileType: file.type || "image/jpeg",
      fileSize: file.size,
    });

    if (!parsedUpload.success) {
      return {
        ok: false,
        message: parsedUpload.error.issues[0]?.message ?? "Arquivo inválido.",
      };
    }

    const { publicUrl } = await uploadBlogImageToStorage({ file, folder });

    return {
      ok: true,
      message: "Imagem enviada com sucesso.",
      data: {
        imageUrl: publicUrl,
      },
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Não foi possível enviar a imagem agora.",
    };
  }
}

export async function uploadBlogCoverImageAction(
  formData: FormData,
): Promise<ActionResult<{ coverImageUrl: string }>> {
  const result = await uploadBlogImageFromFormData(formData, "covers");

  if (!result.ok) {
    return result;
  }

  if (!result.data) {
    return {
      ok: false,
      message: "Não foi possível enviar a imagem agora.",
    };
  }

  return {
    ok: true,
    message: result.message,
    data: {
      coverImageUrl: result.data.imageUrl,
    },
  };
}

export async function uploadBlogContentImageAction(
  formData: FormData,
): Promise<ActionResult<{ imageUrl: string }>> {
  return uploadBlogImageFromFormData(formData, "content");
}

export async function togglePostLikeAction(
  postId: string,
  clientId: string,
): Promise<ActionResult<{ liked: boolean; likeCount: number }>> {
  try {
    const parsedClientId = z.string().trim().min(8).max(128).safeParse(clientId);
    const parsedPostId = z.string().trim().min(1).safeParse(postId);

    if (!parsedClientId.success || !parsedPostId.success) {
      return {
        ok: false,
        message: "Dados inválidos.",
      };
    }

    const post = await prisma.post.findFirst({
      where: {
        id: parsedPostId.data,
        published: true,
      },
      select: { id: true },
    });

    if (!post) {
      return {
        ok: false,
        message: "Post não encontrado.",
      };
    }

    const existingLike = await prisma.postLike.findUnique({
      where: {
        postId_clientId: {
          postId: parsedPostId.data,
          clientId: parsedClientId.data,
        },
      },
      select: { id: true },
    });

    if (existingLike) {
      await prisma.postLike.delete({
        where: { id: existingLike.id },
      });
    } else {
      await prisma.postLike.create({
        data: {
          postId: parsedPostId.data,
          clientId: parsedClientId.data,
        },
      });
    }

    const likeCount = await prisma.postLike.count({
      where: { postId: parsedPostId.data },
    });

    return {
      ok: true,
      message: existingLike ? "Curtida removida." : "Post curtido.",
      data: {
        liked: !existingLike,
        likeCount,
      },
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível registrar a curtida agora.",
    };
  }
}
