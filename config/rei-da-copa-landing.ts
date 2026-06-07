export const REI_DA_COPA_SECTION_IDS = {
  inicio: "inicio",
  comoParticipar: "como-participar",
  premiacao: "premiacao",
  ranking: "ranking",
  palavraChave: "palavra-chave",
  regulamento: "regulamento",
} as const;

export type ReiDaCopaSectionId =
  (typeof REI_DA_COPA_SECTION_IDS)[keyof typeof REI_DA_COPA_SECTION_IDS];

export const reiDaCopaNavItems = [
  { id: REI_DA_COPA_SECTION_IDS.inicio, label: "Início" },
  { id: REI_DA_COPA_SECTION_IDS.premiacao, label: "Premiação" },
  { id: REI_DA_COPA_SECTION_IDS.comoParticipar, label: "Como Participar" },
  { id: REI_DA_COPA_SECTION_IDS.palavraChave, label: "Palavra-chave" },
  { id: REI_DA_COPA_SECTION_IDS.ranking, label: "Ranking" },
  { id: REI_DA_COPA_SECTION_IDS.regulamento, label: "Regulamento" },
] as const;

export const reiDaCopaCampaignDefaults = {
  startDate: "2026-06-07",
  endDate: "2026-07-19",
  instagram: "@crisdaspassagens",
  website: "www.crisdaspassagens.com.br",
} as const;

export const reiDaCopaHeroTagline = {
  lead: "Acerte, participe e conquiste sua",
  highlight: "próxima viagem!",
} as const;

export const reiDaCopaDailyParticipationReminder =
  "Participe todos os dias e acumule coroas!";

export type ReiDaCopaHowToStep = {
  step: number;
  title: string;
  description: string;
};

/** Passos principais — artes principal e detalhada (Como Participar). */
export const reiDaCopaHowToSteps: ReiDaCopaHowToStep[] = [
  {
    step: 1,
    title: "Acesse",
    description: "Se inscreva aqui e confira o regulamento.",
  },
  {
    step: 2,
    title: "Siga e compartilhe",
    description:
      "Siga o @crisdaspassagens no Instagram e compartilhe a publicação oficial nos stories, marcando o perfil.",
  },
  {
    step: 3,
    title: "Comente",
    description: "Comente o placar do jogo oficial no post do dia.",
  },
  {
    step: 4,
    title: "Acumule coroas",
    description:
      "Suba no ranking, complete missões e dispute prêmios incríveis!",
  },
];

export const reiDaCopaParticipationConfirmationMessage =
  "Você receberá uma mensagem de inscrição.";

/** Formas de acumular coroas — arte principal (Quem será o Rei da Copa?). */
export const reiDaCopaEngagementActions = [
  "Dê seu palpite nos jogos.",
  "Participe das missões diárias.",
  "Marque amigos e ganhe mais coroas.",
  "Solicite orçamentos e ganhe pontos extras.",
] as const;

/** Bloco "Formas de acumular coroas" na seção Como Participar. */
export const reiDaCopaShowEngagementActions = false;

export const reiDaCopaInstagramHashtag = "#reidacopa" as const;

export type ReiDaCopaScoringRule = {
  action: string;
  points: string;
  note?: string;
};

const reiDaCopaScoringRuleNote = `Use a hashtag ${reiDaCopaInstagramHashtag} para validar seu comentário. Válido até o apito inicial do jogo.`;

/** Sistema de coroas — arte detalhada. */
export const reiDaCopaScoringRules: ReiDaCopaScoringRule[] = [
  {
    action: "Comente o placar",
    points: "05 coroas",
    note: reiDaCopaScoringRuleNote,
  },
  {
    action: "Acertar o vencedor",
    points: "10 coroas",
    note: reiDaCopaScoringRuleNote,
  },
  {
    action: "Acertar o placar exato",
    points: "20 coroas",
    note: reiDaCopaScoringRuleNote,
  },
];

export const reiDaCopaScoringReminder =
  "Quanto mais você participa, mais coroas você ganha!";

export const reiDaCopaScoringCommentExample = {
  heading: "Exemplo de comentário válido:",
  comment: `Brasil vence 1x0 ${reiDaCopaInstagramHashtag}.`,
} as const;

export type ReiDaCopaMissionNote =
  | string
  | {
      textBeforeLink?: string;
      linkLabel: string;
      linkHref: string;
      textAfterLink?: string;
    };

export type ReiDaCopaMission = {
  action: string;
  reward: string;
  note?: ReiDaCopaMissionNote;
};

