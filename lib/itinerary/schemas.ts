import { z } from "zod";

import { isValidBlogImageUrl } from "@/lib/blog/image-url";
import { CUSTOM_ITEM_PREFIX, INCLUDED_ITEM_KEYS } from "@/lib/itinerary/included-items";

const imageUrl = z
  .string()
  .trim()
  .refine((value) => isValidBlogImageUrl(value), "Informe uma URL válida para a imagem.");

/** HTML do tiptap; vazio vira null e o bloco some da página. */
const richText = z.string().trim().max(50_000).optional();

export const hotelPriceLabels = {
  single: "Single",
  double: "Duplo",
  triple: "Triplo",
  quadruple: "Quádruplo",
  quintuple: "Quíntuplo",
  child1: "Criança (1)",
  child2: "Criança (2)",
} as const;

export type HotelPriceKey = keyof typeof hotelPriceLabels;

export const itineraryHotelSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do hotel.").max(120),
  image: z.string().trim().max(2048).optional(),
  type: z.string().trim().max(60).optional(),
  accommodation: z.string().trim().max(120).optional(),
  board: z.string().trim().max(120).optional(),
  website: z.string().trim().max(2048).optional(),
  /** Chaves de hotelPriceLabels; vazio = linha não aparece. */
  prices: z.record(z.string(), z.string().trim().max(40)).optional(),
  description: richText,
});

export type ItineraryHotel = z.infer<typeof itineraryHotelSchema>;

export const itinerarySchema = z
  .object({
    title: z.string().trim().min(3, "Título deve ter no mínimo 3 caracteres.").max(140),
    /** Interno: não aparece no site, só no e-mail de cotação. */
    seller: z.string().trim().max(80).optional(),
    slug: z
      .string()
      .trim()
      .min(3, "Slug deve ter no mínimo 3 caracteres.")
      .max(160)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens."),
    coverImage: z.string().trim().min(1, "Informe a imagem de capa.").pipe(imageUrl),
    gallery: z.array(imageUrl).max(20, "No máximo 20 imagens na galeria."),
    duration: z.string().trim().min(2, "Informe a duração.").max(80),
    priceFrom: z.string().trim().max(60).optional(),
    description: z.string().trim().min(20, "Descrição deve ter no mínimo 20 caracteres."),
    includedItems: z
      .array(
        z.union([
          z.enum(INCLUDED_ITEM_KEYS),
          z
            .string()
            .regex(/^custom:\S.{0,39}$/, "Item personalizado inválido.")
            .refine((value) => value.trim().length > CUSTOM_ITEM_PREFIX.length, "Item personalizado vazio."),
        ]),
      )
      .max(INCLUDED_ITEM_KEYS.length + 12, "Muitos itens na faixa."),
    videoUrl: z.string().trim().max(2048).optional(),
    mapUrl: z.string().trim().max(4096).optional(),
    categoryIds: z.array(z.string().min(1)).min(1, "Escolha pelo menos uma divisória."),
    itinerary: richText,
    optionals: richText,
    included: richText,
    notIncluded: richText,
    payment: richText,
    departures: richText,
    insurance: richText,
    notes: richText,
    hotels: z.array(itineraryHotelSchema).max(20),
    published: z.boolean(),
    featuredOnHomepage: z.boolean(),
  })
  .refine((data) => !data.featuredOnHomepage || data.published, {
    message: "Apenas roteiros publicados podem ser destacados na homepage.",
    path: ["featuredOnHomepage"],
  });

export type ItineraryInput = z.infer<typeof itinerarySchema>;

/** Abas da página do roteiro, na ordem da referência. */
export const itineraryTabs = [
  ["itinerary", "Roteiro"],
  ["optionals", "Opcionais"],
  ["included", "Inclui"],
  ["notIncluded", "Não inclui"],
  ["payment", "Pagamento"],
  ["departures", "Saídas"],
  ["insurance", "Seguro"],
  ["notes", "Observações"],
] as const;

export type ItineraryTabKey = (typeof itineraryTabs)[number][0];

export const itineraryCategorySchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter no mínimo 2 caracteres.").max(60),
});
