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
import { PackageDurationFields } from "@/components/admin/package-duration-fields";
import { PackageImageField } from "@/components/admin/package-image-field";
import { PackageIncludedItemsField } from "@/components/admin/package-included-items-field";
import { PackagePaymentFields } from "@/components/admin/package-payment-fields";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  isValidBlogImageUrl,
  normalizeBlogImageUrl,
} from "@/lib/blog/image-url";
import { normalizeSlug } from "@/lib/blog/utils";
import {
  PACKAGE_CATEGORIES,
  PACKAGE_CATEGORY_LABELS,
  PACKAGE_PRICE_SCOPE_LABELS,
  PACKAGE_PRICE_SCOPES,
  PACKAGE_TYPE_LABELS,
  PACKAGE_TYPES,
  PACKAGE_TYPES_WITH_CATEGORY,
  type PackageTypeValue,
} from "@/lib/package/constants";
import {
  PACKAGE_PAYMENT_METHOD_LABELS,
  PACKAGE_PAYMENT_METHODS,
  PACKAGE_SELLS_IN_INSTALLMENTS_KINDS,
  computeInstallmentTotal,
  suggestInstallmentAmount,
  type PackageInstallmentKindValue,
  type PackagePaymentMethodValue,
} from "@/lib/package/payment";
import {
  EMPTY_PACKAGE_FORM_VALUES,
  packageFormSchema,
  toPackageCardPreviewData,
  type PackageActivationMode,
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
import { CIRCUIT_START_DAY_OPTIONS } from "@/lib/package/circuit";
import { resolveStorageImageSrc } from "@/lib/storage/media-url";
import { cn } from "@/lib/utils";

type PackageFormProps = {
  mode: "create" | "edit";
  packageId?: string;
  initialValues?: PackageFormInput;
  includedItemSuggestions?: string[];
  onSuccess?: () => void;
};

export function PackageForm({
  mode,
  packageId,
  initialValues,
  includedItemSuggestions = [],
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

  const priceField = form.register("price", { valueAsNumber: true });
  const pixPriceField = form.register("pixPrice", {
    setValueAs: (value) => (value === "" || value == null ? null : Number(value)),
  });
  // Qual preço o pacote tem: à vista (pixPrice), parcelado (tipo de
  // parcelamento + price como total) ou os dois. Sem nenhum não salva.
  const [sellsInstallments, setSellsInstallments] = useState(() =>
    PACKAGE_SELLS_IN_INSTALLMENTS_KINDS.includes(values.installmentKind),
  );
  const [sellsCash, setSellsCash] = useState(
    () => values.pixPrice != null || !sellsInstallments,
  );

  function toggleSellsCash() {
    if (sellsCash && !sellsInstallments) return;
    if (sellsCash) {
      form.setValue("pixPrice", null, { shouldDirty: true, shouldValidate: true });
    }
    setSellsCash(!sellsCash);
  }

  function toggleSellsInstallments() {
    if (sellsInstallments && !sellsCash) return;

    if (sellsInstallments) {
      form.setValue("installmentKind", "NONE", { shouldDirty: true });
      form.setValue("installmentAmount", null, { shouldDirty: true });
      form.setValue("downPaymentAmount", null, { shouldDirty: true });
      form.setValue("installmentText", "", { shouldDirty: true });
      form.setValue("highlightInstallments", false, { shouldDirty: true });
      form.setValue("price", form.getValues("pixPrice") ?? 0, { shouldDirty: true });
    } else {
      const count = form.getValues("installmentCount") ?? 12;
      form.setValue("installmentKind", "INSTALLMENTS", { shouldDirty: true });
      form.setValue("installmentCount", count, { shouldDirty: true });
      form.setValue(
        "installmentAmount",
        suggestInstallmentAmount(form.getValues("price"), count),
        { shouldDirty: true },
      );
    }

    setSellsInstallments(!sellsInstallments);
  }

  /** Preço novo, parcela nova: quem parcela não precisa refazer a conta na mão. */
  function recalculateInstallmentAmount(nextPrice: number) {
    const kind = form.getValues("installmentKind");

    if (kind !== "INSTALLMENTS" && kind !== "DOWN_PAYMENT") {
      return;
    }

    const suggested = suggestInstallmentAmount(
      nextPrice,
      form.getValues("installmentCount"),
      kind === "DOWN_PAYMENT" ? form.getValues("downPaymentAmount") : null,
    );

    if (suggested != null) {
      form.setValue("installmentAmount", suggested, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }
  const fullDescriptionValue = useWatch({ control: form.control, name: "fullDescription" }) ?? "";
  const typeValue = (watchedValues.type ??
    "PACKAGE_COMPLETE") as PackageTypeValue;
  const imageValue = watchedValues.image ?? "";
  const showCategory = PACKAGE_TYPES_WITH_CATEGORY.has(typeValue);
  const isCircuit = typeValue === "CIRCUIT";
  // Passagem muda toda hora: formulário enxuto, sem descrição, itens,
  // slug (gerado no envio) nem "preço referente a" (sempre por pessoa).
  const isFlight = typeValue === "FLIGHT";
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

    if (typeValue === "CIRCUIT") {
      form.setValue("airline", "", { shouldDirty: true, shouldValidate: true });
    } else {
      form.setValue("circuitStartDay", "", { shouldDirty: true, shouldValidate: true });
      form.setValue("circuitDuration", "", { shouldDirty: true, shouldValidate: true });
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
    if (sellsCash && input.pixPrice == null) {
      form.setError("pixPrice", { message: "Informe o preço à vista." });
      form.setFocus("pixPrice");
      return;
    }

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

  function fillFlightDefaults() {
    if (!isFlight) return;

    form.setValue("priceScope", "PER_PERSON", { shouldDirty: true });

    if (!form.getValues("slug").trim()) {
      const { departureCity, destination, departureDate } = form.getValues();
      // Sem página própria de pacote, o slug é só identificador: sufixo evita colisão.
      const suffix = Date.now().toString(36).slice(-4);
      form.setValue(
        "slug",
        normalizeSlug(`passagem ${departureCity} ${destination} ${departureDate} ${suffix}`),
        { shouldDirty: true },
      );
    }
  }

  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        fillFlightDefaults();
        void form.handleSubmit(onSubmit)(event);
      }}
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
              <Select
                id="type"
                value={typeValue}
                onChange={(next) =>
                  form.setValue("type", next as PackageTypeValue, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                options={PACKAGE_TYPES.map((type) => ({
                  value: type,
                  label: PACKAGE_TYPE_LABELS[type],
                }))}
              />
            </div>

            {showCategory ? (
              <div className="space-y-1.5">
                <label
                  htmlFor="category"
                  className="text-sm font-medium text-foreground"
                >
                  Categoria
                </label>
                <Select
                  id="category"
                  value={watchedValues.category ?? ""}
                  onChange={(next) =>
                    form.setValue(
                      "category",
                      next as (typeof PACKAGE_CATEGORIES)[number],
                      { shouldDirty: true, shouldValidate: true },
                    )
                  }
                  options={PACKAGE_CATEGORIES.map((category) => ({
                    value: category,
                    label: PACKAGE_CATEGORY_LABELS[category],
                  }))}
                />
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
                  {isCircuit ? "Título" : "Destino"}
                </label>
                <Input
                  id="destination"
                  className="h-10 rounded-xl"
                  placeholder={isCircuit ? "Roma Antiga" : "Ex.: Rio de Janeiro - RJ"}
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

            {isFlight ? null : (
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
            )}
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
                <Select
                  id="departureCityPreset"
                  value={departurePreset}
                  onChange={(next) =>
                    handleDeparturePresetChange(next as DepartureCityPresetId)
                  }
                  options={[
                    { value: "SAO_PAULO", label: PACKAGE_DEPARTURE_CITY_PRESETS.SAO_PAULO },
                    { value: "PORTO_ALEGRE", label: PACKAGE_DEPARTURE_CITY_PRESETS.PORTO_ALEGRE },
                    { value: "OTHER", label: "Outro" },
                  ]}
                />
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

          {isCircuit ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label
                  htmlFor="circuitStartDay"
                  className="text-sm font-medium text-foreground"
                >
                  Dia de início{" "}
                  <span className="text-muted-foreground">(opcional)</span>
                </label>
                <Select
                  id="circuitStartDay"
                  value={watchedValues.circuitStartDay ?? ""}
                  onChange={(next) =>
                    form.setValue("circuitStartDay", next, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                  options={[
                    { value: "", label: "Selecione" },
                    ...CIRCUIT_START_DAY_OPTIONS.map((day) => ({ value: day, label: day })),
                  ]}
                />
                {form.formState.errors.circuitStartDay ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.circuitStartDay.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="circuitDuration"
                  className="text-sm font-medium text-foreground"
                >
                  Duração{" "}
                  <span className="text-muted-foreground">(opcional)</span>
                </label>
                <Input
                  id="circuitDuration"
                  className="h-10 rounded-xl"
                  placeholder="Ex.: 7 dias"
                  {...form.register("circuitDuration")}
                />
                {form.formState.errors.circuitDuration ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.circuitDuration.message}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label
                htmlFor="departureDate"
                className="text-sm font-medium text-foreground"
              >
                {isCircuit ? "Data de início" : "Ida"}{" "}
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
                {isCircuit ? "Data de fim" : "Volta"}{" "}
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

          {isFlight ? null : (
          <>
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

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">
              Descrição completa{" "}
              <span className="text-muted-foreground">(opcional)</span>
            </label>
            <TiptapEditor
              value={fullDescriptionValue}
              onChange={(nextValue) =>
                form.setValue("fullDescription", nextValue, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              placeholder="Texto detalhado exibido no modal em /pacotes."
            />
            {form.formState.errors.fullDescription ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.fullDescription.message}
              </p>
            ) : null}
          </div>
          </>
          )}

          <div className="space-y-4 rounded-2xl border border-border/70 bg-muted/10 p-4">
            <div className="space-y-2">
              <p id="sells-label" className="text-sm font-medium text-foreground">
                Preço no card
              </p>
              <div role="group" aria-labelledby="sells-label" className="flex flex-wrap gap-2">
                {(
                  [
                    { key: "cash", label: "Preço à vista", pressed: sellsCash, toggle: toggleSellsCash },
                    { key: "installments", label: "Preço parcelado", pressed: sellsInstallments, toggle: toggleSellsInstallments },
                  ] as const
                ).map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    aria-pressed={option.pressed}
                    className={cn(
                      "inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors",
                      option.pressed
                        ? "border-brand bg-brand/10 text-foreground"
                        : "border-border/70 bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground",
                    )}
                    onClick={option.toggle}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Marque os dois pra mostrar os dois preços no card.
              </p>
            </div>

            {sellsCash ? (
              <div className="max-w-xs space-y-1.5">
                <label htmlFor="pixPrice" className="text-sm font-medium text-foreground">
                  Preço à vista via Pix (R$)
                </label>
                <Input
                  id="pixPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  className="h-10 rounded-xl"
                  {...pixPriceField}
                  onChange={(event) => {
                    void pixPriceField.onChange(event);
                    if (!sellsInstallments) {
                      form.setValue("price", Number(event.target.value) || 0, {
                        shouldDirty: true,
                      });
                    }
                  }}
                />
                {form.formState.errors.pixPrice ? (
                  <p className="text-xs text-destructive">
                    {form.formState.errors.pixPrice.message}
                  </p>
                ) : null}
              </div>
            ) : null}

            {sellsInstallments ? (
              <div className="space-y-4">
                <div className="max-w-xs space-y-1.5">
                  <label htmlFor="price" className="text-sm font-medium text-foreground">
                    Total parcelado (R$)
                  </label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    className="h-10 rounded-xl"
                    {...priceField}
                    onChange={(event) => {
                      void priceField.onChange(event);
                      recalculateInstallmentAmount(Number(event.target.value));
                    }}
                  />
                  {form.formState.errors.price ? (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.price.message}
                    </p>
                  ) : null}
                </div>

                <PackagePaymentFields
                  price={watchedValues.price ?? 0}
                  installmentKind={
                    (watchedValues.installmentKind ??
                      "INSTALLMENTS") as PackageInstallmentKindValue
                  }
                  installmentCount={watchedValues.installmentCount ?? null}
                  installmentAmount={watchedValues.installmentAmount ?? null}
                  downPaymentAmount={watchedValues.downPaymentAmount ?? null}
                  installmentText={watchedValues.installmentText ?? ""}
                  errors={{
                    installmentKind: form.formState.errors.installmentKind?.message,
                    installmentCount: form.formState.errors.installmentCount?.message,
                    installmentAmount:
                      form.formState.errors.installmentAmount?.message,
                    downPaymentAmount:
                      form.formState.errors.downPaymentAmount?.message,
                    installmentText: form.formState.errors.installmentText?.message,
                  }}
                  onChange={(patch) => {
                    for (const [field, value] of Object.entries(patch)) {
                      if (value === undefined) continue;
                      form.setValue(field as keyof PackageFormInput, value as never, {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                    }

                    // Parcela ou entrada mexida à mão: o total acompanha a conta.
                    const current = form.getValues();
                    const total = computeInstallmentTotal(current, current.price);
                    if (total != null && total !== current.price) {
                      form.setValue("price", total, { shouldDirty: true, shouldValidate: true });
                    }
                  }}
                />
              </div>
            ) : null}

            {sellsInstallments ? (
              <div className="space-y-1.5">
                <p id="highlight-label" className="text-sm font-medium text-foreground">
                  Em destaque no card
                </p>
                <div role="radiogroup" aria-labelledby="highlight-label" className="flex flex-wrap gap-2">
                  {(
                    [
                      { value: false, label: sellsCash ? "Preço à vista" : "Valor total" },
                      { value: true, label: sellsCash ? "Preço parcelado" : "Parcelas" },
                    ] as const
                  ).map((option) => {
                    const selected =
                      Boolean(watchedValues.highlightInstallments) === option.value;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        className={cn(
                          "inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors",
                          selected
                            ? "border-brand bg-brand/10 text-foreground"
                            : "border-border/70 bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground",
                        )}
                        onClick={() =>
                          form.setValue("highlightInstallments", option.value, {
                            shouldDirty: true,
                            shouldValidate: true,
                          })
                        }
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  O outro aparece menor, logo abaixo.
                </p>
              </div>
            ) : null}

            <div className="max-w-xs space-y-1.5">
              <label htmlFor="oldPrice" className="text-sm font-medium text-foreground">
                Preço anterior{" "}
                <span className="text-muted-foreground">(opcional, aparece riscado)</span>
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
          </div>

          {isFlight ? null : (
          <div className="space-y-1.5">
            <label
              htmlFor="priceScope"
              className="text-sm font-medium text-foreground"
            >
              Preço referente a *
            </label>
            <Select
              id="priceScope"
              value={watchedValues.priceScope ?? ""}
              placeholder="Selecione"
              invalid={Boolean(form.formState.errors.priceScope)}
              onChange={(next) =>
                form.setValue(
                  "priceScope",
                  next as (typeof PACKAGE_PRICE_SCOPES)[number],
                  { shouldDirty: true, shouldValidate: true },
                )
              }
              options={PACKAGE_PRICE_SCOPES.map((scope) => ({
                value: scope,
                label: PACKAGE_PRICE_SCOPE_LABELS[scope],
              }))}
            />
            {form.formState.errors.priceScope ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.priceScope.message}
              </p>
            ) : null}
          </div>
          )}

          <div className="space-y-2">
            <p id="footer-label" className="text-sm font-medium text-foreground">
              Rodapé do card{" "}
              <span className="font-normal text-muted-foreground">(opcional)</span>
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div role="group" aria-labelledby="footer-label" className="flex shrink-0 flex-wrap gap-2">
                {PACKAGE_PAYMENT_METHODS.map((method) => {
                  const methods = (watchedValues.paymentMethods ??
                    []) as PackagePaymentMethodValue[];
                  const pressed = methods.includes(method);
                  return (
                    <button
                      key={method}
                      type="button"
                      aria-pressed={pressed}
                      className={cn(
                        "inline-flex h-10 items-center justify-center rounded-xl border px-3 text-sm font-medium transition-colors",
                        pressed
                          ? "border-brand bg-brand/10 text-foreground"
                          : "border-border/70 bg-background text-muted-foreground hover:border-brand/40 hover:text-foreground",
                      )}
                      onClick={() =>
                        form.setValue(
                          "paymentMethods",
                          pressed
                            ? methods.filter((item) => item !== method)
                            : [...methods, method],
                          { shouldDirty: true, shouldValidate: true },
                        )
                      }
                    >
                      {PACKAGE_PAYMENT_METHOD_LABELS[method]}
                    </button>
                  );
                })}
              </div>
              <span aria-hidden className="hidden text-muted-foreground sm:inline">
                |
              </span>
              <Input
                id="feesText"
                aria-label="Texto livre do rodapé"
                className="h-10 min-w-0 flex-1 rounded-xl"
                placeholder="Ex.: Taxas inclusas"
                {...form.register("feesText")}
              />
            </div>
            {form.formState.errors.feesText ? (
              <p className="text-xs text-destructive">
                {form.formState.errors.feesText.message}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Marque as formas de pagamento e escreva o resto, se quiser (ex.:
                Taxas no local).
              </p>
            )}
          </div>

          {isFlight ? null : (
          <PackageIncludedItemsField
            value={watchedValues.includedItems ?? []}
            onChange={(items) =>
              form.setValue("includedItems", items, {
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            suggestions={includedItemSuggestions}
            error={form.formState.errors.includedItems?.message}
          />
          )}

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

          <div className="space-y-3">
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
            </div>

            <PackageDurationFields
              defineDuration={Boolean(watchedValues.defineDuration)}
              activationMode={
                (watchedValues.activationMode ?? "now") as PackageActivationMode
              }
              activatesAt={watchedValues.activatesAt ?? ""}
              deactivatesAt={watchedValues.deactivatesAt ?? ""}
              errors={{
                activatesAt: form.formState.errors.activatesAt,
                deactivatesAt: form.formState.errors.deactivatesAt,
              }}
              onDefineDurationChange={(value) => {
                form.setValue("defineDuration", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                });

                if (!value) {
                  form.setValue("activationMode", "now", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  form.setValue("activatesAt", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                  form.setValue("deactivatesAt", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
              onActivationModeChange={(value) => {
                form.setValue("activationMode", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                });

                if (value === "now") {
                  form.setValue("activatesAt", "", {
                    shouldDirty: true,
                    shouldValidate: true,
                  });
                }
              }}
              onActivatesAtChange={(value) =>
                form.setValue("activatesAt", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
              onDeactivatesAtChange={(value) =>
                form.setValue("deactivatesAt", value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-2 xl:self-start">
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
