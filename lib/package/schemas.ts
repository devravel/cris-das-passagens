import { z } from "zod";

import { isValidBlogImageUrl } from "@/lib/blog/image-url";
import {
  PACKAGE_CATEGORIES,
  PACKAGE_TYPES,
  PACKAGE_TYPES_WITH_CATEGORY,
  type PackageTypeValue,
} from "@/lib/package/constants";

const priceSchema = z.number().min(0, "O preço deve ser maior ou igual a zero.");

const optionalPriceSchema = z.number().min(0).nullable();

const optionalCountSchema = z
  .number()
  .int("Informe um número inteiro.")
  .min(1, "Informe um valor maior que zero.")
  .nullable();

const includedItemSchema = z
  .string()
  .trim()
  .min(1, "Informe o texto do item.")
  .max(120, "Cada item deve ter no máximo 120 caracteres.");

export const packageFormSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Informe um título com pelo menos 3 caracteres.")
      .max(120, "Título deve ter no máximo 120 caracteres."),
    slug: z
      .string()
      .trim()
      .min(3, "Informe um slug com pelo menos 3 caracteres.")
      .max(120, "Slug deve ter no máximo 120 caracteres.")
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens."),
    shortDescription: z
      .string()
      .trim()
      .max(280, "Descrição curta deve ter no máximo 280 caracteres."),
    destination: z
      .string()
      .trim()
      .min(2, "Informe o destino.")
      .max(120, "Destino deve ter no máximo 120 caracteres."),
    image: z
      .string()
      .trim()
      .min(1, "Informe a imagem do pacote.")
      .refine((value) => isValidBlogImageUrl(value), "Informe uma URL válida para a imagem."),
    type: z.enum(PACKAGE_TYPES),
    category: z.enum(PACKAGE_CATEGORIES).nullable(),
    price: priceSchema,
    oldPrice: optionalPriceSchema,
    installmentText: z.string().trim(),
    highlightInstallments: z.boolean(),
    airline: z.string().trim(),
    hotelName: z.string().trim(),
    includedItems: z
      .array(z.string())
      .transform((items) => items.map((item) => item.trim()).filter(Boolean))
      .pipe(z.array(includedItemSchema).max(12, "Adicione no máximo 12 itens.")),
    includesTickets: z.boolean(),
    includesHotel: z.boolean(),
    includesFlight: z.boolean(),
    includesCruise: z.boolean(),
    daysCount: optionalCountSchema,
    nightsCount: optionalCountSchema,
    showOnLandingPage: z.boolean(),
    active: z.boolean(),
    featured: z.boolean(),
  })
  .superRefine((data, ctx) => {
    validatePackageRules(data, ctx);
  });

function validatePackageRules(
  data: z.infer<typeof packageFormSchema>,
  ctx: z.RefinementCtx,
) {
  const type = data.type as PackageTypeValue;

  if (data.shortDescription.length > 0 && data.shortDescription.length < 10) {
    ctx.addIssue({
      code: "custom",
      path: ["shortDescription"],
      message: "Informe uma descrição curta com pelo menos 10 caracteres.",
    });
  }

  if (PACKAGE_TYPES_WITH_CATEGORY.has(type) && !data.category) {
    ctx.addIssue({
      code: "custom",
      path: ["category"],
      message: "Selecione a categoria do pacote.",
    });
  }

  if (type === "FLIGHT" && !data.airline.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["airline"],
      message: "Informe a companhia aérea.",
    });
  }

  if (type === "HOTEL" && !data.hotelName.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["hotelName"],
      message: "Informe o nome do hotel.",
    });
  }

  if (type === "CRUISE" && !data.hotelName.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["hotelName"],
      message: "Informe o nome do navio ou cruzeiro.",
    });
  }

  if (type === "PACKAGE_COMPLETE") {
    if (!data.includesFlight && !data.includesHotel && !data.includesTickets) {
      ctx.addIssue({
        code: "custom",
        path: ["includesFlight"],
        message: "Selecione ao menos um item incluso no pacote.",
      });
    }

    if (data.includesFlight && !data.airline.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["airline"],
        message: "Informe a companhia aérea.",
      });
    }

    if (data.includesHotel && !data.hotelName.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["hotelName"],
        message: "Informe o nome do hotel.",
      });
    }
  }

  if (data.oldPrice != null && data.oldPrice <= data.price) {
    ctx.addIssue({
      code: "custom",
      path: ["oldPrice"],
      message: "O preço anterior deve ser maior que o preço atual.",
    });
  }

  if (data.highlightInstallments && !data.installmentText.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["installmentText"],
      message: "Informe o parcelamento para destacá-lo no card.",
    });
  }
}

export type PackageFormValues = z.infer<typeof packageFormSchema>;

export type PackageCardData = {
  title: string;
  shortDescription: string | null;
  destination: string;
  image: string;
  type: PackageTypeValue;
  price: number;
  oldPrice: number | null;
  installmentText: string | null;
  highlightInstallments: boolean;
  airline: string | null;
  hotelName: string | null;
  includedItems: string[];
  daysCount: number | null;
  nightsCount: number | null;
  featured: boolean;
};

export type PackageCardPreviewData = PackageCardData;

export function toPackageCardPreviewData(values: PackageFormValues): PackageCardPreviewData {
  return {
    title: values.title.trim(),
    shortDescription: values.shortDescription.trim() || null,
    destination: values.destination.trim(),
    image: values.image.trim(),
    type: values.type,
    price: values.price,
    oldPrice: values.oldPrice ?? null,
    installmentText: values.installmentText.trim() || null,
    highlightInstallments: values.highlightInstallments,
    airline: values.airline.trim() || null,
    hotelName: values.hotelName.trim() || null,
    includedItems: values.includedItems.map((item) => item.trim()).filter(Boolean),
    daysCount: values.daysCount ?? null,
    nightsCount: values.nightsCount ?? null,
    featured: values.featured,
  };
}

export function getDefaultIncludesForType(type: PackageTypeValue) {
  switch (type) {
    case "FLIGHT":
      return {
        includesFlight: true,
        includesHotel: false,
        includesTickets: false,
        includesCruise: false,
      };
    case "HOTEL":
      return {
        includesFlight: false,
        includesHotel: true,
        includesTickets: false,
        includesCruise: false,
      };
    case "TICKET":
      return {
        includesFlight: false,
        includesHotel: false,
        includesTickets: true,
        includesCruise: false,
      };
    case "CRUISE":
      return {
        includesFlight: false,
        includesHotel: false,
        includesTickets: false,
        includesCruise: true,
      };
    default:
      return {
        includesFlight: true,
        includesHotel: true,
        includesTickets: false,
        includesCruise: false,
      };
  }
}

export const EMPTY_PACKAGE_FORM_VALUES: PackageFormValues = {
  title: "",
  slug: "",
  shortDescription: "",
  destination: "",
  image: "",
  type: "PACKAGE_COMPLETE",
  category: "NATIONAL",
  price: 0,
  oldPrice: null,
  installmentText: "",
  highlightInstallments: false,
  airline: "",
  hotelName: "",
  includedItems: [],
  includesTickets: false,
  includesFlight: true,
  includesHotel: true,
  includesCruise: false,
  daysCount: null,
  nightsCount: null,
  showOnLandingPage: true,
  active: true,
  featured: false,
};
