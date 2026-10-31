import type { ContentCta } from "@/config/content";

/**
 * Ligue quando os dados abaixo estiverem confirmados com o Cris. Desligado:
 * /blue-friday dá 404, some do menu/sitemap/hero e a API recusa cadastros.
 * O admin (Blue Friday → Pedidos/Ranking) continua acessível.
 */
export const BLUE_FRIDAY_CAMPAIGN_ENABLED = false;

export const blueFridayCampaign = {
  /** Janela de inscrições, `YYYY-MM-DD` no horário de Brasília (inclusivo). */
  signupStartDate: "2026-11-01",
  // TODO(Cris): fim das inscrições não confirmado; por ora vai até o dia da live.
  signupEndDate: "2026-11-16",
  /** Blue Live no YouTube. O link sai só no grupo VIP (pedido do Cris, 30/10). */
  liveDate: "2026-11-16",
  // TODO(Cris): horário da live. Enquanto for null, a página mostra só a data.
  liveTime: null as string | null,
  whatsappGroupUrl: "https://chat.whatsapp.com/LPBY9Gl0VKQHYA6NrJsbqx",
  /** Slug da promoção (painel → Promoções) cujos pacotes viram "Ofertas da Blue Live". */
  promotionSlug: "blue-friday",
  /** Só estes entram no ranking público; "Outro" aparece só no admin. */
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
