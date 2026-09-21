"use client";

import { memo, useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch, type Control, type Path, type PathValue, type UseFormSetValue } from "react-hook-form";
import { Check, Eye, ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  createItineraryAction,
  createItineraryCategoryAction,
  updateItineraryAction,
  uploadItineraryImageAction,
  type ItineraryCategoryItem,
} from "@/app/admin/(protected)/roteiros/actions";
import { BlogCoverField } from "@/components/admin/blog-cover-field";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { ItineraryDetail } from "@/components/itineraries/itinerary-detail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { normalizeSlug } from "@/lib/blog/utils";
import { FEATURED_HOME_ITINERARIES_LIMIT } from "@/lib/itinerary/constants";
import { toGoogleMapsEmbedUrl, toYouTubeEmbedUrl } from "@/lib/itinerary/embeds";
import {
  CUSTOM_ITEM_MAX_LENGTH,
  INCLUDED_ITEM_OPTIONS,
  customIncludedItemLabel,
  isCustomIncludedItem,
  makeCustomIncludedItem,
} from "@/lib/itinerary/included-items";
import {
  hotelPriceLabels,
  itinerarySchema,
  itineraryTabs,
  type HotelPriceKey,
  type ItineraryHotel,
  type ItineraryInput,
  type ItineraryTabKey,
} from "@/lib/itinerary/schemas";
import { resolvePublicImageSrc } from "@/lib/storage/image-src";
import { cn } from "@/lib/utils";

type ItineraryFormProps = {
  mode: "create" | "edit";
  itineraryId?: string;
  initialValues?: Partial<ItineraryInput>;
  categories: ItineraryCategoryItem[];
  onSuccess?: () => void;
};

const EMPTY_HOTEL: ItineraryHotel = {
  name: "",
  image: "",
  type: "",
  accommodation: "",
  board: "",
  website: "",
  prices: {},
  description: "",
};

const EMPTY_VALUES: ItineraryInput = {
  title: "",
  seller: "",
  slug: "",
  coverImage: "",
  gallery: [],
  duration: "",
  priceFrom: "",
  description: "",
  includedItems: [],
  videoUrl: "",
  mapUrl: "",
  categoryIds: [],
  itinerary: "",
  optionals: "",
  included: "",
  notIncluded: "",
  payment: "",
  departures: "",
  insurance: "",
  notes: "",
  hotels: [],
  published: false,
  featuredOnHomepage: false,
};

const tabHints: Record<(typeof itineraryTabs)[number][0], string> = {
  itinerary: "Dia a dia da viagem. Cole o texto pronto e formate como no blog (negrito, listas, subtítulos).",
  optionals: "Passeios e serviços à parte (ex.: ingresso, city tour, seguro).",
  included: "O que está no valor: transporte, diárias, guia, brindes...",
  notIncluded: "O que fica de fora (ex.: ingressos, refeições não citadas).",
  payment: "Condições: parcelas, desconto à vista, consulte 10x...",
  departures: "Datas ou períodos de saída, uma por linha.",
  insurance: "Ex.: Contrate seguro viagem. Consulte nossa equipe.",
  notes: "Ex.: Valores por pessoa em apto duplo e sujeitos a disponibilidade.",
};

const TAB_KEYS = itineraryTabs.map(([key]) => key) as [ItineraryTabKey, ...ItineraryTabKey[]];

const labelClassName = "text-sm font-medium text-foreground";
const errorClassName = "text-xs text-destructive";
const blockClassName = "space-y-4 rounded-2xl border border-border/70 bg-card/80 p-4 sm:p-5";

function FieldError({ message }: { message?: string }) {
  return message ? <p className={errorClassName}>{message}</p> : null;
}

function BlockTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="space-y-0.5">
      <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ItineraryForm({
  mode,
  itineraryId,
  initialValues,
  categories: initialCategories,
  onSuccess,
}: ItineraryFormProps) {
  const [isPending, startTransition] = useTransition();
  const [categories, setCategories] = useState(initialCategories);
  const [newCategory, setNewCategory] = useState("");
  const [isCreatingCategory, startCategoryTransition] = useTransition();

  const values = useMemo(() => ({ ...EMPTY_VALUES, ...initialValues }), [initialValues]);

  const form = useForm<ItineraryInput>({
    resolver: zodResolver(itinerarySchema),
    defaultValues: values,
    mode: "onBlur",
  });

  const hotelsArray = useFieldArray({ control: form.control, name: "hotels" });
  const { control } = form;

  // Watches por campo (não o formulário inteiro): digitar no título não re-renderiza os 9 editores.
  const coverImage = useWatch({ control, name: "coverImage" }) ?? "";
  const gallery = useWatch({ control, name: "gallery" }) ?? [];
  const categoryIds = useWatch({ control, name: "categoryIds" }) ?? [];
  const includedItems = useWatch({ control, name: "includedItems" }) ?? [];
  const videoUrl = useWatch({ control, name: "videoUrl" });
  const mapUrl = useWatch({ control, name: "mapUrl" });
  const isPublished = useWatch({ control, name: "published" }) ?? false;
  const isFeatured = useWatch({ control, name: "featuredOnHomepage" }) ?? false;

  // Handlers estáveis pros editores (memoizados): só o editor tocado re-renderiza de verdade.
  const tabHandlers = useMemo(
    () =>
      Object.fromEntries(
        TAB_KEYS.map((key) => [
          key,
          (next: string) => form.setValue(key, next, { shouldDirty: true }),
        ]),
      ) as Record<ItineraryTabKey, (next: string) => void>,
    [form],
  );

  function setField<K extends Path<ItineraryInput>>(name: K, value: PathValue<ItineraryInput, K>) {
    form.setValue(name, value, { shouldDirty: true, shouldValidate: true });
  }

  function handleAutoSlug() {
    setField("slug", normalizeSlug(form.getValues("title")));
  }

  function toggleCategory(id: string) {
    const current = form.getValues("categoryIds");
    setField(
      "categoryIds",
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  }

  const [newIncludedItem, setNewIncludedItem] = useState("");

  function handleAddIncludedItem() {
    const label = newIncludedItem.trim();
    if (!label) return;

    const value = makeCustomIncludedItem(label);
    const current = form.getValues("includedItems");
    if (!current.includes(value)) setField("includedItems", [...current, value]);
    setNewIncludedItem("");
  }

  function handleAddCategory() {
    const name = newCategory.trim();
    if (!name) return;

    startCategoryTransition(async () => {
      const result = await createItineraryCategoryAction(name);

      if (!result.ok || !result.data) {
        toast.error(result.message);
        return;
      }

      const created = result.data;
      setCategories((list) => [...list, created]);
      setField("categoryIds", [...form.getValues("categoryIds"), created.id]);
      setNewCategory("");
      toast.success(result.message);
    });
  }

  function onSubmit(input: ItineraryInput) {
    startTransition(async () => {
      const result =
        mode === "create"
          ? await createItineraryAction(input)
          : await updateItineraryAction(itineraryId ?? "", input);

      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [field, errors] of Object.entries(result.fieldErrors)) {
            const firstError = errors?.[0];
            if (!firstError) continue;
            form.setError(field as keyof ItineraryInput, { message: firstError });
          }
        }

        toast.error(result.message);
        return;
      }

      toast.success(result.message);
      onSuccess?.();
    });
  }

  const errors = form.formState.errors;

  return (
    <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      {/* 1. Identificação */}
      <section className={blockClassName}>
        <BlockTitle title="Roteiro" hint="Título, duração e o preço que aparece no topo da página." />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="title" className={labelClassName}>
              Título *
            </label>
            <Input id="title" className="h-10 rounded-xl" placeholder="Ex.: Caldas Novas imperdível" {...form.register("title")} />
            <FieldError message={errors.title?.message} />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="seller" className={labelClassName}>
              Vendedor
            </label>
            <Input id="seller" className="h-10 rounded-xl" placeholder="Ex.: Maria Silva" {...form.register("seller")} />
            <p className="text-xs text-muted-foreground">
              Não aparece no site. Vai junto no e-mail quando alguém pedir cotação desse roteiro.
            </p>
            <FieldError message={errors.seller?.message} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="slug" className={labelClassName}>
              Slug *
            </label>
            <div className="flex items-center gap-2">
              <Input id="slug" className="h-10 rounded-xl" placeholder="caldas-novas-imperdivel" {...form.register("slug")} />
              <Button type="button" variant="outline" className="h-10 rounded-xl border-border/70" onClick={handleAutoSlug}>
                Gerar
              </Button>
            </div>
            <FieldError message={errors.slug?.message} />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="duration" className={labelClassName}>
              Duração *
            </label>
            <Input id="duration" className="h-10 rounded-xl" placeholder="Ex.: 06 dias e 04 noites" {...form.register("duration")} />
            <FieldError message={errors.duration?.message} />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label htmlFor="priceFrom" className={labelClassName}>
              A partir de
            </label>
            <Input id="priceFrom" className="h-10 rounded-xl" placeholder='Ex.: R$ 1.598,00 (vazio mostra "Consulte")' {...form.register("priceFrom")} />
            <FieldError message={errors.priceFrom?.message} />
          </div>
        </div>
      </section>

      {/* 2. Imagens */}
      <section className={blockClassName}>
        <BlockTitle title="Capa e galeria" hint="A capa aparece no card e como imagem grande. A galeria vira miniaturas em cima dela." />
        <div className="space-y-1.5">
          <label htmlFor="coverImage" className={labelClassName}>
            Capa *
          </label>
          <BlogCoverField
            value={coverImage}
            onChange={(next) => setField("coverImage", next)}
            error={errors.coverImage?.message}
            uploadAction={uploadItineraryImageAction}
          />
        </div>
        <GalleryField
          value={gallery}
          onChange={(next) => setField("gallery", next)}
          error={errors.gallery?.message}
        />
      </section>

      {/* 3. Divisórias */}
      <section className={blockClassName}>
        <BlockTitle title="Divisórias *" hint="Em quais seções de /roteiros esse roteiro aparece. Pode marcar mais de uma." />
        {categories.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma divisória ainda. Crie a primeira abaixo.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const selected = categoryIds.includes(category.id);
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleCategory(category.id)}
                  className={cn(
                    "rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors",
                    selected
                      ? "border-brand bg-brand/10 text-brand"
                      : "border-border/70 text-muted-foreground hover:border-brand/50 hover:text-foreground",
                  )}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={newCategory}
            onChange={(event) => setNewCategory(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddCategory();
              }
            }}
            placeholder="Nova divisória (ex.: Férias de janeiro)"
            className="h-10 max-w-xs rounded-xl"
          />
          <Button type="button" variant="outline" className="h-10 rounded-xl border-border/70" onClick={handleAddCategory} disabled={isCreatingCategory || !newCategory.trim()}>
            {isCreatingCategory ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Plus className="size-4" aria-hidden />}
            Adicionar divisória
          </Button>
        </div>
        <FieldError message={errors.categoryIds?.message} />
      </section>

      {/* 4. Descrição */}
      <section className={blockClassName}>
        <BlockTitle title="Descrição *" hint="Texto de apresentação, logo abaixo das fotos." />
        <Textarea id="description" className="min-h-28 rounded-xl" placeholder="Caldas Novas é a maior estância hidrotermal do mundo..." {...form.register("description")} />
        <FieldError message={errors.description?.message} />
      </section>

      {/* 4b. O roteiro inclui (faixa de ícones) */}
      <section className={blockClassName}>
        <BlockTitle
          title="O roteiro inclui"
          hint="Faixa de ícones logo abaixo da descrição. A lista detalhada vai na aba Inclui."
        />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {INCLUDED_ITEM_OPTIONS.map((item) => {
            const selected = includedItems.includes(item.key);
            return (
              <button
                key={item.key}
                type="button"
                role="checkbox"
                aria-checked={selected}
                onClick={() => {
                  const current = form.getValues("includedItems");
                  setField(
                    "includedItems",
                    selected ? current.filter((key) => key !== item.key) : [...current, item.key],
                  );
                }}
                className={cn(
                  "flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-medium transition-colors",
                  selected
                    ? "border-brand bg-brand/10 text-brand"
                    : "border-border/70 text-muted-foreground hover:border-brand/50 hover:text-foreground",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded border",
                    selected ? "border-brand bg-brand text-white" : "border-border",
                  )}
                >
                  {selected ? <Check className="size-3" strokeWidth={3} /> : null}
                </span>
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Itens personalizados deste roteiro: aparecem na faixa com um ícone genérico. */}
        {includedItems.some(isCustomIncludedItem) ? (
          <div className="flex flex-wrap gap-2">
            {includedItems.filter(isCustomIncludedItem).map((value) => (
              <span
                key={value}
                className="inline-flex items-center gap-1.5 rounded-xl border border-brand bg-brand/10 py-1.5 pl-3 pr-1.5 text-sm font-medium text-brand"
              >
                {customIncludedItemLabel(value)}
                <button
                  type="button"
                  aria-label={`Remover ${customIncludedItemLabel(value)}`}
                  onClick={() =>
                    setField(
                      "includedItems",
                      form.getValues("includedItems").filter((item) => item !== value),
                    )
                  }
                  className="grid size-6 place-items-center rounded-lg text-brand/70 hover:bg-brand/15 hover:text-brand"
                >
                  <X className="size-3.5" aria-hidden />
                </button>
              </span>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={newIncludedItem}
            onChange={(event) => setNewIncludedItem(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleAddIncludedItem();
              }
            }}
            maxLength={CUSTOM_ITEM_MAX_LENGTH}
            placeholder="Outro item (ex.: Kit lanche)"
            className="h-10 max-w-xs rounded-xl"
          />
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-border/70"
            onClick={handleAddIncludedItem}
            disabled={!newIncludedItem.trim()}
          >
            <Plus className="size-4" aria-hidden />
            Adicionar item
          </Button>
        </div>
        <FieldError message={errors.includedItems?.message} />
      </section>

      {/* 4c. Vídeo e mapa */}
      <section className={blockClassName}>
        <BlockTitle title="Vídeo e mapa" hint="Opcionais. Cole o link normal do YouTube e o link do lugar no Google Maps." />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="videoUrl" className={labelClassName}>
              Vídeo (YouTube)
            </label>
            <Input id="videoUrl" className="h-10 rounded-xl" placeholder="https://www.youtube.com/watch?v=..." {...form.register("videoUrl")} />
            {videoUrl?.trim() && !toYouTubeEmbedUrl(videoUrl) ? (
              <p className={errorClassName}>Não reconheci esse link do YouTube.</p>
            ) : (
              <FieldError message={errors.videoUrl?.message} />
            )}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="mapUrl" className={labelClassName}>
              Localização (Google Maps)
            </label>
            <Input id="mapUrl" className="h-10 rounded-xl" placeholder="https://www.google.com/maps/place/..." {...form.register("mapUrl")} />
            {mapUrl?.trim() && !toGoogleMapsEmbedUrl(mapUrl) ? (
              <p className={errorClassName}>Use o link completo do lugar (não o encurtado maps.app.goo.gl) ou o código de incorporar.</p>
            ) : (
              <FieldError message={errors.mapUrl?.message} />
            )}
          </div>
        </div>
      </section>

      {/* 5. Abas */}
      <section className={blockClassName}>
        <BlockTitle title="Abas da página" hint="Cada aba só aparece no site se tiver conteúdo. Todas são opcionais." />
        <div className="space-y-5">
          {/* Editores são donos do próprio texto: o valor inicial vem do form e não é observado (digitar não re-renderiza o resto). */}
          {itineraryTabs.map(([key, label]) => (
            <div key={key} className="space-y-1.5">
              <label className={labelClassName}>{label}</label>
              <p className="text-xs text-muted-foreground">{tabHints[key]}</p>
              <TiptapEditor value={form.getValues(key) ?? ""} onChange={tabHandlers[key]} />
              <FieldError message={errors[key]?.message} />
            </div>
          ))}
        </div>
      </section>

      {/* 6. Hotéis */}
      <section className={blockClassName}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <BlockTitle title="Hotéis" hint="Opcional. Cada hotel vira um card com foto, tabela de valores e descrição." />
          <Button type="button" variant="outline" className="h-9 rounded-xl border-border/70" onClick={() => hotelsArray.append({ ...EMPTY_HOTEL })}>
            <Plus className="size-4" aria-hidden />
            Adicionar hotel
          </Button>
        </div>

        {hotelsArray.fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem hotéis: a seção &ldquo;Escolha o hotel&rdquo; não aparece no site.</p>
        ) : null}

        <div className="space-y-4">
          {hotelsArray.fields.map((field, index) => (
            <fieldset key={field.id} className="space-y-4 rounded-xl border border-border/70 bg-background p-4">
              <div className="flex items-center justify-between gap-3">
                <legend className="font-heading text-base font-semibold text-foreground">Hotel {index + 1}</legend>
                <Button type="button" size="sm" variant="ghost" className="rounded-lg text-destructive hover:text-destructive" onClick={() => hotelsArray.remove(index)}>
                  <Trash2 className="size-4" aria-hidden />
                  Remover
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <label className={labelClassName}>Nome *</label>
                  <Input className="h-10 rounded-xl" placeholder="Ex.: Thermas diRoma" {...form.register(`hotels.${index}.name`)} />
                  <FieldError message={errors.hotels?.[index]?.name?.message} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClassName}>Tipo</label>
                  <Input className="h-10 rounded-xl" placeholder="Hotel, resort, pousada..." {...form.register(`hotels.${index}.type`)} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClassName}>Acomodação</label>
                  <Input className="h-10 rounded-xl" placeholder="Ex.: Suíte standard" {...form.register(`hotels.${index}.accommodation`)} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClassName}>Diárias com</label>
                  <Input className="h-10 rounded-xl" placeholder="Ex.: Meia pensão - almoço" {...form.register(`hotels.${index}.board`)} />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClassName}>Site</label>
                  <Input className="h-10 rounded-xl" placeholder="https://..." {...form.register(`hotels.${index}.website`)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClassName}>Foto</label>
                <HotelImageField index={index} control={control} setValue={form.setValue} />
              </div>

              <div className="space-y-1.5">
                <label className={labelClassName}>Valores por pessoa</label>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  {(Object.keys(hotelPriceLabels) as HotelPriceKey[]).map((key) => (
                    <div key={key} className="space-y-1">
                      <span className="text-xs text-muted-foreground">{hotelPriceLabels[key]}</span>
                      <Input className="h-9 rounded-lg" placeholder="R$ 0,00" {...form.register(`hotels.${index}.prices.${key}`)} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClassName}>Descrição do hotel</label>
                <HotelDescriptionEditor
                  index={index}
                  value={form.getValues(`hotels.${index}.description`) ?? ""}
                  setValue={form.setValue}
                />
              </div>
            </fieldset>
          ))}
        </div>
      </section>

      {/* 7. Publicação */}
      <section className={blockClassName}>
        <BlockTitle title="Publicação" />
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-muted/25 p-3">
          <label htmlFor="published" className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
            <input
              id="published"
              type="checkbox"
              className="size-4 rounded border-border text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              checked={isPublished}
              onChange={(event) => {
                setField("published", event.target.checked);
                if (!event.target.checked) setField("featuredOnHomepage", false);
              }}
            />
            Publicar roteiro
          </label>
          <p className="text-xs text-muted-foreground">{isPublished ? "Visível no site." : "Salvo como rascunho."}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 bg-muted/25 p-3">
          <label
            htmlFor="featuredOnHomepage"
            className={cn("inline-flex items-center gap-2 text-sm font-medium", isPublished ? "cursor-pointer text-foreground" : "cursor-not-allowed text-muted-foreground")}
          >
            <input
              id="featuredOnHomepage"
              type="checkbox"
              className="size-4 rounded border-border text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              checked={isFeatured}
              disabled={!isPublished}
              onChange={(event) => setField("featuredOnHomepage", event.target.checked)}
            />
            Destacar na homepage
          </label>
          <p className="text-xs text-muted-foreground">
            {isPublished ? `Máximo de ${FEATURED_HOME_ITINERARIES_LIMIT} roteiros em destaque.` : "Publique o roteiro para habilitar o destaque."}
          </p>
          <FieldError message={errors.featuredOnHomepage?.message} />
        </div>
      </section>

      {/* 8. Preview */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Eye className="size-4 text-brand" aria-hidden />
          <h2 className="font-heading text-lg font-semibold tracking-tight text-foreground">Pré-visualização</h2>
          <span className="text-xs text-muted-foreground">Atualiza enquanto você digita. É assim que fica no site.</span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background">
          <ItineraryLivePreview control={control} />
        </div>
      </section>

      <div className="sticky bottom-0 z-10 -mx-4 flex items-center justify-end gap-2 border-t border-border/70 bg-card/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <Button type="submit" className="h-10 rounded-xl px-5" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Salvando...
            </>
          ) : mode === "create" ? (
            "Criar roteiro"
          ) : (
            "Salvar alterações"
          )}
        </Button>
      </div>
    </form>
  );
}

function GalleryField({
  value,
  onChange,
  error,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [url, setUrl] = useState("");

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadItineraryImageAction(formData);

      if (!result.ok || !result.data) {
        toast.error(`${file.name}: ${result.message}`);
        continue;
      }

      uploaded.push(result.data.imageUrl);
    }

    setIsUploading(false);

    if (uploaded.length > 0) {
      onChange([...value, ...uploaded]);
      toast.success(`${uploaded.length} imagem(ns) adicionada(s) à galeria.`);
    }
  }

  function handleAddUrl() {
    const trimmed = url.trim();
    if (!trimmed) return;
    onChange([...value, trimmed]);
    setUrl("");
  }

  return (
    <div className="space-y-3">
      <label className={labelClassName}>Galeria</label>
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-border/70 px-3 text-sm font-medium text-foreground hover:bg-muted/40">
          {isUploading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <ImagePlus className="size-4" aria-hidden />}
          {isUploading ? "Enviando..." : "Enviar fotos"}
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            disabled={isUploading}
            onChange={(event) => {
              void handleFiles(event.target.files);
              event.currentTarget.value = "";
            }}
          />
        </label>
        <Input
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAddUrl();
            }
          }}
          placeholder="ou cole uma URL e aperte Enter"
          className="h-10 max-w-sm rounded-xl"
        />
      </div>

      {value.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {value.map((item, index) => (
            <li key={`${item}-${index}`} className="group relative size-20 overflow-hidden rounded-lg border border-border/70 bg-muted/20">
              <Image src={resolvePublicImageSrc(item)} alt="" fill unoptimized sizes="80px" className="object-cover" />
              <button
                type="button"
                aria-label="Remover da galeria"
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
              >
                <X className="size-3.5" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <FieldError message={error} />
    </div>
  );
}

/** Foto do hotel: observa só o próprio campo. */
function HotelImageField({
  index,
  control,
  setValue,
}: {
  index: number;
  control: Control<ItineraryInput>;
  setValue: UseFormSetValue<ItineraryInput>;
}) {
  const value = useWatch({ control, name: `hotels.${index}.image` }) ?? "";

  return (
    <BlogCoverField
      value={value}
      onChange={(next) => setValue(`hotels.${index}.image`, next, { shouldDirty: true })}
      uploadAction={uploadItineraryImageAction}
      inputId={`hotel-${index}-image`}
    />
  );
}

/** Editor da descrição do hotel com handler estável por índice (não re-renderiza os outros). */
function HotelDescriptionEditor({
  index,
  value,
  setValue,
}: {
  index: number;
  value: string;
  setValue: UseFormSetValue<ItineraryInput>;
}) {
  const onChange = useMemo(
    () => (next: string) => setValue(`hotels.${index}.description`, next, { shouldDirty: true }),
    [index, setValue],
  );

  return <TiptapEditor value={value} onChange={onChange} />;
}

/**
 * Preview isolado do formulário: observa tudo, mas só redesenha 300ms depois da
 * última tecla — quem digita não sente o preview.
 */
function ItineraryLivePreview({ control }: { control: Control<ItineraryInput> }) {
  const watched = useWatch({ control });
  const [snapshot, setSnapshot] = useState(watched);

  useEffect(() => {
    const timer = window.setTimeout(() => setSnapshot(watched), 300);
    return () => window.clearTimeout(timer);
  }, [watched]);

  const previewData = useMemo(() => ({
    title: snapshot.title ?? "",
    duration: snapshot.duration ?? "",
    priceFrom: snapshot.priceFrom,
    coverImage: snapshot.coverImage ?? "",
    gallery: (snapshot.gallery ?? []).filter((url): url is string => typeof url === "string"),
    description: snapshot.description ?? "",
    includedItems: (snapshot.includedItems ?? []).filter((key): key is NonNullable<typeof key> => Boolean(key)),
    videoUrl: snapshot.videoUrl,
    mapUrl: snapshot.mapUrl,
    itinerary: snapshot.itinerary,
    optionals: snapshot.optionals,
    included: snapshot.included,
    notIncluded: snapshot.notIncluded,
    payment: snapshot.payment,
    departures: snapshot.departures,
    insurance: snapshot.insurance,
    notes: snapshot.notes,
    hotels: (snapshot.hotels ?? []).map((hotel) => ({
      ...EMPTY_HOTEL,
      ...hotel,
      name: hotel?.name ?? "",
      prices: (hotel?.prices ?? {}) as ItineraryHotel["prices"],
    })),
  }), [snapshot]);

  return <MemoItineraryDetail itinerary={previewData} preview />;
}

const MemoItineraryDetail = memo(ItineraryDetail);
