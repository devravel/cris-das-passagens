import type { ContentCta } from "@/config/content";

/**
 * Ligada no lançamento (31/10, aprovado pelo Cris). Desligado:
 * /blue-friday dá 404, some do menu/sitemap/hero e a API recusa cadastros.
 * O admin (Blue Friday → Pedidos/Ranking) continua acessível.
 */
export const BLUE_FRIDAY_CAMPAIGN_ENABLED = true;

export const blueFridayCampaign = {
  /** Inscrições abrem à 0h deste dia (Brasília)… */
  signupStartDate: "2026-11-01",
  /**
   * …e fecham neste instante (ISO com fuso). null = sem data: seguem abertas até
   * alguém preencher aqui ou desligar a campanha acima (06/11, depois da live).
   */
  signupEndsAt: null as string | null,
  whatsappGroupUrl: "https://chat.whatsapp.com/LPBY9Gl0VKQHYA6NrJsbqx",
  /** Slug da promoção (painel → Promoções) cujos pacotes viram "Ofertas da Blue Friday". */
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
    "Somente passagem",
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
