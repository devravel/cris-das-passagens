"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { ExternalLink, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  createPromotionAction,
  updatePromotionAction,
} from "@/app/admin/(protected)/promotions/actions";
import { PromotionImageField } from "@/components/admin/promotion-image-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isValidBlogImageUrl, normalizeBlogImageUrl } from "@/lib/blog/image-url";
import { resolveStorageImageSrc } from "@/lib/storage/media-url";
import { promotionSchema, type PromotionFormValues } from "@/lib/promotion/schemas";
import { cn } from "@/lib/utils";

type PromotionFormProps = {
  mode: "create" | "edit";
  promotionId?: string;
  initialValues?: PromotionFormValues;
  onSuccess?: () => void;
};

const EMPTY_VALUES: PromotionFormValues = {
  image: "",
  title: "",
  link: "",
  active: true,
};

export function PromotionForm({
  mode,
  promotionId,
  initialValues,
  onSuccess,
}: PromotionFormProps) {
  const [isPending, startTransition] = useTransition();
  const [previewErroredUrl, setPreviewErroredUrl] = useState<string | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const values = useMemo(
    () => ({
      ...EMPTY_VALUES,
      title: initialValues?.title ?? "",
      link: initialValues?.link ?? "",
      image: initialValues?.image ?? "",
      active: initialValues?.active ?? true,
    }),
    [initialValues],
  );

  const form = useForm<PromotionFormValues>({
    resolver: zodResolver(promotionSchema),
    defaultValues: values,
    mode: "onBlur",
  });

  const imageValue = useWatch({ control: form.control, name: "image" }) ?? "";
  const titleValue = useWatch({ control: form.control, name: "title" }) ?? "";
  const linkValue = useWatch({ control: form.control, name: "link" }) ?? "";
  const isActive = useWatch({ control: form.control, name: "active" }) ?? true;

  const previewUrl = useMemo(() => {
    if (!imageValue.trim()) {
      return "";
    }

    return resolveStorageImageSrc(normalizeBlogImageUrl(imageValue));
  }, [imageValue]);
  const previewSrc = localPreviewUrl || previewUrl;
  const hasValidPreview =
    Boolean(previewSrc) &&
    (previewSrc.startsWith("blob:") ||
      previewSrc.startsWith("/api/media/") ||
      isValidBlogImageUrl(previewSrc)) &&
    previewErroredUrl !== previewSrc;

  function onSubmit(input: PromotionFormValues) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createPromotionAction(input)
          : await updatePromotionAction(promotionId ?? "", input);

      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [field, errors] of Object.entries(result.fieldErrors)) {
            const firstError = errors?.[0];
            if (!firstError) continue;
            form.setError(field as keyof PromotionFormValues, { message: firstError });
          }
        }

        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      onSuccess?.();
    });
  }

  return (
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-sm font-medium text-foreground">
              Título <span className="text-muted-foreground">(opcional)</span>
            </label>
            <Input
              id="title"
              className="h-10 rounded-xl"
              placeholder="Ex.: Promo de verão — Miami"
              {...form.register("title")}
            />
            {form.formState.errors.title ? (
              <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="link" className="text-sm font-medium text-foreground">
              Link <span className="text-muted-foreground">(opcional)</span>
            </label>
            <div className="relative">
              <ExternalLink
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="link"
                className="h-10 rounded-xl pl-9"
                placeholder="https://wa.me/..."
                {...form.register("link")}
              />
            </div>
            {form.formState.errors.link ? (
              <p className="text-xs text-destructive">{form.formState.errors.link.message}</p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="image" className="text-sm font-medium text-foreground">
              Imagem da promoção
            </label>
            <PromotionImageField
              value={imageValue}
              onChange={(nextValue) => {
                setPreviewErroredUrl(null);
                form.setValue("image", nextValue, {
                  shouldDirty: true,
                  shouldValidate: true,
                });
              }}
              onLocalPreview={setLocalPreviewUrl}
              error={form.formState.errors.image?.message}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-muted/25 p-3">
            <label
              htmlFor="active"
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground"
            >
              <input
                id="active"
                type="checkbox"
                className={cn(
                  "size-4 rounded border-border text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
                checked={isActive}
                onChange={(event) =>
                  form.setValue("active", event.target.checked, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              Ativar promoção
            </label>
            <p className="text-xs text-muted-foreground">
              {isActive ? "Visível para visitantes." : "Oculta no site."}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Preview da campanha</p>
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
            <div className="relative aspect-[16/10] bg-muted/40">
              {hasValidPreview ? (
                // eslint-disable-next-line @next/next/no-img-element -- admin preview with blob/proxy URLs
                <img
                  src={previewSrc}
                  alt="Preview da promoção"
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={() => setPreviewErroredUrl(previewSrc)}
                  onLoad={() => {
                    if (localPreviewUrl && previewUrl) {
                      URL.revokeObjectURL(localPreviewUrl);
                      setLocalPreviewUrl(null);
                    }
                  }}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-muted-foreground">
                  <ImageIcon className="size-8 opacity-60" aria-hidden />
                  <p className="text-sm">
                    {previewErroredUrl === previewSrc
                      ? "Não foi possível carregar a imagem. Tente enviar novamente."
                      : "Envie uma imagem para visualizar"}
                  </p>
                </div>
              )}
            </div>
            <div className="space-y-1 border-t border-border/70 p-4">
              <p className="font-medium text-foreground">
                {titleValue.trim() || "Sem título"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {linkValue.trim() || "Sem link configurado"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border/70 pt-4">
        <Button type="submit" className="h-10 rounded-xl px-5" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Salvando...
            </>
          ) : mode === "create" ? (
            "Criar promoção"
          ) : (
            "Salvar alterações"
          )}
        </Button>
      </div>
    </form>
  );
}
