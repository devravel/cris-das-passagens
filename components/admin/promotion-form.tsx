"use client";

import Image from "next/image";
import { useMemo, useRef, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { ExternalLink, ImageIcon, Loader2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import {
  createPromotionAction,
  updatePromotionAction,
  uploadPromotionImageAction,
} from "@/app/admin/(protected)/promotions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  async function handleUploadImage(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    setIsUploading(true);
    const result = await uploadPromotionImageAction(formData);
    setIsUploading(false);

    if (!result.ok || !result.data) {
      toast.error(result.message);
      return;
    }

    form.setValue("image", result.data.imageUrl, {
      shouldDirty: true,
      shouldValidate: true,
    });
    toast.success("Imagem enviada com sucesso.");
  }

  function handleSelectImage() {
    fileInputRef.current?.click();
  }

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
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          void handleUploadImage(file);
          event.currentTarget.value = "";
        }}
      />

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
              URL da imagem
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="image"
                className="h-10 rounded-xl"
                placeholder="https://..."
                {...form.register("image")}
              />
              <Button
                type="button"
                variant="outline"
                className="h-10 shrink-0 rounded-xl border-border/70 px-3"
                onClick={handleSelectImage}
                disabled={isUploading}
                aria-label="Enviar imagem"
              >
                {isUploading ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <UploadCloud className="size-4" aria-hidden />
                )}
              </Button>
            </div>
            {form.formState.errors.image ? (
              <p className="text-xs text-destructive">{form.formState.errors.image.message}</p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Envie JPG, PNG, WEBP ou AVIF com ate 5MB.
            </p>
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
              {imageValue ? (
                <Image
                  src={imageValue}
                  alt="Preview da promoção"
                  fill
                  sizes="(max-width: 1024px) 100vw, 480px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <ImageIcon className="size-8 opacity-60" aria-hidden />
                  <p className="text-sm">Envie uma imagem para visualizar</p>
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
            "Criar promoção"
          ) : (
            "Salvar alterações"
          )}
        </Button>
      </div>
    </form>
  );
}
