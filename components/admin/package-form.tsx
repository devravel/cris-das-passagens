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
import { PackageIncludedItemsField } from "@/components/admin/package-included-items-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  isValidBlogImageUrl,
  normalizeBlogImageUrl,
} from "@/lib/blog/image-url";
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
  packageFormSchema,
  toPackageCardPreviewData,
  type PackageFormInput,
  type PackageFormValues,
} from "@/lib/package/schemas";
import {
  DEFAULT_PACKAGE_DEPARTURE_CITY,
  PACKAGE_DEPARTURE_CITY_PRESETS,
  departureCityFromPreset,
  packageTypeShowsDepartureCity,
  resolveDepartureCityPreset,
  type DepartureCityPresetId,
} from "@/lib/package/departure-city";
import { resolveStorageImageSrc } from "@/lib/storage/media-url";
import { cn } from "@/lib/utils";

const selectClassName =
  "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

type PackageFormProps = {
  mode: "create" | "edit";
  packageId?: string;
  initialValues?: PackageFormInput;
  onSuccess?: () => void;
};

export function PackageForm({
  mode,
  packageId,
  initialValues,
  onSuccess,
}: PackageFormProps) {
  const [isPending, startTransition] = useTransition();
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [previewErroredUrl, setPreviewErroredUrl] = useState<string | null>(
    null,
  );

  const values = useMemo(
    () => ({
      ...EMPTY_PACKAGE_FORM_VALUES,
      ...initialValues,
    }),
    [initialValues],
  );

  const form = useForm<PackageFormInput>({
    resolver: zodResolver(packageFormSchema),
    defaultValues: values,
    mode: "onBlur",
  });

  const watchedValues = useWatch({
    control: form.control,
  }) as Partial<PackageFormValues>;
  const typeValue = (watchedValues.type ??
    "PACKAGE_COMPLETE") as PackageTypeValue;
  const imageValue = watchedValues.image ?? "";
  const showCategory = PACKAGE_TYPES_WITH_CATEGORY.has(typeValue);
  const showAirlineFieldAfterDestination =
    typeValue === "FLIGHT" || typeValue === "PACKAGE_COMPLETE";
  const showHotelField = typeValue === "HOTEL";
  const showDepartureCityField = packageTypeShowsDepartureCity(typeValue);
  const departureCityValue =
    watchedValues.departureCity ?? DEFAULT_PACKAGE_DEPARTURE_CITY;
  const departurePreset = resolveDepartureCityPreset(departureCityValue);

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
      } as PackageFormInput),
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

    if (showAirlineFieldAfterDestination) {
      form.setValue("hotelName", "", { shouldDirty: true, shouldValidate: true });
    } else if (showHotelField) {
      form.setValue("airline", "", { shouldDirty: true, shouldValidate: true });
    } else {
      form.setValue("airline", "", { shouldDirty: true, shouldValidate: true });
      if (typeValue === "TICKET") {
        form.setValue("hotelName", "", { shouldDirty: true, shouldValidate: true });
      }
    }

    if (!PACKAGE_TYPES_WITH_CATEGORY.has(typeValue)) {
      form.setValue("category", null, { shouldDirty: true });
    } else if (!form.getValues("category")) {
      form.setValue("category", "NATIONAL", { shouldDirty: true });
    }

    if (!packageTypeShowsDepartureCity(typeValue)) {
      form.setValue("departureCity", "", { shouldDirty: true, shouldValidate: true });
    } else if (!form.getValues("departureCity")?.trim()) {
      form.setValue("departureCity", DEFAULT_PACKAGE_DEPARTURE_CITY, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [form, showAirlineFieldAfterDestination, showHotelField, typeValue]);

  function handleDeparturePresetChange(preset: DepartureCityPresetId) {
    if (preset === "OTHER") {
      form.setValue("departureCity", "", { shouldDirty: true, shouldValidate: true });
      return;
    }

    form.setValue("departureCity", departureCityFromPreset(preset), {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function handleAutoSlug() {
    const destination = form.getValues("destination");
    const slug = normalizeSlug(destination);
    form.setValue("slug", slug, { shouldDirty: true, shouldValidate: true });
  }

  function onSubmit(input: PackageFormInput) {
    const parsed = packageFormSchema.safeParse(input);

    if (!parsed.success) {
      return;
    }

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createPackageAction(parsed.data)
          : await updatePackageAction(packageId ?? "", parsed.data);

      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [field, errors] of Object.entries(result.fieldErrors)) {
            const firstError = errors?.[0];
            if (!firstError) continue;
            form.setError(field as keyof PackageFormInput, {
              message: firstError,
            });
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
    <form
      className="space-y-5"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="type"
                className="text-sm font-medium text-foreground"
              >
                Tipo
              </label>
              <select
                id="type"
                className={selectClassName}
                value={typeValue}
                onChange={(event) =>
                  form.setValue(
                    "type",
                    event.target.value as PackageTypeValue,
                    {
                      shouldDirty: true,
                      shouldValidate: true,
                    },
                  )
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
                <label
                  htmlFor="category"
                  className="text-sm font-medium text-foreground"
                >
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

          {showHotelField ? (
            <div className="space-y-1.5">
              <label
                htmlFor="hotelName"
                className="text-sm font-medium text-foreground"
              >
                Hotel
              </label>
              <Input
                id="hotelName"
                className="h-10 rounded-xl"
                placeholder="Ex.: Disney's All-Star Movies"
                {...form.register("hotelName")}
              />
              {form.formState.errors.hotelName ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.hotelName.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="destination"
                  className="text-sm font-medium text-foreground"
                >
                  Destino
                </label>
                <Input
                  id="destination"
                  className="h-10 rounded-xl"
                  placeholder="Ex.: Rio de Janeiro - RJ"
                  {...form.register("destination")}
                />
                {form.formState.errors.destination ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.destination.message}
                  </p>
                ) : null}
              </div>

              {showAirlineFieldAfterDestination ? (
                <div className="space-y-1.5">
                  <label
                    htmlFor="airline"
                    className="text-sm font-medium text-foreground"
                  >
                    Companhia aérea{" "}
                    <span className="text-muted-foreground">(opcional)</span>
                  </label>
                  <Input
                    id="airline"
                    className="h-10 rounded-xl"
                    placeholder="Ex.: Azul, Gol, LATAM, TAP, Emirates"
                    {...form.register("airline")}
                  />
                  {form.formState.errors.airline ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.airline.message}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="slug"
                className="text-sm font-medium text-foreground"
              >
                Slug
              </label>
              <div className="flex gap-2">
                <Input
                  id="slug"
                  className="h-10 rounded-xl"
                  placeholder="rio-de-janeiro"
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
                <p className="text-xs text-destructive">
                  {form.formState.errors.slug.message}
                </p>
              ) : null}
            </div>
          </div>

          {showDepartureCityField ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="departureCityPreset"
                  className="text-sm font-medium text-foreground"
                >
                  Saindo de
                </label>
                <select
                  id="departureCityPreset"
                  className={selectClassName}
                  value={departurePreset}
                  onChange={(event) =>
                    handleDeparturePresetChange(
                      event.target.value as DepartureCityPresetId,
                    )
                  }
                >
                  <option value="SAO_PAULO">
                    {PACKAGE_DEPARTURE_CITY_PRESETS.SAO_PAULO}
                  </option>
                  <option value="PORTO_ALEGRE">
                    {PACKAGE_DEPARTURE_CITY_PRESETS.PORTO_ALEGRE}
                  </option>
                  <option value="OTHER">Outro</option>
                </select>
              </div>

              {departurePreset === "OTHER" ? (
                <div className="space-y-1.5">
                  <label
                    htmlFor="departureCity"
                    className="text-sm font-medium text-foreground"
                  >
                    Cidade, Estado
                  </label>
                  <Input
                    id="departureCity"
                    className="h-10 rounded-xl"
                    placeholder="Ex.: Curitiba, PR"
                    {...form.register("departureCity")}
                  />
                </div>
              ) : null}

              {form.formState.errors.departureCity ? (
                <p className="text-xs text-destructive sm:col-span-2">
                  {form.formState.errors.departureCity.message}
                </p>
              ) : null}
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="departureDate"
                className="text-sm font-medium text-foreground"
              >
                Ida{" "}
                <span className="text-muted-foreground">(opcional)</span>
              </label>
              <Input
                id="departureDate"
                type="date"
                className="h-10 rounded-xl"
                {...form.register("departureDate")}
              />
              {form.formState.errors.departureDate ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.departureDate.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="returnDate"
                className="text-sm font-medium text-foreground"
              >
                Volta{" "}
                <span className="text-muted-foreground">(opcional)</span>
              </label>
              <Input
                id="returnDate"
                type="date"
                className="h-10 rounded-xl"
                {...form.register("returnDate")}
              />
              {form.formState.errors.returnDate ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.returnDate.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="shortDescription"
              className="text-sm font-medium text-foreground"
            >
              Descrição curta{" "}
              <span className="text-muted-foreground">(opcional)</span>
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

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label
                htmlFor="price"
                className="text-sm font-medium text-foreground"
              >
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
                <p className="text-xs text-destructive">
                  {form.formState.errors.price.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="oldPrice"
                className="text-sm font-medium text-foreground"
              >
                Preço anterior{" "}
                <span className="text-muted-foreground">(opcional)</span>
              </label>
              <Input
                id="oldPrice"
                type="number"
                min="0"
                step="0.01"
                className="h-10 rounded-xl"
                {...form.register("oldPrice", {
                  setValueAs: (value) =>
                    value === "" || value == null ? null : Number(value),
                })}
              />
              {form.formState.errors.oldPrice ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.oldPrice.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5 sm:col-span-1">
              <label
                htmlFor="installmentText"
                className="text-sm font-medium text-foreground"
              >
                Parcelamento
              </label>
              <Input
                id="installmentText"
                className="h-10 rounded-xl"
                placeholder="Ex.: 12x R$ 129"
                {...form.register("installmentText")}
              />
              {form.formState.errors.installmentText ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.installmentText.message}
                </p>
              ) : null}
            </div>
          </div>

          <label
            htmlFor="highlightInstallments"
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border/70 bg-muted/20 px-3 py-2.5 text-sm font-medium text-foreground"
          >
            <input
              id="highlightInstallments"
              type="checkbox"
              className="size-4 rounded border-border text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              checked={Boolean(watchedValues.highlightInstallments)}
              onChange={(event) =>
                form.setValue("highlightInstallments", event.target.checked, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
            Destacar parcelamento
          </label>

          <PackageIncludedItemsField
            value={watchedValues.includedItems ?? []}
            onChange={(items) =>
              form.setValue("includedItems", items, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            error={form.formState.errors.includedItems?.message}
          />

          <div className="space-y-1.5">
            <label
              htmlFor="image"
              className="text-sm font-medium text-foreground"
            >
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
            <p className="w-full text-xs text-muted-foreground">
              Todos os pacotes ativos em destaque aparecem no carrossel da homepage (deslize ou use as setas).
            </p>
            <label
              htmlFor="showOnLandingPage"
              className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground"
            >
              <input
                id="showOnLandingPage"
                type="checkbox"
                className={cn(
                  "size-4 rounded border-border text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                )}
                checked={Boolean(watchedValues.showOnLandingPage)}
                onChange={(event) =>
                  form.setValue("showOnLandingPage", event.target.checked, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              />
              Exibir na landing page
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
            departureCity={
              showDepartureCityField
                ? departureCityValue.trim() || DEFAULT_PACKAGE_DEPARTURE_CITY
                : DEFAULT_PACKAGE_DEPARTURE_CITY
            }
            imageSrc={hasValidPreview ? previewSrc : undefined}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border/70 pt-4">
        <Button
          type="submit"
          className="h-10 rounded-xl px-5"
          disabled={isPending}
        >
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
