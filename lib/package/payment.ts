import { formatPackagePrice } from "@/lib/package/format";

export const PACKAGE_INSTALLMENT_KINDS = [
  "NONE",
  "INSTALLMENTS",
  "DOWN_PAYMENT",
  "PIX_CASH",
  "CUSTOM",
] as const;

export type PackageInstallmentKindValue =
  (typeof PACKAGE_INSTALLMENT_KINDS)[number];

export const PACKAGE_INSTALLMENT_COUNT_PRESETS = [6, 10, 12, 15] as const;

export const PACKAGE_PAYMENT_METHODS = [
  "CREDIT_CARD",
  "BOLETO",
  "PIX",
] as const;

export type PackagePaymentMethodValue =
  (typeof PACKAGE_PAYMENT_METHODS)[number];

export const PACKAGE_PAYMENT_METHOD_LABELS: Record<
  PackagePaymentMethodValue,
  string
> = {
  CREDIT_CARD: "Cartão de crédito",
  BOLETO: "Boleto",
  PIX: "Pix",
};

export const PACKAGE_INSTALLMENT_KIND_LABELS: Record<
  PackageInstallmentKindValue,
  string
> = {
  NONE: "Não informar",
  INSTALLMENTS: "Parcelado",
  DOWN_PAYMENT: "Entrada + parcelas",
  PIX_CASH: "À vista via Pix",
  CUSTOM: "Texto livre",
};

export type InstallmentFormFields = {
  installmentKind: PackageInstallmentKindValue;
  installmentCount: number | null;
  installmentAmount: number | null;
  downPaymentAmount: number | null;
  installmentText: string;
  paymentMethods: PackagePaymentMethodValue[];
};

export function isPackagePaymentMethod(
  value: string,
): value is PackagePaymentMethodValue {
  return (PACKAGE_PAYMENT_METHODS as readonly string[]).includes(value);
}

export function normalizePaymentMethods(
  methods: readonly string[] | null | undefined,
): PackagePaymentMethodValue[] {
  if (!methods?.length) {
    return [];
  }

  const unique = new Set<PackagePaymentMethodValue>();

  for (const method of methods) {
    if (isPackagePaymentMethod(method)) {
      unique.add(method);
    }
  }

  return PACKAGE_PAYMENT_METHODS.filter((method) => unique.has(method));
}

export function formatPaymentMethodsText(
  methods: readonly string[] | null | undefined,
): string | null {
  const normalized = normalizePaymentMethods(methods);

  if (!normalized.length) {
    return null;
  }

  return normalized.map((method) => PACKAGE_PAYMENT_METHOD_LABELS[method]).join(", ");
}

export function buildInstallmentText(fields: {
  installmentKind: PackageInstallmentKindValue;
  installmentCount: number | null;
  installmentAmount: number | null;
  downPaymentAmount: number | null;
  installmentText?: string | null;
  price?: number | null;
}): string {
  switch (fields.installmentKind) {
    case "INSTALLMENTS": {
      const count = fields.installmentCount;
      const amount = fields.installmentAmount;

      if (!count || amount == null || Number.isNaN(amount)) {
        return "";
      }

      return `${String(count).padStart(2, "0")}x de ${formatPackagePrice(amount)}`;
    }
    case "DOWN_PAYMENT": {
      const count = fields.installmentCount;
      const amount = fields.installmentAmount;
      const downPayment = fields.downPaymentAmount;

      if (
        !count ||
        amount == null ||
        Number.isNaN(amount) ||
        downPayment == null ||
        Number.isNaN(downPayment)
      ) {
        return "";
      }

      return `Entrada de ${formatPackagePrice(downPayment)} + ${String(count).padStart(2, "0")}x de ${formatPackagePrice(amount)}`;
    }
    case "PIX_CASH": {
      const amount =
        fields.installmentAmount != null && !Number.isNaN(fields.installmentAmount)
          ? fields.installmentAmount
          : fields.price;

      if (amount == null || Number.isNaN(amount)) {
        return "À vista via Pix";
      }

      return `${formatPackagePrice(amount)} à vista via Pix`;
    }
    case "CUSTOM":
      return fields.installmentText?.trim() ?? "";
    case "NONE":
    default:
      return "";
  }
}

export function suggestInstallmentAmount(
  price: number | null | undefined,
  count: number | null | undefined,
): number | null {
  if (
    price == null ||
    Number.isNaN(price) ||
    !count ||
    count <= 0 ||
    Number.isNaN(count)
  ) {
    return null;
  }

  return Math.round((price / count) * 100) / 100;
}

export function inferInstallmentFieldsFromText(
  installmentText: string | null | undefined,
): Pick<
  InstallmentFormFields,
  | "installmentKind"
  | "installmentCount"
  | "installmentAmount"
  | "downPaymentAmount"
  | "installmentText"
> {
  const text = installmentText?.trim() ?? "";

  if (!text) {
    return {
      installmentKind: "NONE",
      installmentCount: 12,
      installmentAmount: null,
      downPaymentAmount: null,
      installmentText: "",
    };
  }

  const downPaymentMatch = text.match(
    /entrada\s+de\s+R\$\s*([\d.]+(?:,\d{1,2})?)\s*\+\s*(\d{1,2})\s*x\s*(?:de\s*)?R\$\s*([\d.]+(?:,\d{1,2})?)/i,
  );

  if (downPaymentMatch) {
    return {
      installmentKind: "DOWN_PAYMENT",
      installmentCount: Number(downPaymentMatch[2]),
      installmentAmount: parseBrlNumber(downPaymentMatch[3]),
      downPaymentAmount: parseBrlNumber(downPaymentMatch[1]),
      installmentText: text,
    };
  }

  const pixMatch = text.match(
    /(?:R\$\s*([\d.]+(?:,\d{1,2})?)\s*)?à\s*vista\s*via\s*pix/i,
  );

  if (pixMatch) {
    return {
      installmentKind: "PIX_CASH",
      installmentCount: null,
      installmentAmount: pixMatch[1] ? parseBrlNumber(pixMatch[1]) : null,
      downPaymentAmount: null,
      installmentText: text,
    };
  }

  const installmentsMatch = text.match(
    /(\d{1,2})\s*x\s*(?:de\s*)?R\$\s*([\d.]+(?:,\d{1,2})?)/i,
  );

  if (installmentsMatch) {
    return {
      installmentKind: "INSTALLMENTS",
      installmentCount: Number(installmentsMatch[1]),
      installmentAmount: parseBrlNumber(installmentsMatch[2]),
      downPaymentAmount: null,
      installmentText: text,
    };
  }

  return {
    installmentKind: "CUSTOM",
    installmentCount: 12,
    installmentAmount: null,
    downPaymentAmount: null,
    installmentText: text,
  };
}

function parseBrlNumber(value: string): number {
  const normalized = value.replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}
