import type { ContentCta } from "@/config/content";

/**
 * Ligue quando os dados abaixo estiverem confirmados com o Cris. Desligado:
 * /blue-friday dá 404, some do menu/sitemap/hero e a API recusa cadastros.
 * O admin (Blue Friday → Pedidos/Ranking) continua acessível.
 */
// DEMO (branch demo/blue-friday): ligado pro link de demonstração. Não mergear.
export const BLUE_FRIDAY_CAMPAIGN_ENABLED = true;

export const blueFridayCampaign = {
  /** Inscrições abrem à 0h deste dia (Brasília)… */
  // DEMO: aberto desde já pro Cris testar no preview; o real é "2026-11-01".
  signupStartDate: "2026-10-21",
  /** …e fecham neste instante: 17h do dia da live (Cris, 31/10). */
  signupEndsAt: "2026-11-05T17:00:00-03:00",
  /** Blue Live no YouTube (Cris, 31/10). O link sai só no grupo VIP (pedido do Cris, 30/10). */
  liveDate: "2026-11-05",
  /** `HH:mm` em Brasília; null mostra só a data. */
  liveTime: "20:00" as string | null,
  whatsappGroupUrl: "https://chat.whatsapp.com/LPBY9Gl0VKQHYA6NrJsbqx",
  /** Slug da promoção (painel → Promoções) cujos pacotes viram "Ofertas da Blue Live". */
  promotionSlug: "blue-friday",
  /**
   * Sugestões do campo de destino (o cliente digita o que quiser). Só estes
   * entram no ranking público; o resto aparece no admin, em "fora da lista".
   */
  destinations: [
    "Rio de Janeiro",
    "Gramado",
    "Florianópolis",
    "Porto Seguro",
    "Maceió",
    "Natal",
    "Fortaleza",
    "Salvador",
    "Foz do Iguaçu",
    "Fernando de Noronha",
    "Buenos Aires",
    "Santiago",
    "Orlando",
    "Cancún",
    "Punta Cana",
    "Lisboa",
  ],
  flexiblePeriods: ["Ainda em 2026", "1º semestre de 2027", "2º semestre de 2027"],
  /** Tipo de hospedagem, logo abaixo das datas (Cris, 31/10). */
  lodgingOptions: [
    "All inclusive",
    "Hotel/pousada com café da manhã",
    "Airbnb com cozinha",
    "Hostel",
    "Nenhuma opção",
  ],
  budgetRanges: [
    "Até R$ 3 mil",
    "R$ 3 a 6 mil",
    "R$ 6 a 10 mil",
    "R$ 10 a 20 mil",
    "Acima de R$ 20 mil",
  ],
} as const;

export const blueFridayNavItem = {
  label: "BLUE FRIDAY",
  href: "/blue-friday",
};

export const blueFridayHomeHeroCta = {
  label: "Garanta seu Passaporte Blue",
  href: "/blue-friday",
} satisfies ContentCta;
