"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import {
  createBlogPostAction,
  updateBlogPostAction,
  uploadBlogCoverImageAction,
} from "@/app/admin/(protected)/blogs/actions";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { blogPostSchema, type BlogPostInput } from "@/lib/blog/schemas";
import { normalizeSlug } from "@/lib/blog/utils";
import { cn } from "@/lib/utils";

type BlogPostFormValues = BlogPostInput;

type BlogPostFormProps = {
  mode: "create" | "edit";
  postId?: string;
  initialValues?: BlogPostFormValues;
  onSuccess?: (result: { id?: string; slug?: string }) => void;
};

const EMPTY_VALUES: BlogPostFormValues = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  coverImage: "",
  published: false,
  featuredOnHomepage: false,
};

export function BlogPostForm({
  mode,
  postId,
  initialValues,
  onSuccess,
}: BlogPostFormProps) {
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const values = useMemo(
    () => ({
      ...EMPTY_VALUES,
      ...initialValues,
    }),
    [initialValues],
  );

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: values,
    mode: "onBlur",
  });

  const contentValue = useWatch({ control: form.control, name: "content" }) ?? "";
  const coverImageValue = useWatch({ control: form.control, name: "coverImage" }) ?? "";
  const isPublished = useWatch({ control: form.control, name: "published" }) ?? false;
  const isFeatured = useWatch({ control: form.control, name: "featuredOnHomepage" }) ?? false;

  async function handleUploadCover(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    const result = await uploadBlogCoverImageAction(formData);
    setIsUploading(false);

    if (!result.ok || !result.data) {
      toast.error(result.message);
      return;
    }

    form.setValue("coverImage", result.data.coverImageUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });
    toast.success("Imagem de capa enviada.");
  }

  function handleSelectCover() {
    fileInputRef.current?.click();
  }

  function handleAutoSlug() {
    const title = form.getValues("title");
    const slug = normalizeSlug(title);
    form.setValue("slug", slug, { shouldDirty: true, shouldValidate: true });
  }

  function onSubmit(input: BlogPostFormValues) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createBlogPostAction(input)
          : await updateBlogPostAction(postId ?? "", input);

      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [field, errors] of Object.entries(result.fieldErrors)) {
            const firstError = errors?.[0];
            if (!firstError) continue;
            form.setError(field as keyof BlogPostFormValues, { message: firstError });
          }
        }

        toast.error(result.message);
        return;
      }

      toast.success(result.message);

      const data = result.data;
      onSuccess?.({
        id: data && "id" in data && typeof data.id === "string" ? data.id : undefined,
        slug: data?.slug,
      });
    });
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          void handleUploadCover(file);
          event.currentTarget.value = "";
        }}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-2">
          <label htmlFor="title" className="text-sm font-medium text-foreground">
            Titulo
          </label>
          <Input
            id="title"
            className="h-10 rounded-xl"
            placeholder="Ex.: Como economizar em passagens internacionais"
            {...form.register("title")}
          />
          {form.formState.errors.title ? (
            <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="slug" className="text-sm font-medium text-foreground">
            Slug
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="slug"
              className="h-10 rounded-xl"
              placeholder="como-economizar-em-passagens"
              {...form.register("slug")}
            />
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-border/70"
              onClick={handleAutoSlug}
            >
              Gerar
            </Button>
          </div>
          {form.formState.errors.slug ? (
            <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="coverImage" className="text-sm font-medium text-foreground">
            Imagem de capa
          </label>
          <div className="flex items-center gap-2">
            <Input
              id="coverImage"
              className="h-10 rounded-xl"
              placeholder="https://..."
              {...form.register("coverImage")}
            />
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-xl border-border/70"
              onClick={handleSelectCover}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <UploadCloud className="size-4" aria-hidden />
              )}
            </Button>
          </div>
          {form.formState.errors.coverImage ? (
            <p className="text-xs text-destructive">{form.formState.errors.coverImage.message}</p>
          ) : null}
          {coverImageValue ? (
            <p className="truncate text-xs text-muted-foreground">{coverImageValue}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="excerpt" className="text-sm font-medium text-foreground">
          Resumo
        </label>
        <Textarea
          id="excerpt"
          className="min-h-24 rounded-xl"
          placeholder="Resumo curto para listagem do blog..."
          {...form.register("excerpt")}
        />
        {form.formState.errors.excerpt ? (
          <p className="text-xs text-destructive">{form.formState.errors.excerpt.message}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium text-foreground">Conteudo</label>
        <TiptapEditor
          value={contentValue}
          onChange={(nextValue) =>
            form.setValue("content", nextValue, { shouldDirty: true, shouldValidate: true })
          }
        />
        {form.formState.errors.content ? (
          <p className="text-xs text-destructive">{form.formState.errors.content.message}</p>
        ) : null}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-muted/25 p-3">
          <label
            htmlFor="published"
            className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground"
          >
            <input
              id="published"
              type="checkbox"
              className={cn(
                "size-4 rounded border-border text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              checked={isPublished}
              onChange={(event) => {
                const nextPublished = event.target.checked;
                form.setValue("published", nextPublished, {
                  shouldDirty: true,
                  shouldValidate: true,
                });

                if (!nextPublished) {
                  form.setValue("featuredOnHomepage", false, {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
            />
            Publicar post
          </label>
          <p className="text-xs text-muted-foreground">
            {isPublished ? "Visivel no site publico." : "Salvo como rascunho."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-muted/25 p-3">
          <label
            htmlFor="featuredOnHomepage"
            className={cn(
              "inline-flex items-center gap-2 text-sm font-medium",
              isPublished ? "cursor-pointer text-foreground" : "cursor-not-allowed text-muted-foreground",
            )}
          >
            <input
              id="featuredOnHomepage"
              type="checkbox"
              className={cn(
                "size-4 rounded border-border text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              )}
              checked={isFeatured}
              disabled={!isPublished}
              onChange={(event) =>
                form.setValue("featuredOnHomepage", event.target.checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            Destacar na homepage
          </label>
          <p className="text-xs text-muted-foreground">
            {isPublished
              ? "Maximo de 3 posts destacados na landing page."
              : "Publique o post para habilitar destaque na homepage."}
          </p>
          {form.formState.errors.featuredOnHomepage ? (
            <p className="w-full text-xs text-destructive">
              {form.formState.errors.featuredOnHomepage.message}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button
          type="submit"
          className="h-10 rounded-xl px-5"
          disabled={isPending || isUploading}
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Salvando...
            </>
          ) : mode === "create" ? (
            "Criar post"
          ) : (
            "Salvar alteracoes"
          )}
        </Button>
      </div>
    </form>
  );
}
