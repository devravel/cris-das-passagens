import { z } from "zod";

import {
  DEFAULT_NEWSLETTER_PAGE_SIZE,
  MAX_NEWSLETTER_PAGE_SIZE,
} from "@/lib/newsletter/constants";
import {
  isValidBrazilianMobilePhone,
  normalizeParticipantName,
  normalizeParticipantPhone,
} from "@/lib/rei-da-copa/utils";

const subscriberNameSchema = z
  .string()
  .trim()
  .min(3, "Informe o nome completo com pelo menos 3 caracteres.")
  .max(120, "O nome deve ter no máximo 120 caracteres.")
  .transform(normalizeParticipantName);

const subscriberPhoneSchema = z
  .string()
  .trim()
  .transform(normalizeParticipantPhone)
  .refine(
    isValidBrazilianMobilePhone,
    "Informe um celular completo no formato (DD) 9XXXX-XXXX.",
  );

const subscriberEmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Informe um e-mail válido.")
  .max(190, "O e-mail deve ter no máximo 190 caracteres.");

export const newsletterSubscriptionSchema = z.object({
  name: subscriberNameSchema,
  email: subscriberEmailSchema,
  phone: subscriberPhoneSchema,
});

export type NewsletterSubscriptionInput = z.input<
  typeof newsletterSubscriptionSchema
>;
export type NewsletterSubscriptionDto = z.infer<
  typeof newsletterSubscriptionSchema
>;

export const EMPTY_NEWSLETTER_SUBSCRIPTION_VALUES: NewsletterSubscriptionInput =
  {
    name: "",
    email: "",
    phone: "",
  };

export const newsletterListFilterSchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_NEWSLETTER_PAGE_SIZE)
    .default(DEFAULT_NEWSLETTER_PAGE_SIZE),
});

export type NewsletterListFilterDto = z.infer<typeof newsletterListFilterSchema>;
