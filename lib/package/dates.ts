const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

/** Valor de `<input type="datetime-local" />` a partir de ISO/Date. */
export function toDatetimeLocalValue(value: string | Date | null | undefined): string {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 16);
}

/** Valor de `<input type="datetime-local" />` → Date local. */
export function parseOptionalDatetimeLocalInput(
  value: string | undefined,
): Date | null {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return null;
  }

  const date = new Date(trimmed);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function isValidDatetimeLocalInput(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) {
    return true;
  }

  return parseOptionalDatetimeLocalInput(trimmed) !== null;
}
