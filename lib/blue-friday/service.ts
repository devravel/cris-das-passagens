import { blueFridayCampaign } from "@/config/blue-friday-campaign";
import { Prisma } from "@/lib/generated/prisma/client";
import {
  buildDestinationRanking,
  createBlueFridayRequestSchema,
  normalizeBlueFridayPhone,
  type BlueFridayRequestData,
  type DestinationCount,
} from "@/lib/blue-friday/rules";
import { parseOptionalPackageDateInput } from "@/lib/package/dates";
import { prisma } from "@/lib/prisma";
import { getCampaignDateKey } from "@/lib/rei-da-copa/campaign-window";

export const BLUE_FRIDAY_PUBLIC_RANKING_SIZE = 10;
export const BLUE_FRIDAY_ADMIN_PAGE_SIZE = 20;

export function getBlueFridayRequestSchema() {
  return createBlueFridayRequestSchema(blueFridayCampaign, getCampaignDateKey());
}

/** Mesmo WhatsApp = mesmo passaporte (nome do 1º cadastro fica); cada envio vira um pedido. */
export async function createBlueFridayRequest(data: BlueFridayRequestData) {
  const passport = await prisma.blueFridayPassport.upsert({
    where: { phone: data.phone },
    create: { name: data.name, phone: data.phone },
    update: {},
    select: { id: true, number: true },
  });

  await prisma.blueFridayRequest.create({
    data: {
      passportId: passport.id,
      destination: data.destination,
      destinationKey: data.destinationKey,
      departureCity: data.departureCity,
      dateMode: data.dateMode,
      option1Departure: parseOptionalPackageDateInput(data.option1Departure ?? undefined),
      option1Return: parseOptionalPackageDateInput(data.option1Return ?? undefined),
      option2Departure: parseOptionalPackageDateInput(data.option2Departure ?? undefined),
      option2Return: parseOptionalPackageDateInput(data.option2Return ?? undefined),
      flexiblePeriod: data.flexiblePeriod,
      tripDays: data.tripDays,
      adults: data.adults,
      childrenAges: data.childrenAges,
      babies: data.babies,
      budgetRange: data.budgetRange,
      paymentPreference: data.paymentPreference,
      targetPrice: data.targetPrice,
    },
  });

  return { passportNumber: passport.number };
}

async function getDestinationCounts(): Promise<DestinationCount[]> {
  return prisma.$queryRaw<DestinationCount[]>`
    SELECT "destinationKey", MIN("destination") AS "destination", COUNT(DISTINCT "passportId")::int AS "count"
    FROM "blue_friday_requests"
    GROUP BY "destinationKey"
  `;
}

export async function getBlueFridayPublicRanking() {
  try {
    return buildDestinationRanking(await getDestinationCounts(), blueFridayCampaign.destinations, {
      publicOnly: true,
      limit: BLUE_FRIDAY_PUBLIC_RANKING_SIZE,
    });
  } catch (error) {
    console.error("[Blue Friday] Falha ao carregar o ranking:", error);
    return [];
  }
}

export async function getBlueFridayAdminRanking() {
  return buildDestinationRanking(await getDestinationCounts(), blueFridayCampaign.destinations);
}

const requestSelect = {
  id: true,
  destination: true,
  destinationKey: true,
  departureCity: true,
  dateMode: true,
  option1Departure: true,
  option1Return: true,
  option2Departure: true,
  option2Return: true,
  flexiblePeriod: true,
  tripDays: true,
  adults: true,
  childrenAges: true,
  babies: true,
  budgetRange: true,
  paymentPreference: true,
  targetPrice: true,
  createdAt: true,
  passport: { select: { number: true, name: true, phone: true } },
} as const;

export type BlueFridayAdminRequest = Prisma.BlueFridayRequestGetPayload<{ select: typeof requestSelect }>;

function buildRequestWhere(search?: string, destinationKey?: string): Prisma.BlueFridayRequestWhereInput {
  const term = search?.trim();
  const digits = term ? normalizeBlueFridayPhone(term) : "";
  const passportFilters: Prisma.BlueFridayPassportWhereInput[] = term
    ? [
        { name: { contains: term, mode: "insensitive" } },
        ...(digits ? [{ phone: { contains: digits } }] : []),
        ...(/^\d+$/.test(term) ? [{ number: Number(term) }] : []),
      ]
    : [];

  return {
    ...(destinationKey ? { destinationKey } : {}),
    ...(passportFilters.length ? { passport: { OR: passportFilters } } : {}),
  };
}

export async function listBlueFridayRequests(params: { page: number; search?: string; destinationKey?: string }) {
  const where = buildRequestWhere(params.search, params.destinationKey);
  const [total, items] = await Promise.all([
    prisma.blueFridayRequest.count({ where }),
    prisma.blueFridayRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (params.page - 1) * BLUE_FRIDAY_ADMIN_PAGE_SIZE,
      take: BLUE_FRIDAY_ADMIN_PAGE_SIZE,
      select: requestSelect,
    }),
  ]);

  return { items, total, totalPages: Math.max(1, Math.ceil(total / BLUE_FRIDAY_ADMIN_PAGE_SIZE)) };
}

export async function exportBlueFridayRequests() {
  return prisma.blueFridayRequest.findMany({ orderBy: { createdAt: "asc" }, select: requestSelect });
}
