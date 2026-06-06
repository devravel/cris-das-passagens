const CAMPAIGN_TIME_ZONE = "America/Sao_Paulo";

export type ReiDaCopaCampaignWindow = {
  startDate: string | null;
  endDate: string | null;
};

export const REI_DA_COPA_CAMPAIGN_CLOSED_MESSAGE =
  "A campanha não está aceitando inscrições ou envios no momento.";

function getDatePartsInSaoPaulo(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: CAMPAIGN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  if (!year || !month || !day) {
    throw new Error("Não foi possível determinar a data da campanha.");
  }

  return { year, month, day };
}

export function getCampaignDateKey(date = new Date()) {
  const { year, month, day } = getDatePartsInSaoPaulo(date);
  return `${year}-${month}-${day}`;
}

export function getCampaignDayRange(date = new Date()) {
  const dateKey = getCampaignDateKey(date);

  return {
    start: new Date(`${dateKey}T00:00:00.000-03:00`),
    end: new Date(`${dateKey}T23:59:59.999-03:00`),
  };
}

export function isCampaignOpen(window: ReiDaCopaCampaignWindow, date = new Date()) {
  const currentDateKey = getCampaignDateKey(date);

  if (window.startDate && currentDateKey < window.startDate) {
    return false;
  }

  if (window.endDate && currentDateKey > window.endDate) {
    return false;
  }

  return true;
}