/** Missões — arte detalhada. */
export const reiDaCopaMissions: ReiDaCopaMission[] = [
  {
    action:
      "Compartilhar BANNER OFICIAL nos stories e marcar @crisdaspassagens",
    reward: "40 coroas",
    note: "Máximo uma pontuação por dia.",
  },
  {
    action: "Palavra-chave",
    reward: "100 coroas",
    note: {
      textBeforeLink: "Encontre a palavra-chave.",
      linkLabel: "Envie aqui",
      linkHref: `#${REI_DA_COPA_SECTION_IDS.palavraChave}`,
      textAfterLink: ". Uma por dia. Não cumulativa.",
    },
  },
  {
    action: "Comprar passagem nacional",
    reward: "100 coroas",
    note: "Informe o @ do Insta ou seu número do Rei da Copa no final da compra para participar.",
  },
  {
    action: "COMPRAR pacote nacional",
    reward: "200 coroas",
    note: "Informe o @ do Insta ou seu número do Rei da Copa no final da compra para participar.",
  },
  {
    action: "COMPRAR passagem internacional",
    reward: "300 coroas",
    note: "Informe o @ do Insta ou seu número do Rei da Copa no final da compra para participar.",
  },
  {
    action: "COMPRAR pacote internacional",
    reward: "400 coroas",
    note: "Informe o @ do Insta ou seu número do Rei da Copa no final da compra para participar.",
  },
];

export const reiDaCopaDebateRaizYoutubeUrl =
  "https://www.youtube.com/@debateraiz" as const;

export const reiDaCopaKeywordInfo = {
  description: "Palavra-chave divulgada diariamente no programa Debate Raiz.",
  reward: "100 coroas",
} as const;

export type ReiDaCopaSectionIntro = ReiDaCopaMissionNote;

export const reiDaCopaSectionIntros: {
  ranking: ReiDaCopaSectionIntro;
  palavraChave: ReiDaCopaSectionIntro;
} = {
  ranking: "Acompanhe o ranking atualizado.",
  palavraChave: {
    textBeforeLink: "Divulgada diariamente no programa",
    linkLabel: "Debate Raiz",
    linkHref: reiDaCopaDebateRaizYoutubeUrl,
    textAfterLink: ".",
  },
};

/** Banner "Prêmios toda semana!" na seção Premiação. */
export const reiDaCopaShowWeeklyPrizeBanner = false;

export const reiDaCopaDefaultPrizes = {
  weekly: "Prêmios toda semana!",
  first: "PIX de R$ 1.000",
  second: "Mala de viagem ou valor equivalente em PIX.",
  third: "Voucher de desconto",
  tiebreaker:
    "Em caso de empate será realizado um sorteio simples de desempate.",
} as const;

export const reiDaCopaCampaignFooterMessages = {
  passion:
    "A Copa é dentro e fora de campo! Aqui, sua paixão por futebol pode te levar para o mundo!",
} as const;

export function getReiDaCopaInstagramUrl(handle: string) {
  return `https://www.instagram.com/${handle.replace(/^@/, "")}/`;
}

/** Observações exibidas abaixo do lembrete em Sistema de coroas. */
export const reiDaCopaScoringFootnotes: readonly ReiDaCopaMissionNote[] = [
  {
    textBeforeLink: "* Confira o jogo válido no",
    linkLabel: reiDaCopaCampaignDefaults.instagram,
    linkHref: getReiDaCopaInstagramUrl(reiDaCopaCampaignDefaults.instagram),
    textAfterLink: ".",
  },
  "* Confira se o jogo que está concorrendo na promoção.",
];

/** Texto complementar exibido quando não há regulamento customizado no admin. */
export const reiDaCopaDefaultRegulation = `Período da promoção
Válido entre os dias 07/06/26 até 19/07/26.

Desempate
Em caso de empate será realizado um sorteio simples de desempate.`;

export const reiDaCopaSupplementaryInfo = {
  registration: {
    heading: "Inscrição",
    text: "Preencha o formulário de inscrição com seu telefone e @ do Instagram corretos, para confirmar participação.",
  },
  dailyKeyword: {
    heading: "Palavra-chave",
    items: [
      "Palavra-chave só será contabilizada se enviada no site até as 23:59 do dia vigente.",
      "Não cumulativa.",
    ],
  },
  period: {
    heading: "Período da campanha",
    text: "Válido entre os dias 07/06/2026 até 19/07/2026.",
  },
  tiebreaker: {
    heading: "Desempate",
    text: reiDaCopaDefaultPrizes.tiebreaker,
  },
  questions: {
    heading: "Dúvidas",
    textBeforeLink: "Em caso de dúvidas, entre em",
    linkLabel: "contato conosco",
    textAfterLink: ".",
  },
} as const;
