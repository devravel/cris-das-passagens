import { z } from "zod";

export const COUPON_DISCOUNT_TYPES = ["PERCENTAGE", "FIXED", "CUSTOM"] as const;
export type CouponDiscountTypeValue = (typeof COUPON_DISCOUNT_TYPES)[number];

export const couponCodeSchema = z
  .string()
  .trim()
  .min(2, "Informe um código com pelo menos 2 caracteres.")
  .max(40, "O código deve ter no máximo 40 caracteres.")
  .transform((value) => value.toUpperCase());

export const couponValidateSchema = z.object({
  code: couponCodeSchema,
});

export const couponRedeemSchema = z.object({
  code: couponCodeSchema,
  packageTitle: z
    .string()
    .trim()
    .min(1, "Informe o nome do pacote.")
    .max(200, "O nome do pacote deve ter no máximo 200 caracteres."),
});

const couponFormObjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Informe o nome do cupom.")
    .max(80, "O nome deve ter no máximo 80 caracteres."),
  code: z
    .string()
    .trim()
    .min(2, "Informe um código com pelo menos 2 caracteres.")
    .max(40, "O código deve ter no máximo 40 caracteres.")
    .regex(
      /^[A-Za-z0-9_-]+$/,
      "Use apenas letras, números, hífen e sublinhado.",
    ),
  discountType: z.enum(COUPON_DISCOUNT_TYPES),
  discountValue: z.number(),
  customPrize: z
    .string()
    .trim()
    .max(300, "O prêmio personalizado deve ter no máximo 300 caracteres."),
  maxUses: z.number().int().positive("O limite de usos deve ser maior que zero.").nullable(),
  expiresAt: z.string().trim(),
  description: z.string().trim().max(500, "A descrição deve ter no máximo 500 caracteres."),
  isActive: z.boolean(),
});

function refineCouponDiscountFields<
  T extends {
    discountType: CouponDiscountTypeValue;
    discountValue: number;
    customPrize: string;
  },
>(data: T, ctx: z.RefinementCtx) {
  if (data.discountType === "CUSTOM") {
    if (!data.customPrize.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["customPrize"],
        message: "Informe o prêmio personalizado.",
      });
    }

    return;
  }

  if (!(data.discountValue > 0)) {
    ctx.addIssue({
      code: "custom",
      path: ["discountValue"],
      message: "O valor do desconto deve ser maior que zero.",
    });
  }

  if (data.discountType === "PERCENTAGE" && data.discountValue > 100) {
    ctx.addIssue({
      code: "custom",
      path: ["discountValue"],
      message: "O percentual não pode ser maior que 100%.",
    });
  }
}

export const couponFormSchema = couponFormObjectSchema
  .superRefine((data, ctx) => {
    refineCouponDiscountFields(data, ctx);

    if (data.expiresAt.trim()) {
      const parsed = new Date(data.expiresAt);

      if (Number.isNaN(parsed.getTime())) {
        ctx.addIssue({
          code: "custom",
          path: ["expiresAt"],
          message: "Informe uma data de expiração válida.",
        });
      }
    }
  })
  .transform((data) => ({
    name: data.name,
    code: data.code.toUpperCase(),
    discountType: data.discountType,
    discountValue: data.discountType === "CUSTOM" ? 0 : data.discountValue,
    customPrize:
      data.discountType === "CUSTOM" ? data.customPrize.trim() : null,
    maxUses: data.maxUses,
    expiresAt: data.expiresAt.trim() ? new Date(data.expiresAt) : null,
    description: data.description.trim() || null,
    isActive: data.isActive,
  }));

export const couponPersistSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Informe o nome do cupom.")
      .max(80, "O nome deve ter no máximo 80 caracteres."),
    code: z
      .string()
      .trim()
      .min(2, "Informe um código com pelo menos 2 caracteres.")
      .max(40, "O código deve ter no máximo 40 caracteres.")
      .transform((value) => value.toUpperCase()),
    discountType: z.enum(COUPON_DISCOUNT_TYPES),
    discountValue: z.number(),
    customPrize: z
      .string()
      .trim()
      .max(300, "O prêmio personalizado deve ter no máximo 300 caracteres.")
      .nullable(),
    maxUses: z.number().int().positive("O limite de usos deve ser maior que zero.").nullable(),
    expiresAt: z.date().nullable(),
    description: z.string().trim().max(500).nullable(),
    isActive: z.boolean(),
  })
  .superRefine((data, ctx) => {
    refineCouponDiscountFields(
      {
        discountType: data.discountType,
        discountValue: data.discountValue,
        customPrize: data.customPrize ?? "",
      },
      ctx,
    );

    if (data.discountType === "CUSTOM" && data.discountValue !== 0) {
      ctx.addIssue({
        code: "custom",
        path: ["discountValue"],
        message: "Cupons personalizados não devem ter valor de desconto.",
      });
    }
  })
  .transform((data) => ({
    ...data,
    discountValue: data.discountType === "CUSTOM" ? 0 : data.discountValue,
    customPrize:
      data.discountType === "CUSTOM" ? (data.customPrize?.trim() || null) : null,
  }));

export type CouponFormInput = z.input<typeof couponFormSchema>;
export type CouponFormValues = z.output<typeof couponFormSchema>;

export const EMPTY_COUPON_FORM_VALUES: CouponFormInput = {
  name: "",
  code: "",
  discountType: "PERCENTAGE",
  discountValue: 10,
  customPrize: "",
  maxUses: null,
  expiresAt: "",
  description: "",
  isActive: true,
};

export type PublicCouponPayload = {
  code: string;
  name: string;
  discountType: CouponDiscountTypeValue;
  discountValue: number;
  discountLabel: string;
  customPrize: string | null;
};
