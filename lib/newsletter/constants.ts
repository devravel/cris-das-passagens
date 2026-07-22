import { content } from "@/config/content";

/** Destinatário das notificações internas de nova inscrição na newsletter. */
export const NEWSLETTER_INTERNAL_NOTIFICATION_EMAIL = content.contact.email;

export const DEFAULT_NEWSLETTER_PAGE_SIZE = 20;
export const MAX_NEWSLETTER_PAGE_SIZE = 100;

export const NEWSLETTER_RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000;

export const NEWSLETTER_SUBSCRIPTION_RATE_LIMIT = {
  maxRequests: 3,
  windowMs: NEWSLETTER_RATE_LIMIT_WINDOW_MS,
} as const;
