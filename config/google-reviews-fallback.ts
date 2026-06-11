import { contentLinks } from "@/config/content";

export type GoogleReview = {
  id: string;
  name: string;
  rating: number;
  text: string;
  /** Data da avaliação — formato ISO (YYYY-MM-DD) ou texto livre. */
  date: string;
  /** URL opcional da foto de perfil. Se omitido, exibe iniciais. */
  avatar?: string;
};

export const googleReviewsFallbackConfig = {
  /** URL do botão "Avalie-nos no Google". */
  reviewUrl: contentLinks.googleBusinessProfile,
  reviewButtonLabel: "Avalie-nos no Google",
  reviews: [
    {
      id: "review-01",
      name: "Camila R.",
      rating: 5,
      text: "Consegui passagem muito mais barata do que nas buscas online e ainda tive suporte total até o embarque. Recomendo demais!",
      date: "2025-11-12",
    },
    {
      id: "review-02",
      name: "Ricardo M.",
      rating: 5,
      text: "Atendimento humanizado do começo ao fim. Quando meu voo atrasou, a equipe entrou em contato e resolveu tudo com tranquilidade.",
      date: "2025-10-28",
    },
    {
      id: "review-03",
      name: "Fernanda S.",
      rating: 5,
      text: "Primeira viagem internacional com criança e me senti segura em cada etapa. Pacote completo com hospedagem impecável.",
      date: "2025-10-05",
    },
    {
      id: "review-04",
      name: "João Pedro L.",
      rating: 5,
      text: "Excelente agência! Montaram um roteiro personalizado para a Europa e cuidaram de cada detalhe. Voltarei a contratar com certeza.",
      date: "2025-09-18",
    },
    {
      id: "review-05",
      name: "Patrícia A.",
      rating: 5,
      text: "Profissionais atenciosos e preços justos. A Cris das Passagens facilitou toda a documentação e me orientou sobre bagagem e conexões.",
      date: "2025-09-02",
    },
    {
      id: "review-06",
      name: "Marcos V.",
      rating: 4,
      text: "Ótima experiência na compra das passagens para Buenos Aires. O atendimento foi rápido e transparente. Só demorou um pouco a confirmação, mas resolveram bem.",
      date: "2025-08-21",
    },
    {
      id: "review-07",
      name: "Aline T.",
      rating: 5,
      text: "Viajei para Cancún em lua de mel e foi perfeito. Hospedagem, traslado e passagens tudo organizado. Não precisei me preocupar com nada.",
      date: "2025-08-07",
    },
    {
      id: "review-08",
      name: "Bruno H.",
      rating: 5,
      text: "Sempre compro minhas passagens aqui. Confiança total, parcelamento facilitado e suporte pelo WhatsApp quando preciso.",
      date: "2025-07-25",
    },
    {
      id: "review-09",
      name: "Juliana C.",
      rating: 5,
      text: "Equipe muito prestativa! Me ajudaram a remarcar o voo sem dor de cabeça quando precisei alterar as datas da viagem.",
      date: "2025-07-10",
    },
    {
      id: "review-10",
      name: "Eduardo F.",
      rating: 5,
      text: "Pacote para Orlando com ingressos inclusos. Tudo funcionou perfeitamente e o custo-benefício foi excelente comparado a outras agências.",
      date: "2025-06-22",
    },
    {
      id: "review-11",
      name: "Larissa M.",
      rating: 5,
      text: "Atendimento nota 10! Tiraram todas as minhas dúvidas sobre visto e vacinas antes da viagem aos Estados Unidos.",
      date: "2025-06-08",
    },
    {
      id: "review-12",
      name: "Carlos E.",
      rating: 4,
      text: "Boa agência, preços competitivos e equipe simpática. Recomendo para quem busca praticidade na hora de emitir passagens nacionais e internacionais.",
      date: "2025-05-30",
    },
    {
      id: "review-13",
      name: "Renata G.",
      rating: 5,
      text: "Viajei com minha família para o Nordeste e o pacote incluiu tudo que precisávamos. Hospedagem excelente e voos nos horários combinados.",
      date: "2025-05-14",
    },
    {
      id: "review-14",
      name: "Thiago N.",
      rating: 5,
      text: "Já é a terceira viagem que faço com a Cris das Passagens. Sempre entregam o que prometem e o pós-venda é diferenciado.",
      date: "2025-04-27",
    },
    {
      id: "review-15",
      name: "Vanessa P.",
      rating: 5,
      text: "Encontrei passagens para Lisboa com escala confortável e preço muito abaixo do que viajei sozinha online. Super indico!",
      date: "2025-04-10",
    },
    {
      id: "review-16",
      name: "André S.",
      rating: 5,
      text: "Profissionalismo e agilidade. Emitiram minhas passagens em poucas horas e ainda conseguiram um assento melhor no voo de volta.",
      date: "2025-03-22",
    },
    {
      id: "review-17",
      name: "Gabriela O.",
      rating: 5,
      text: "A melhor agência que já utilizei! Cuidaram de cada detalhe da minha viagem de formatura para o Caribe. Experiência incrível do início ao fim.",
      date: "2025-03-05",
    },
    {
      id: "review-18",
      name: "Felipe D.",
      rating: 5,
      text: "Transparência total nos valores, sem taxas escondidas. O atendimento pelo WhatsApp é rápido e sempre muito educado.",
      date: "2025-02-18",
    },
  ] satisfies GoogleReview[],
} as const;

export function computeGoogleReviewsStats(reviews: readonly GoogleReview[]) {
  const count = reviews.length;

  if (count === 0) {
    return { count: 0, average: 0 };
  }

  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  const average = Math.round((sum / count) * 10) / 10;

  return { count, average };
}
