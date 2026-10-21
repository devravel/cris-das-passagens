import { BLUE_FRIDAY_PAYMENT_OPTIONS } from "@/lib/blue-friday/rules";
import type { BlueFridayAdminRequest } from "@/lib/blue-friday/service";
import { formatBRL } from "@/lib/money";
import { formatPackageTravelDate, packageDateToIsoString } from "@/lib/package/dates";
import { formatParticipantPhoneForDisplay } from "@/lib/rei-da-copa/utils";

const createdAtFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

function formatDateRange(departure: Date | null, back: Date | null) {
  const from = formatPackageTravelDate(packageDateToIsoString(departure));
  const to = formatPackageTravelDate(packageDateToIsoString(back));
  return from && to ? `${from} a ${to}` : null;
}

function plural(count: number, singular: string, pluralForm: string) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}

/** Uma linha do pedido já em texto: mesma fonte pra tabela do painel e pro CSV. */
export function toBlueFridayRequestRow(request: BlueFridayAdminRequest) {
  const when =
    request.dateMode === "FLEXIBLE"
      ? `Flexível: ${request.flexiblePeriod ?? "—"} · ${plural(request.tripDays ?? 0, "dia", "dias")}`
      : [
          formatDateRange(request.option1Departure, request.option1Return),
          formatDateRange(request.option2Departure, request.option2Return),
        ]
          .filter(Boolean)
          .join(" ou ");

  const passengers = [
    plural(request.adults, "adulto", "adultos"),
    request.childrenAges.length
      ? `${plural(request.childrenAges.length, "criança", "crianças")} (${request.childrenAges.join(", ")} anos)`
      : null,
    request.babies ? plural(request.babies, "bebê", "bebês") : null,
  ]
    .filter(Boolean)
    .join(", ");

  return {
    id: request.id,
    passport: String(request.passport.number).padStart(5, "0"),
    name: request.passport.name,
    phone: formatParticipantPhoneForDisplay(request.passport.phone),
    whatsappUrl: `https://wa.me/55${request.passport.phone}`,
    destination: request.destination,
    departureCity: request.departureCity,
    when,
    passengers,
    budget: request.budgetRange,
    payment:
      BLUE_FRIDAY_PAYMENT_OPTIONS.find((option) => option.value === request.paymentPreference)?.label ??
      request.paymentPreference,
    targetPrice: request.targetPrice == null ? "—" : formatBRL(Number(request.targetPrice)),
    createdAt: createdAtFormatter.format(request.createdAt),
  };
}

export type BlueFridayRequestRow = ReturnType<typeof toBlueFridayRequestRow>;
