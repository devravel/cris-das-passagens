import { z } from "zod";

import { isValidBlogImageUrl } from "@/lib/blog/image-url";
import {
  PACKAGE_CATEGORIES,
  PACKAGE_PRICE_SCOPES,
  PACKAGE_TYPES,
  PACKAGE_TYPES_WITH_CATEGORY,
  type PackageTypeValue,
  type PackagePriceScopeValue,
} from "@/lib/package/constants";
import { packageTypeShowsDepartureCity } from "@/lib/package/departure-city";
import { isValidPackageDateInput } from "@/lib/package/dates";

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
  priceScope: z.enum(PACKAGE_PRICE_SCOPES).nullable(),
  installmentText: z.string().trim(),
  highlightInstallments: z.boolean(),
  feesText: z
    .string()
    .trim()
    .max(80, "Taxas deve ter no máximo 80 caracteres."),
  airline: z.string().trim(),
  hotelName: z.string().trim(),
  departureCity: z.string().trim(),
  departureDate: z.string().trim(),
  returnDate: z.string().trim(),
  includedItems: z
    .array(z.string())
    .transform((items) => items.map((item) => item.trim()).filter(Boolean))
    .pipe(z.array(includedItemSchema).max(12, "Adicione no máximo 12 itens.")),
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

  if (type === "HOTEL" && !data.hotelName.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["hotelName"],
      message: "Informe o nome do hotel.",
    });
  }

  if (packageTypeShowsDepartureCity(type) && !data.departureCity.trim()) {
    ctx.addIssue({
      code: "custom",
      path: ["departureCity"],
      message: "Informe a cidade de origem.",
    });
  }

  if (packageTypeShowsDepartureCity(type) && data.departureCity.trim().length > 80) {
    ctx.addIssue({
      code: "custom",
      path: ["departureCity"],
      message: "A origem deve ter no máximo 80 caracteres.",
    });
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

  if (!isValidPackageDateInput(data.departureDate)) {
    ctx.addIssue({
      code: "custom",
      path: ["departureDate"],
      message: "Informe uma data de ida válida.",
    });
  }

  if (!isValidPackageDateInput(data.returnDate)) {
    ctx.addIssue({
      code: "custom",
      path: ["returnDate"],
      message: "Informe uma data de volta válida.",
    });
  }

  if (
    data.departureDate.trim() &&
    data.returnDate.trim() &&
    data.returnDate < data.departureDate
  ) {
    ctx.addIssue({
      code: "custom",
      path: ["returnDate"],
      message: "A data de volta deve ser igual ou posterior à data de ida.",
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
  priceScope: PackagePriceScopeValue | null;
  installmentText: string | null;
  highlightInstallments: boolean;
  feesText: string | null;
  airline: string | null;
  hotelName: string | null;
  includedItems: string[];
  featured: boolean;
  departureDate: string | null;
  returnDate: string | null;
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
    priceScope: values.priceScope ?? null,
    installmentText: values.installmentText.trim() || null,
    highlightInstallments: values.highlightInstallments,
    feesText: values.feesText.trim() || null,
    airline: values.airline.trim() || null,
    hotelName: values.hotelName.trim() || null,
    includedItems: values.includedItems.map((item) => item.trim()).filter(Boolean),
    featured: values.featured,
    departureDate: values.departureDate.trim() || null,
    returnDate: values.returnDate.trim() || null,
  };
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
  priceScope: null,
  installmentText: "",
  highlightInstallments: false,
  feesText: "",
  airline: "",
  hotelName: "",
  departureCity: "São Paulo, SP",
  departureDate: "",
  returnDate: "",
  includedItems: [],
  active: true,
  featured: false,
};
