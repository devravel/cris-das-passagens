import { z } from "zod";

import { isValidPackageDateInput } from "@/lib/package/dates";
import {
  DEFAULT_KEYWORD_PAGE_SIZE,
  DEFAULT_PARTICIPANT_PAGE_SIZE,
  MAX_KEYWORD_PAGE_SIZE,
  MAX_PARTICIPANT_PAGE_SIZE,
  REI_DA_COPA_KEYWORD_STATUSES,
} from "@/lib/rei-da-copa/constants";
import {
  isValidBrazilianMobilePhone,
  isValidParticipantInstagram,
  isValidParticipantPhone,
  normalizeKeyword,
  normalizeParticipantInstagram,
  normalizeParticipantName,
  normalizeParticipantPhone,
} from "@/lib/rei-da-copa/utils";

const participantNameSchema = z
  .string()
  .trim()
  .min(3, "Informe o nome completo com pelo menos 3 caracteres.")
  .max(120, "O nome deve ter no máximo 120 caracteres.")
  .transform(normalizeParticipantName);

const participantPhoneSchema = z
  .string()
  .trim()
  .min(8, "Informe um telefone válido.")
  .max(20, "O telefone deve ter no máximo 20 caracteres.")
  .transform(normalizeParticipantPhone)
  .refine(isValidParticipantPhone, "Informe um telefone brasileiro válido.");

const participantRegistrationPhoneSchema = z
  .string()
  .trim()
  .transform(normalizeParticipantPhone)
  .refine(
    isValidBrazilianMobilePhone,
    "Informe um celular completo no formato (DD) 9XXXX-XXXX.",
  );

const participantInstagramSchema = z
  .string()
  .trim()
  .min(2, "Informe o Instagram.")
  .max(32, "O Instagram deve ter no máximo 32 caracteres.")
  .transform(normalizeParticipantInstagram)
  .refine(isValidParticipantInstagram, "Informe um usuário de Instagram válido.");

const keywordSchema = z
  .string()
  .trim()
  .min(1, "Informe a palavra-chave.")
  .max(100, "A palavra-chave deve ter no máximo 100 caracteres.")
  .transform(normalizeKeyword);

export const participantRegistrationSchema = z.object({
  name: participantNameSchema,
  phone: participantRegistrationPhoneSchema,
  instagram: participantInstagramSchema,
});

export type ParticipantRegistrationInput = z.input<typeof participantRegistrationSchema>;
export type ParticipantRegistrationDto = z.infer<typeof participantRegistrationSchema>;

export const EMPTY_PARTICIPANT_REGISTRATION_VALUES: ParticipantRegistrationInput = {
  name: "",
  phone: "",
  instagram: "",
};

export const keywordSubmissionSchema = z
  .object({
    keyword: keywordSchema,
    phone: z
      .string()
      .trim()
      .transform(normalizeParticipantPhone)
      .optional(),
    instagram: z
      .string()
      .trim()
      .transform(normalizeParticipantInstagram)
      .optional(),
  })
  .superRefine((data, ctx) => {
    const hasPhone = Boolean(data.phone);
    const hasInstagram = Boolean(data.instagram);

    if (!hasPhone && !hasInstagram) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Informe o telefone ou o Instagram cadastrado.",
      });
      return;
    }

    if (hasPhone && !isValidParticipantPhone(data.phone!)) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "Informe um telefone brasileiro válido.",
      });
    }

    if (hasInstagram && !isValidParticipantInstagram(data.instagram!)) {
      ctx.addIssue({
        code: "custom",
        path: ["instagram"],
        message: "Informe um usuário de Instagram válido.",
      });
    }
  });

export type KeywordSubmissionInput = z.input<typeof keywordSubmissionSchema>;
export type KeywordSubmissionDto = z.infer<typeof keywordSubmissionSchema>;

export const dailyKeywordSubmissionSchema = z.object({
  phone: participantRegistrationPhoneSchema,
  keyword: keywordSchema,
});

export const campaignKeywordCreateSchema = z.object({
  value: keywordSchema,
});

export type CampaignKeywordCreateInput = z.input<typeof campaignKeywordCreateSchema>;
export type CampaignKeywordCreateDto = z.infer<typeof campaignKeywordCreateSchema>;

