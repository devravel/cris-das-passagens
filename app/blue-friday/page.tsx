import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlueFridayLanding } from "@/components/blue-friday/blue-friday-landing";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { BLUE_FRIDAY_CAMPAIGN_ENABLED, blueFridayCampaign } from "@/config/blue-friday-campaign";
import { getBlueFridaySignupStatus } from "@/lib/blue-friday/rules";
import { getBlueFridayPublicRanking } from "@/lib/blue-friday/service";
import { PACKAGE_SCHEDULE_TIME_ZONE } from "@/lib/package/dates";
import { getPromotionPageData } from "@/lib/promotion/queries";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Blue Friday",
  description:
    "A Black Friday chegou antes no Cris das Passagens. Garanta seu Passaporte Blue, diga para onde quer viajar e acompanhe as ofertas ao vivo na Blue Live.",
  path: "/blue-friday",
  keywords: ["Blue Friday", "Black Friday viagens", "Cris das Passagens", "ofertas de viagem", "Passaporte Blue"],
});

// Ranking e janela de inscrição atualizam a cada minuto.
export const revalidate = 60;

const liveFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  timeZone: PACKAGE_SCHEDULE_TIME_ZONE,
});

// "quinta-feira, 05/11, 17:00" → "quinta-feira, 05/11, às 17h"
const signupEndFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: PACKAGE_SCHEDULE_TIME_ZONE,
});

async function getOffers() {
  try {
    return (await getPromotionPageData(blueFridayCampaign.promotionSlug))?.packages ?? [];
  } catch (error) {
    console.error("[Blue Friday] Falha ao carregar as ofertas:", error);
    return [];
  }
}

export default async function BlueFridayPage() {
  if (!BLUE_FRIDAY_CAMPAIGN_ENABLED) {
    notFound();
  }

  const [ranking, offers] = await Promise.all([getBlueFridayPublicRanking(), getOffers()]);
  const { signupStartDate, signupEndsAt, liveDate, liveTime } = blueFridayCampaign;
  // "quinta-feira, 05/11" (+ " às 20h" quando o horário estiver na config)
  const liveLabel =
    liveFormatter.format(new Date(`${liveDate}T12:00:00-03:00`)) + (liveTime ? ` às ${liveTime.replace(/^(\d{2}):00$/, "$1h")}` : "");

  return (
    <>
      <PageBreadcrumb
        items={[
          { name: "Início", path: "/" },
          { name: "Blue Friday", path: "/blue-friday" },
        ]}
      />
      <BlueFridayLanding
        liveLabel={liveLabel}
        signupStatus={getBlueFridaySignupStatus(signupStartDate, signupEndsAt)}
        signupEndLabel={signupEndFormatter
          .format(new Date(signupEndsAt))
          .replace(/, (\d{2}):(\d{2})$/, (_, h, m) => `, às ${h}h${m === "00" ? "" : m}`)}
        signupStartLabel={signupStartDate.split("-").reverse().slice(0, 2).join("/")}
        ranking={ranking}
        offers={offers}
      />
    </>
  );
}
