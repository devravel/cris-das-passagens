"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Wand2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import {
  createPackageAction,
  updatePackageAction,
} from "@/app/admin/(protected)/packages/actions";
import { PackageCardPreview } from "@/components/admin/package-card-preview";
import { PackageImageField } from "@/components/admin/package-image-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { isValidBlogImageUrl, normalizeBlogImageUrl } from "@/lib/blog/image-url";
import { normalizeSlug } from "@/lib/blog/utils";
import {
  PACKAGE_CATEGORIES,
  PACKAGE_CATEGORY_LABELS,
  PACKAGE_TYPE_LABELS,
  PACKAGE_TYPES,
  PACKAGE_TYPES_WITH_CATEGORY,
  type PackageTypeValue,
} from "@/lib/package/constants";
import {
  EMPTY_PACKAGE_FORM_VALUES,
  getDefaultIncludesForType,
  packageFormSchema,
  toPackageCardPreviewData,
  type PackageFormValues,
} from "@/lib/package/schemas";
import { resolveStorageImageSrc } from "@/lib/storage/media-url";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type PackageFormProps = {
  mode: "create" | "edit";
  packageId?: string;
  initialValues?: PackageFormValues;
  onSuccess?: () => void;
};

export function PackageForm({ mode, packageId, initialValues, onSuccess }: PackageFormProps) {
  const [isPending, startTransition] = useTransition();
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [previewErroredUrl, setPreviewErroredUrl] = useState<string | null>(null);

  const values = useMemo(
    () => ({
      ...EMPTY_PACKAGE_FORM_VALUES,
      ...initialValues,
    }),
    [initialValues],
  );

  const form = useForm<PackageFormValues>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: values,
    mode: "onBlur",
  });

  const watchedValues = useWatch({ control: form.control }) as Partial<PackageFormValues>;
  const typeValue = (watchedValues.type ?? "PACKAGE_COMPLETE") as PackageTypeValue;
  const imageValue = watchedValues.image ?? "";
  const showCategory = PACKAGE_TYPES_WITH_CATEGORY.has(typeValue);

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

  const cardPreviewData = useMemo(
    () =>
      toPackageCardPreviewData({
        ...EMPTY_PACKAGE_FORM_VALUES,
        ...watchedValues,
        type: typeValue,
      } as PackageFormValues),
    [watchedValues, typeValue],
  );

  const previousTypeRef = useRef<PackageTypeValue | null>(null);

  useEffect(() => {
    if (previousTypeRef.current === null) {
      previousTypeRef.current = typeValue;
      return;
    }

    if (previousTypeRef.current === typeValue) {
      return;
    }

    previousTypeRef.current = typeValue;

    const defaults = getDefaultIncludesForType(typeValue);
    form.setValue("includesFlight", defaults.includesFlight, { shouldDirty: true });
    form.setValue("includesHotel", defaults.includesHotel, { shouldDirty: true });
    form.setValue("includesTickets", defaults.includesTickets, { shouldDirty: true });
    form.setValue("includesCruise", defaults.includesCruise, { shouldDirty: true });

    if (!PACKAGE_TYPES_WITH_CATEGORY.has(typeValue)) {
      form.setValue("category", null, { shouldDirty: true });
    } else if (!form.getValues("category")) {
      form.setValue("category", "NATIONAL", { shouldDirty: true });
    }
  }, [form, typeValue]);

  function handleAutoSlug() {
    const title = form.getValues("title");
    const slug = normalizeSlug(title);
    form.setValue("slug", slug, { shouldDirty: true, shouldValidate: true });
  }

  function onSubmit(input: PackageFormValues) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createPackageAction(input)
          : await updatePackageAction(packageId ?? "", input);

      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [field, errors] of Object.entries(result.fieldErrors)) {
            const firstError = errors?.[0];
            if (!firstError) continue;
            form.setError(field as keyof PackageFormValues, { message: firstError });
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
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="title" className="text-sm font-medium text-foreground">
                Título
              </label>
              <Input
                id="title"
                className="h-10 rounded-xl"
                placeholder="Ex.: Orlando completo — 7 noites"
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
              <div className="flex gap-2">
                <Input
                  id="slug"
                  className="h-10 rounded-xl"
                  placeholder="orlando-completo-7-noites"
                  {...form.register("slug")}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 shrink-0 rounded-xl"
                  onClick={handleAutoSlug}
                >
                  <Wand2 className="size-4" aria-hidden />
                  Gerar
                </Button>
              </div>
              {form.formState.errors.slug ? (
                <p className="text-xs text-destructive">{form.formState.errors.slug.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="destination" className="text-sm font-medium text-foreground">
                Destino
              </label>
              <Input
                id="destination"
                className="h-10 rounded-xl"
                placeholder="Ex.: Orlando, EUA"
                {...form.register("destination")}
              />
              {form.formState.errors.destination ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.destination.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="shortDescription" className="text-sm font-medium text-foreground">
              Descrição curta
            </label>
            <Textarea
              id="shortDescription"
              className="min-h-24 rounded-xl"
              placeholder="Resumo premium exibido no card do pacote."
              {...form.register("shortDescription")}
            />
            {form.formState.errors.shortDescription ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.shortDescription.message}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="type" className="text-sm font-medium text-foreground">
                Tipo
              </label>
              <select
                id="type"
                className={selectClassName}
                value={typeValue}
                onChange={(event) =>
                  form.setValue("type", event.target.value as PackageTypeValue, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                {PACKAGE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {PACKAGE_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>

            {showCategory ? (
              <div className="space-y-1.5">
                <label htmlFor="category" className="text-sm font-medium text-foreground">
                  Categoria
                </label>
                <select
                  id="category"
                  className={selectClassName}
                  value={watchedValues.category ?? ""}
                  onChange={(event) =>
                    form.setValue(
                      "category",
                      event.target.value as (typeof PACKAGE_CATEGORIES)[number],
                      { shouldDirty: true, shouldValidate: true },
                    )
                  }
                >
                  {PACKAGE_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {PACKAGE_CATEGORY_LABELS[category]}
                    </option>
                  ))}
                </select>
                {form.formState.errors.category ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.category.message}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label htmlFor="price" className="text-sm font-medium text-foreground">
                Preço
              </label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                className="h-10 rounded-xl"
                {...form.register("price", { valueAsNumber: true })}
              />
              {form.formState.errors.price ? (
                <p className="text-xs text-destructive">{form.formState.errors.price.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="oldPrice" className="text-sm font-medium text-foreground">
                Preço anterior <span className="text-muted-foreground">(opcional)</span>
              </label>
              <Input
                id="oldPrice"
                type="number"
                min="0"
                step="0.01"
                className="h-10 rounded-xl"
                {...form.register("oldPrice", {
                  setValueAs: (value) => (value === "" || value == null ? null : Number(value)),
                })}
              />
              {form.formState.errors.oldPrice ? (
                <p className="text-xs text-destructive">{form.formState.errors.oldPrice.message}</p>
              ) : null}
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <label htmlFor="installmentText" className="text-sm font-medium text-foreground">
                Parcelamento
              </label>
              <Input
                id="installmentText"
                className="h-10 rounded-xl"
                placeholder="Ex.: 10x sem juros"
                {...form.register("installmentText")}
              />
            </div>
          </div>

          {(typeValue === "FLIGHT" || typeValue === "PACKAGE_COMPLETE") && (
            <div className="space-y-1.5">
              <label htmlFor="airline" className="text-sm font-medium text-foreground">
                Companhia aérea
              </label>
              <Input
                id="airline"
                className="h-10 rounded-xl"
                placeholder="Ex.: LATAM"
                {...form.register("airline")}
              />
              {form.formState.errors.airline ? (
                <p className="text-xs text-destructive">{form.formState.errors.airline.message}</p>
              ) : null}
            </div>
          )}

          {(typeValue === "HOTEL" ||
            typeValue === "CRUISE" ||
            (typeValue === "PACKAGE_COMPLETE" && watchedValues.includesHotel)) && (
            <div className="space-y-1.5">
              <label htmlFor="hotelName" className="text-sm font-medium text-foreground">
                {typeValue === "CRUISE" ? "Navio / cruzeiro" : "Hotel"}
              </label>
              <Input
                id="hotelName"
                className="h-10 rounded-xl"
                placeholder={
                  typeValue === "CRUISE" ? "Ex.: MSC Seaview" : "Ex.: Disney's All-Star Movies"
                }
                {...form.register("hotelName")}
              />
              {form.formState.errors.hotelName ? (
                <p className="text-xs text-destructive">{form.formState.errors.hotelName.message}</p>
              ) : null}
            </div>
          )}

          {typeValue === "PACKAGE_COMPLETE" ? (
            <fieldset className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3">
              <legend className="px-1 text-sm font-medium text-foreground">Itens inclusos</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ["includesFlight", "Voo"],
                    ["includesHotel", "Hotel"],
                    ["includesTickets", "Ingressos"],
                    ["includesCruise", "Cruzeiro"],
                  ] as const
                ).map(([field, label]) => (
                  <label
                    key={field}
                    htmlFor={field}
                    className="inline-flex cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      id={field}
                      type="checkbox"
                      className="size-4 rounded border-border text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      checked={Boolean(watchedValues[field])}
                      onChange={(event) =>
                        form.setValue(field, event.target.checked, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
              {form.formState.errors.includesFlight ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.includesFlight.message}
                </p>
              ) : null}
            </fieldset>
          ) : null}

          <div className="space-y-1.5">
            <label htmlFor="image" className="text-sm font-medium text-foreground">
              Imagem do pacote
            </label>
            <PackageImageField
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

          <div className="flex flex-wrap gap-4 rounded-xl border border-border/70 bg-muted/25 p-3">
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
                checked={Boolean(watchedValues.active)}
                onChange={(event) =>
                  form.setValue("active", event.target.checked, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              Pacote ativo
            </label>

            <label
              htmlFor="featured"
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground"
            >
              <input
                id="featured"
                type="checkbox"
                className={cn(
                  "size-4 rounded border-border text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
                checked={Boolean(watchedValues.featured)}
                onChange={(event) =>
                  form.setValue("featured", event.target.checked, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              Destaque
            </label>
          </div>
        </div>

        <div className="space-y-2 xl:sticky xl:top-6 xl:self-start">
          <p className="text-sm font-medium text-foreground">Preview do card</p>
          <p className="text-xs text-muted-foreground">
            Visualização automática do card padronizado antes de salvar.
          </p>
          <PackageCardPreview
            data={cardPreviewData}
            imageSrc={hasValidPreview ? previewSrc : undefined}
          />
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
            "Criar pacote"
          ) : (
            "Salvar alterações"
          )}
        </Button>
      </div>
    </form>
  );
}