export type DailyKeywordSubmissionInput = z.input<typeof dailyKeywordSubmissionSchema>;
export type DailyKeywordSubmissionDto = z.infer<typeof dailyKeywordSubmissionSchema>;

export const EMPTY_DAILY_KEYWORD_SUBMISSION_VALUES: DailyKeywordSubmissionInput = {
  phone: "",
  keyword: "",
};

export const participantListFilterSchema = z.object({
  search: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PARTICIPANT_PAGE_SIZE)
    .default(DEFAULT_PARTICIPANT_PAGE_SIZE),
});

export type ParticipantListFilterDto = z.infer<typeof participantListFilterSchema>;

export const keywordSubmissionListFilterSchema = z.object({
  search: z.string().trim().max(120).optional(),
  status: z.enum(REI_DA_COPA_KEYWORD_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_KEYWORD_PAGE_SIZE)
    .default(DEFAULT_KEYWORD_PAGE_SIZE),
});

export type KeywordSubmissionListFilterDto = z.infer<typeof keywordSubmissionListFilterSchema>;

export const keywordStatusUpdateSchema = z.object({
  status: z.enum(REI_DA_COPA_KEYWORD_STATUSES),
});

export type KeywordStatusUpdateDto = z.infer<typeof keywordStatusUpdateSchema>;

export const rankingUpsertSchema = z.object({
  participantId: z.string().trim().min(1, "Selecione um participante."),
  points: z.coerce.number().int().min(0, "A pontuação deve ser zero ou maior."),
  position: z.coerce.number().int().min(1, "A posição deve ser maior que zero."),
});

export type RankingUpsertDto = z.infer<typeof rankingUpsertSchema>;

export const rankingUpdateSchema = z.object({
  points: z.coerce.number().int().min(0, "A pontuação deve ser zero ou maior."),
  position: z.coerce.number().int().min(1, "A posição deve ser maior que zero."),
});

export type RankingUpdateDto = z.infer<typeof rankingUpdateSchema>;

export const RANKING_POINT_INCREMENTS = [10, 20, 50, 100] as const;

export const rankingAddPointsSchema = z.object({
  amount: z.coerce
    .number()
    .int()
    .refine(
      (value) => RANKING_POINT_INCREMENTS.includes(value as (typeof RANKING_POINT_INCREMENTS)[number]),
      "Incremento de pontos inválido.",
    ),
});

export type RankingAddPointsDto = z.infer<typeof rankingAddPointsSchema>;

export const campaignSettingsSchema = z
  .object({
    startDate: z.string().trim(),
    endDate: z.string().trim(),
    firstPlacePrize: z
      .string()
      .trim()
      .max(200, "O prêmio deve ter no máximo 200 caracteres."),
    secondPlacePrize: z
      .string()
      .trim()
      .max(200, "O prêmio deve ter no máximo 200 caracteres."),
    thirdPlacePrize: z
      .string()
      .trim()
      .max(200, "O prêmio deve ter no máximo 200 caracteres."),
    regulation: z
      .string()
      .trim()
      .max(10000, "O regulamento deve ter no máximo 10.000 caracteres."),
  })
  .superRefine((data, ctx) => {
    if (data.startDate && !isValidPackageDateInput(data.startDate)) {
      ctx.addIssue({
        code: "custom",
        path: ["startDate"],
        message: "Informe uma data de início válida.",
      });
    }

    if (data.endDate && !isValidPackageDateInput(data.endDate)) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Informe uma data de fim válida.",
      });
    }

    if (
      data.startDate.trim() &&
      data.endDate.trim() &&
      data.endDate < data.startDate
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "A data de fim deve ser igual ou posterior à data de início.",
      });
    }
  });

export type CampaignSettingsInput = z.input<typeof campaignSettingsSchema>;
export type CampaignSettingsDto = z.infer<typeof campaignSettingsSchema>;

export const EMPTY_CAMPAIGN_SETTINGS_VALUES: CampaignSettingsInput = {
  startDate: "",
  endDate: "",
  firstPlacePrize: "",
  secondPlacePrize: "",
  thirdPlacePrize: "",
  regulation: "",
};
