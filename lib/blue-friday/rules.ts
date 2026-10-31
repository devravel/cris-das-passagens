import { z } from "zod";

/**
 * Regras puras do Blue Friday (formulário, chave de destino, ranking). Sem
 * imports `@/` pra rodar no `node lib/blue-friday/blue-friday.test.mjs`.
 */

export const BLUE_FRIDAY_PAYMENT_OPTIONS = [
  { value: "PIX", label: "Pix" },
  { value: "CREDIT_CARD", label: "Cartão de crédito" },
  { value: "BOLETO", label: "Boleto" },
] as const;

export type BlueFridayPaymentPreferenceValue = (typeof BLUE_FRIDAY_PAYMENT_OPTIONS)[number]["value"];

export const BLUE_FRIDAY_MAX_PEOPLE = 9;

export type BlueFridayOptions = {
  destinations: readonly string[];
  flexiblePeriods: readonly string[];
  budgetRanges: readonly string[];
};

/** "  São   Paulo " → "sao paulo": agrupa "Gramado", "gramado" e "Grâmado". */
export function normalizeDestinationKey(destination: string): string {
  return destination
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

/** Mesma regra de `lib/rei-da-copa/utils.ts` (aqui sem alias): só dígitos, sem o 55. */
export function normalizeBlueFridayPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("55") && digits.length >= 12 ? digits.slice(2) : digits;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const optionalIsoDate = z.string().trim().refine((v) => v === "" || ISO_DATE.test(v), "Data inválida.");

/**
 * `todayKey` (`YYYY-MM-DD`, Brasília) entra por parâmetro: o mesmo schema roda
 * no navegador e na API, e o teste fixa o "hoje".
 */
export function createBlueFridayRequestSchema(options: BlueFridayOptions, todayKey: string) {
  return z
    .object({
      name: z.string().trim().min(3, "Informe nome e sobrenome.").max(120),
      phone: z
        .string()
        .transform(normalizeBlueFridayPhone)
        .refine((v) => /^\d{11}$/.test(v) && v[2] === "9", "Informe um celular no formato (DD) 9XXXX-XXXX."),
      departureCity: z.string().trim().min(2, "Informe a cidade ou aeroporto de saída.").max(80),
      destination: z.string().trim().min(2, "Informe o destino.").max(80),
      dateMode: z.enum(["SPECIFIC", "FLEXIBLE"]),
      option1Departure: optionalIsoDate,
      option1Return: optionalIsoDate,
      option2Departure: optionalIsoDate,
      option2Return: optionalIsoDate,
      flexiblePeriod: z.string().trim(),
      tripDays: z.number().int().min(1, "Mínimo de 1 dia.").max(60, "Máximo de 60 dias.").nullable(),
      adults: z.number().int().min(1, "Pelo menos 1 adulto.").max(BLUE_FRIDAY_MAX_PEOPLE),
      childrenAges: z
        .array(
          z
            .number()
            .int()
            .min(2, "Informe a idade de cada criança (2 a 17 anos).")
            .max(17, "Informe a idade de cada criança (2 a 17 anos)."),
        )
        .max(BLUE_FRIDAY_MAX_PEOPLE),
      babies: z.number().int().min(0).max(BLUE_FRIDAY_MAX_PEOPLE),
      budgetRange: z.string().refine((v) => options.budgetRanges.includes(v), "Escolha uma faixa de orçamento."),
      paymentPreference: z.enum(["PIX", "CREDIT_CARD", "BOLETO"], "Escolha a forma de pagamento."),
      targetPrice: z.number().positive("Informe um valor maior que zero.").max(1_000_000).nullable(),
      /** Honeypot: humano não vê, bot preenche. */
      website: z.string().max(200).optional(),
    })
    // `when`: valida as datas mesmo com outros campos errados (todos os erros de uma vez).
    .superRefine(
      (data, ctx) => {
        const issue = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });

        if (data.dateMode === "FLEXIBLE") {
          if (!options.flexiblePeriods.includes(data.flexiblePeriod)) issue("flexiblePeriod", "Escolha o período.");
          if (data.tripDays == null) issue("tripDays", "Informe quantos dias.");
          return;
        }

        // Opção 1 obrigatória; opção 2 é as duas datas ou nenhuma.
        const ranges = [
          ["option1Departure", "option1Return", true],
          ["option2Departure", "option2Return", false],
        ] as const;

        for (const [departureKey, returnKey, required] of ranges) {
          const departure = data[departureKey];
          const back = data[returnKey];

          if (!departure && !back && !required) continue;
          if (!departure) issue(departureKey, "Informe a data de ida.");
          if (!back) issue(returnKey, "Informe a data de volta.");
          if (departure && departure < todayKey) issue(departureKey, "A ida precisa ser a partir de hoje.");
          if (departure && back && back < departure) issue(returnKey, "A volta precisa ser depois da ida.");
        }
      },
      { when: (payload) => typeof payload.value === "object" && payload.value !== null },
    )
    .transform((data) => {
      const isFlexible = data.dateMode === "FLEXIBLE";
      const orNull = (value: string) => (!isFlexible && value) || null;

      return {
        ...data,
        destinationKey: normalizeDestinationKey(data.destination),
        option1Departure: orNull(data.option1Departure),
        option1Return: orNull(data.option1Return),
        option2Departure: orNull(data.option2Departure),
        option2Return: orNull(data.option2Return),
        flexiblePeriod: isFlexible ? data.flexiblePeriod : null,
        tripDays: isFlexible ? data.tripDays : null,
        paymentPreference: data.paymentPreference as BlueFridayPaymentPreferenceValue,
      };
    });
}

export type BlueFridayRequestInput = z.input<ReturnType<typeof createBlueFridayRequestSchema>>;
export type BlueFridayRequestData = z.output<ReturnType<typeof createBlueFridayRequestSchema>>;

export type DestinationCount = {
  destinationKey: string;
  /** Um dos textos digitados para essa chave (rótulo de "Outro" no admin). */
  destination: string;
  /** Pessoas (passaportes) distintas. */
  count: number;
};

export type RankingEntry = {
  position: number;
  destinationKey: string;
  destination: string;
  count: number;
  inList: boolean;
};

/**
 * Mais pedidos primeiro (empate: ordem alfabética). `publicOnly` deixa só a
 * lista da config, com o rótulo dela; o admin vê tudo.
 */
export function buildDestinationRanking(
  counts: readonly DestinationCount[],
  destinations: readonly string[],
  { publicOnly = false, limit }: { publicOnly?: boolean; limit?: number } = {},
): RankingEntry[] {
  const labels = new Map(destinations.map((label) => [normalizeDestinationKey(label), label]));

  return counts
    .map((row) => ({
      destinationKey: row.destinationKey,
      destination: labels.get(row.destinationKey) ?? row.destination,
      count: row.count,
      inList: labels.has(row.destinationKey),
    }))
    .filter((row) => !publicOnly || row.inList)
    .sort((a, b) => b.count - a.count || a.destination.localeCompare(b.destination, "pt-BR"))
    .slice(0, limit)
    .map((row, index) => ({ position: index + 1, ...row }));
}
