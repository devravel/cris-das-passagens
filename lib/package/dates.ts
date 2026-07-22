const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATETIME_LOCAL_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/;

/** Horário de referência para agendamento de pacotes (formulário admin). */
export const PACKAGE_SCHEDULE_TIME_ZONE = "America/Sao_Paulo";

/** Offset fixo de Brasília (sem horário de verão desde 2019). */
const PACKAGE_SCHEDULE_UTC_OFFSET = "-03:00";

/** Converte Date do Prisma (@db.Date) para `YYYY-MM-DD` (formulário e API pública). */
export function packageDateToIsoString(
  value: Date | string | null | undefined,
): string | null {
  if (value == null) {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/** Valor de `<input type="date" />` → Date UTC meio-dia (evita drift de fuso). */
export function parseOptionalPackageDateInput(value: string | undefined): Date | null {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return null;
  }

  if (!ISO_DATE_PATTERN.test(trimmed)) {
    return null;
  }

  const date = new Date(`${trimmed}T12:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/** Exibe no card: `03/08/2026`. */
export function formatPackageTravelDate(isoDate: string | null | undefined): string | null {
  if (!isoDate?.trim()) {
    return null;
  }

  const [year, month, day] = isoDate.split("-").map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const date = new Date(Date.UTC(year, month - 1, day));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function isValidPackageDateInput(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  return ISO_DATE_PATTERN.test(trimmed) && parseOptionalPackageDateInput(trimmed) !== null;
}

/** Valor de `<input type="datetime-local" />` a partir de ISO/Date (horário de SP). */
export function toDatetimeLocalValue(value: string | Date | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: PACKAGE_SCHEDULE_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = get("hour");
  const minute = get("minute");

  if (!year || !month || !day || !hour || !minute) {
    return "";
  }

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

/**
 * Valor de `<input type="datetime-local" />` → instante absoluto.
 * Sempre interpreta a data/hora como horário de Brasília, inclusive no servidor (Vercel/UTC).
 */
export function parseOptionalDatetimeLocalInput(
  value: string | undefined,
): Date | null {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return null;
  }

  const match = DATETIME_LOCAL_PATTERN.exec(trimmed);

  if (!match) {
    const date = new Date(trimmed);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const [, year, month, day, hour, minute, second = "00"] = match;
  const isoWithOffset = `${year}-${month}-${day}T${hour}:${minute}:${second.padStart(2, "0")}${PACKAGE_SCHEDULE_UTC_OFFSET}`;
  const date = new Date(isoWithOffset);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

/** Margem para evitar rejeição quando o admin leva alguns segundos para salvar. */
export function isScheduleDatetimeInFuture(
  value: string,
  graceMs = 30_000,
  now = new Date(),
): boolean {
  const parsed = parseOptionalDatetimeLocalInput(value);

  if (!parsed) {
    return false;
  }

  return parsed.getTime() > now.getTime() + graceMs;
}

export function isValidDatetimeLocalInput(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  return parseOptionalDatetimeLocalInput(trimmed) !== null;
}
