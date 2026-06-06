import type { Metadata } from "next";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { ReiDaCopaLanding } from "@/components/rei-da-copa/rei-da-copa-landing";
import { brandPageBreadcrumbs } from "@/config/navigation";
import {
  getReiDaCopaPublicRanking,
  getReiDaCopaPublicSettings,
} from "@/lib/rei-da-copa/queries";
import { createMetadata } from "@/lib/seo";

export const metadata: Metadata = createMetadata({
  title: "Rei da Copa 2026",
  description:
    "Participe da campanha Rei da Copa 2026 da Cris das Passagens. Cadastre-se, envie palavras-chave e acompanhe o ranking durante a Copa do Mundo.",
  path: "/rei-da-copa",
  keywords: [
    "Rei da Copa 2026",
    "Cris das Passagens",
    "promoção Copa do Mundo",
    "campanha viagens",
    "ranking",
    "palavra-chave",
  ],
});

export const revalidate = 60;

export default async function ReiDaCopaPage() {
  const [ranking, settings] = await Promise.all([
    getReiDaCopaPublicRanking(),
    getReiDaCopaPublicSettings(),
  ]);

  return (
    <>
      <div className="border-b border-border/60 bg-background">
        <div className="rei-da-copa-container">
          <PageBreadcrumb items={brandPageBreadcrumbs.reiDaCopa} className="mb-4 sm:mb-5" />
        </div>
      </div>
      <ReiDaCopaLanding ranking={ranking} settings={settings} />
    </>
  );
}
