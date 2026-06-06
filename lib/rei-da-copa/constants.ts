/** Destinatário fixo das notificações internas de nova inscrição (equipe Cris das Passagens). */
export const REI_DA_COPA_INTERNAL_NOTIFICATION_EMAIL =
  "reidacopacrisdaspassagens@gmail.com";

export const REI_DA_COPA_PARTICIPANT_NOT_FOUND_MESSAGE =
  "Participante não encontrado. Faça sua inscrição primeiro.";

export const REI_DA_COPA_KEYWORD_NOT_FOUND_MESSAGE =
  "A palavra-chave digitada está incorreta ou não existe. Verifique e tente novamente.";

export const REI_DA_COPA_KEYWORD_STATUSES = ["PENDING", "APPROVED", "REJECTED"] as const;

export type ReiDaCopaKeywordStatusValue = (typeof REI_DA_COPA_KEYWORD_STATUSES)[number];

export const DEFAULT_PARTICIPANT_PAGE_SIZE = 20;
export const MAX_PARTICIPANT_PAGE_SIZE = 100;
export const DEFAULT_KEYWORD_PAGE_SIZE = 20;
export const MAX_KEYWORD_PAGE_SIZE = 100;

export const REI_DA_COPA_RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000;

export const REI_DA_COPA_REGISTRATION_RATE_LIMIT = {
  maxRequests: 3,
  windowMs: REI_DA_COPA_RATE_LIMIT_WINDOW_MS,
} as const;

export const REI_DA_COPA_KEYWORD_RATE_LIMIT = {
  maxRequests: 10,
  windowMs: REI_DA_COPA_RATE_LIMIT_WINDOW_MS,
} as const;
