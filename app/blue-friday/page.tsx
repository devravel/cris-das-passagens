import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { BlueFridayLanding } from "@/components/blue-friday/blue-friday-landing";
import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { BLUE_FRIDAY_CAMPAIGN_ENABLED, blueFridayCampaign } from "@/config/blue-friday-campaign";
import { getBlueFridaySignupStatus } from "@/lib/blue-friday/rules";
import { getBlueFridayPublicRanking } from "@/lib/blue-friday/service";
import { getPromotionPageData } from "@/lib/promotion/queries";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Blue Friday",
  description:
    "A Black Friday chegou antes no Cris das Passagens. Garanta seu Passaporte Blue, diga para onde quer viajar e quanto quer pagar. A equipe monta a sua oferta.",
  path: "/blue-friday",
  keywords: ["Blue Friday", "Black Friday viagens", "Cris das Passagens", "ofertas de viagem", "Passaporte Blue"],
});

// Ranking e janela de inscrição atualizam a cada minuto.
export const revalidate = 60;

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
  const { signupStartDate, signupEndsAt } = blueFridayCampaign;

  return (
    <>
      <PageBreadcrumb
        items={[
          { name: "Início", path: "/" },
          { name: "Blue Friday", path: "/blue-friday" },
        ]}
      />
      <BlueFridayLanding
        signupStatus={getBlueFridaySignupStatus(signupStartDate, signupEndsAt)}
        signupStartLabel={signupStartDate.split("-").reverse().slice(0, 2).join("/")}
        ranking={ranking}
        offers={offers}
      />
    </>
  );
}
