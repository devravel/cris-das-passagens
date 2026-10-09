/**
 * Lê valor em reais do jeito que vier colado ou digitado: "R$ 4.390,00",
 * "4.390", "4390,5", "1,234.56". Com ponto e vírgula juntos, o último é o
 * decimal; separador repetido é milhar; vírgula sozinha é decimal; ponto
 * sozinho seguido de 3 dígitos é milhar (padrão brasileiro).
 */
export function parseMoneyInput(raw: string): number | null {
  const text = raw.replace(/[^\d.,]/g, "");

  if (!/\d/.test(text)) {
    return null;
  }

  const last = Math.max(text.lastIndexOf(","), text.lastIndexOf("."));
  const digits = (value: string) => value.replace(/\D/g, "");

  if (last === -1) {
    return Number(text);
  }

  const separator = text[last];
  const fraction = text.slice(last + 1);
  const isDecimal =
    (text.includes(",") && text.includes(".")) ||
    (text.indexOf(separator) === last && (separator === "," || fraction.length !== 3));

  const value = isDecimal
    ? Number(`${digits(text.slice(0, last)) || "0"}.${fraction}`)
    : Number(digits(text));

  return Math.round(value * 100) / 100;
}

/** Valor no campo: "4.390,00". Vazio quando não há valor. */
export function formatMoneyInput(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return "";
  }

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Valor em reais pra exibir: redondo sem centavos ("R$ 8.345"), com centavos
 * sempre nas duas casas ("R$ 2.610,90", nunca "2.610,9").
 */
export function formatBRL(value: number): string {
  const rounded = Math.round(value * 100) / 100;

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: Number.isInteger(rounded) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(rounded);
}
