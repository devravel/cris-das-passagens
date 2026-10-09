import { formatBRL } from "@/lib/money";

export function formatPackagePrice(value: number | string | null | undefined): string {
  const numeric = typeof value === "string" ? Number(value) : value;

  if (numeric == null || Number.isNaN(numeric)) {
    return "R$ 0";
  }

  return formatBRL(numeric);
}
