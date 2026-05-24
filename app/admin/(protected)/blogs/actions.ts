"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { ActionFailure, ActionResult } from "@/lib/admin/action-result";
import { getCurrentAdminSession } from "@/lib/auth/admin-auth";
import { getFeaturedHomePostsLimitMessage } from "@/lib/blog/featured";
import { blogPostSchema, type BlogPostInput } from "@/lib/blog/schemas";
import { makeCoverImagePath } from "@/lib/blog/utils";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const uploadCoverSchema = z.object({
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
    coverImage: input.coverImage.trim(),
    published,
    featuredOnHomepage,
  };
}

function revalidateBlogPaths(slug: string) {
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
      data: values,
      select: {
        id: true,
        slug: true,
      },
    });

    revalidateBlogPaths(post.slug);

    return {
      ok: true,
      message: values.published
        ? "Post criado e publicado com sucesso."
        : "Rascunho criado com sucesso.",
      data: post,
    };
  } catch {
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
      data: values,
      select: { slug: true },
    });

    revalidateBlogPaths(existing.slug);
    if (existing.slug !== updated.slug) {
      revalidateBlogPaths(updated.slug);
    }

    return {
      ok: true,
      message: values.published
        ? "Post atualizado e publicado."
        : "Post atualizado como rascunho.",
      data: updated,
    };
  } catch {
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

export async function uploadBlogCoverImageAction(
  formData: FormData,
): Promise<ActionResult<{ coverImageUrl: string }>> {
  try {
    await requireAdmin();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return {
        ok: false,
        message: "Arquivo inválido.",
      };
    }

    const parsedUpload = uploadCoverSchema.safeParse({
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

    const allowedMimeTypes = new Set([
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
    ]);

    if (!allowedMimeTypes.has(parsedUpload.data.fileType.toLowerCase())) {
      return {
        ok: false,
        message: "Formato inválido. Use JPG, PNG, WEBP ou AVIF.",
      };
    }

    const supabaseAdmin = createSupabaseAdminClient();
    const path = makeCoverImagePath(parsedUpload.data.fileName);
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from("blog-covers")
      .upload(path, fileBuffer, {
        contentType: parsedUpload.data.fileType,
        upsert: false,
      });

    if (uploadError) {
      return {
        ok: false,
        message: `Falha no upload: ${uploadError.message}`,
      };
    }

    const { data } = supabaseAdmin.storage.from("blog-covers").getPublicUrl(path);

    return {
      ok: true,
      message: "Imagem enviada com sucesso.",
      data: {
        coverImageUrl: data.publicUrl,
      },
    };
  } catch {
    return {
      ok: false,
      message: "Não foi possível enviar a imagem agora.",
    };
  }
}
