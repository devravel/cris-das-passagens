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

const includedItemSchema = z
  .string()
  .trim()
  .min(1, "Informe o texto do item.")
  .max(120, "Cada item deve ter no máximo 120 caracteres.");

const packageFormFieldsSchema = z.object({
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
  showOnLandingPage: z.boolean(),
  active: z.boolean(),
  featured: z.boolean(),
});

export const packageFormSchema = packageFormFieldsSchema
  .superRefine((data, ctx) => {
    validatePackageRules(data, ctx);
  })
  .transform((data) => ({
    ...data,
    title: data.destination.trim(),
    daysCount: null,
    nightsCount: null,
  }));

function validatePackageRules(
  data: z.infer<typeof packageFormFieldsSchema>,
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

  if (type === "PACKAGE_COMPLETE") {
    if (!data.includesFlight && !data.includesHotel && !data.includesTickets) {
      ctx.addIssue({
        code: "custom",
        path: ["includesFlight"],
        message: "Selecione ao menos um item incluso no pacote.",
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

export type PackageFormInput = z.infer<typeof packageFormFieldsSchema>;
export type PackageFormValues = z.output<typeof packageFormSchema>;

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
  featured: boolean;
};

export type PackageCardPreviewData = PackageCardData;

export function toPackageCardPreviewData(
  values: PackageFormInput | PackageFormValues,
): PackageCardPreviewData {
  const destination = values.destination.trim();

  return {
    title: destination,
    shortDescription: values.shortDescription.trim() || null,
    destination,
    image: values.image.trim(),
    type: values.type,
    price: values.price,
    oldPrice: values.oldPrice ?? null,
    installmentText: values.installmentText.trim() || null,
    highlightInstallments: values.highlightInstallments,
    airline: values.airline.trim() || null,
    hotelName: values.hotelName.trim() || null,
    includedItems: values.includedItems.map((item) => item.trim()).filter(Boolean),
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

export const EMPTY_PACKAGE_FORM_VALUES: PackageFormInput = {
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
  showOnLandingPage: true,
  active: true,
  featured: false,
};
