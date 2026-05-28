export type ContentCta = {
  label: string;
  href: string;
};

export type ProcessStep = {
  step: number;
  title: string;
  description: string;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type BlogPostPreview = {
  title: string;
  href: string;
  excerpt: string;
  category: string;
  image: string;
};

export type ServiceItem = {
  label: string;
};

export type QuickActionItem = {
  title: string;
  description: string;
  href: string;
  ctaLabel: string;
  external?: boolean;
  /** Identificador estável para ícone e estilo (ex.: whatsapp). */
  id: "passagens" | "pacotes" | "hospedagem" | "whatsapp";
};

export type FinalCtaAction = {
  id: "phone" | "whatsapp" | "quote";
  title: string;
  description: string;
  href: string;
  external?: boolean;
};

export type TestimonialItem = {
  quote: string;
  author: string;
  destination: string;
  rating?: number;
  source?: "google" | "instagram";
};

/** Links reutilizados nos CTAs — centralizados para evitar hardcode nos componentes. */
export const contentLinks = {
  blog: "/blog",
  quote: "/contato",
  whatsapp: "https://wa.me/5551992519187",
  cadastur: "https://www.cadastur.turismo.gov.br",
} as const;

export const content = {
  meta: {
    tagline: "O melhor suporte para o seu sonho. Assessoria completa.",
  },

  hero: {
    headline: "Mais que uma viagem, Um Sonho!",
    services: [
      { label: "Viagens Nacionais" },
      { label: "Internacionais" },
      { label: "Pacotes" },
      { label: "Hospedagem" },
      { label: "Seguros" },
    ] satisfies ServiceItem[],
    primaryCta: {
      label: "Faça uma cotação agora",
      href: contentLinks.quote,
    } satisfies ContentCta,
    secondaryCta: {
      label: "Confira todos os Pacotes",
      href: "/pacotes",
    } satisfies ContentCta,
  },

  quickActions: {
    title: "Principais serviços",
    subtitle: "Tudo o que você precisa para a sua próxima viagem.",
    items: [
      {
        id: "passagens",
        title: "Passagens Promocionais",
        description: "As melhores ofertas de passagens aéreas.",
        href: contentLinks.quote,
        ctaLabel: "Cotar agora",
      },
      {
        id: "pacotes",
        title: "Pacotes Internacionais",
        description:
          "Roteiros completos com assessoria do início ao fim da viagem.",
        href: "/pacotes",
        ctaLabel: "Ver pacotes",
      },
      {
        id: "hospedagem",
        title: "Hospedagem",
        description: "Hotéis e estadias ideais em seu destino.",
        href: contentLinks.quote,
        ctaLabel: "Solicitar cotação",
      },
      {
        id: "whatsapp",
        title: "Atendimento WhatsApp",
        description:
          "Fale com nossa equipe e tire suas dúvidas em poucos minutos.",
        href: contentLinks.whatsapp,
        ctaLabel: "Falar agora",
        external: true,
      },
    ] satisfies QuickActionItem[],
  },

  about: {
    title: "Sobre a Cris das Passagens",
    paragraphs: [
      "Nasceu e permanece com um único propósito: ajudar pessoas a viajarem tranquilamente: Sem dores de cabeça e com atendimento do início ao fim da sua viagem.",
      "Aqui nosso foco é facilitar sua vida na hora de viajar. Cuidamos de cada detalhe para que você tenha uma experiência sem estresse, com economia, praticidade e suporte de verdade.",
    ],
    cta: {
      label: "Quero Cotar AGORA!",
      href: contentLinks.quote,
    } satisfies ContentCta,
  },

  support: {
    title: "Suporte Total",
    intro: "Viajar com segurança, praticidade e suporte completo? Você pode!",
    paragraphs: [
      "O Cris das Passagens oferece muito mais do que apenas a emissão de passagens aéreas.",
      "Aqui, você conta com suporte completo do início ao fim da sua viagem, com uma equipe experiente e atenciosa, sempre pronta para te ajudar.",
      "Com o Cris das Passagens, você viaja com economia, apoio e confiança.",
    ],
    closing:
      "Fale com a gente e descubra como é viajar com quem realmente se importa com você.",
    highlights: [
      {
        title: "Atendimento humanizado",
        description:
          "Você fala com pessoas reais que entendem sua necessidade e cuidam de cada detalhe da viagem.",
      },
      {
        title: "Suporte jurídico",
        description:
          "Mais tranquilidade em casos de voos cancelados, atrasos ou problemas com companhias aéreas.",
      },
    ],
    cta: {
      label: "Fale no WhatsApp",
      href: contentLinks.whatsapp,
    } satisfies ContentCta,
  },

  process: {
    title: "Saiba como funciona",
    steps: [
      {
        step: 1,
        title: "Passo 01",
        description:
          "Informe os detalhes da sua viagem respondendo a algumas perguntas no atendimento.",
      },
      {
        step: 2,
        title: "Passo 02",
        description:
          "O atendente responsável por seu atendimento o responderá o mais rápido possível para te ajudar.",
      },
      {
        step: 3,
        title: "Passo 03",
        description:
          "Buscaremos as melhores ofertas para atender as suas necessidades.",
      },
      {
        step: 4,
        title: "Passo 04",
        description:
          "Damos todo o suporte necessário para auxiliar você durante a sua viagem do início ao fim.",
      },
    ] satisfies ProcessStep[],
    cta: {
      label: "Quero Cotar AGORA!",
      href: contentLinks.quote,
    } satisfies ContentCta,
  },

  testimonials: {
    title: "Veja o que os Clientes têm a dizer",
    subtitle: "Muitos clientes já viveram essa experiência",
    items: [
      {
        quote:
          "Consegui passagem muito mais barata do que nas buscas online e ainda tive suporte total até o embarque. Recomendo demais!",
        author: "Camila R.",
        destination: "Miami, EUA",
        rating: 5,
        source: "google",
      },
      {
        quote:
          "Atendimento humanizado do começo ao fim. Quando meu voo atrasou, a equipe entrou em contato e resolveu tudo com tranquilidade.",
        author: "Ricardo M.",
        destination: "Lisboa, Portugal",
        rating: 5,
        source: "google",
      },
      {
        quote:
          "Primeira viagem internacional com criança e me senti segura em cada etapa. Pacote completo com hospedagem impecável.",
        author: "Fernanda S.",
        destination: "Cancún, México",
        rating: 5,
        source: "google",
      },
    ] satisfies TestimonialItem[],
  },

  socialProof: {
    title: "Confiança comprovada",
    subtitle: "Números reais de quem já viajou com a Cris das Passagens.",
    emissions: "800+",
    emissionsLabel: "emissões realizadas",
    clients: "2.000+",
    clientsLabel: "clientes atendidos",
    certificationLabel: "Certificação CADASTUR",
    reviewSources: "Google ou Instagram",
  },

  cadastur: {
    title: "Cris das Passagens é uma agência certificada pelo CADASTUR",
    paragraphs: [
      "Somos uma empresa comprometida com o turismo responsável e registrada no Ministério do Turismo.",
      "Cumprimos normas e exigências que garantem aos nossos clientes a confiança de que eles terão a melhor experiência de viagem.",
      "Garantimos segurança e qualidade nos serviços que oferecemos, com suporte para o que o nosso cliente precisar, a todo momento.",
      "Viajar com o Cris das Passagens é ter a certeza de que está contratando uma empresa legalizada e comprometida.",
    ],
    verification:
      "A autenticidade dessa informação pode ser verificada através do código acima (basta apontar a câmera) ou através de consulta no site do Governo Federal.",
    verifyUrl: contentLinks.cadastur,
    verifyUrlLabel: "www.cadastur.turismo.gov.br",
    qrCode: "/cadastur-qrcode.png",
    qrCodeAlt:
      "QR Code para verificar a certificação CADASTUR no site do Governo Federal",
  },

  faq: {
    title: "Perguntas frequentes",
    items: [
      {
        question: "Como funciona o trabalho do Cris das Passagens?",
        answer:
          "Nossa ideia sempre é conseguir um preço melhor do que a internet e garantir suporte e atendimento humanizado.",
      },
      {
        question: "Como vou receber minha passagem?",
        answer:
          "Você recebe seu ticket na hora, logo após a emissão, e tem acesso à sua reserva para compra de itens e gerenciamento da sua viagem.",
      },
      {
        question: "Vocês têm loja física?",
        answer:
          "No momento ainda não temos uma loja física; nosso atendimento é exclusivamente online.",
      },
      {
        question: "Não é golpe?",
        answer:
          "Temos mais de 800 emissões realizadas e mais de 2.000 clientes atendidos. Nas nossas redes sociais, como Google ou Instagram, você pode verificar diversos depoimentos de nossos clientes.",
      },
      {
        question: "Quais as formas de pagamento?",
        answer:
          "Além do Pix, aceitamos pagamento através de cartão de crédito e boleto bancário (consulte condições).",
      },
      {
        question: "Preciso ter milhas?",
        answer:
          "Não precisa. Algumas emissões são feitas através de milhas, mas você não precisa ter nenhuma milha ou ponto.",
      },
      {
        question: "E se eu precisar de suporte?",
        answer:
          "Estamos disponíveis para lhe auxiliar em diversos assuntos relacionados à sua viagem, até mesmo com suporte jurídico caso você precise.",
      },
    ] satisfies FaqItem[],
    cta: {
      label: "Quero Cotar AGORA!",
      href: contentLinks.quote,
    } satisfies ContentCta,
  },

  blog: {
    title: "Conheça nosso Blog",
    subtitle: "Dicas para sua próxima viagem.",
    posts: [
      {
        title: "Quando devo comprar a minha Passagem?",
        href: `${contentLinks.blog}/quando-comprar-passagem`,
        excerpt:
          "Entenda o melhor momento para garantir sua passagem e economizar de verdade na sua viagem.",
        category: "Passagens",
        image:
          "https://images.unsplash.com/photo-1586441133374-ed1cb4007a47?auto=format&fit=crop&w=900&q=80",
      },
      {
        title: "09 Motivos para comprar com o Cris",
        href: `${contentLinks.blog}/9-motivos-comprar-com-o-cris`,
        excerpt:
          "Descubra por que milhares de clientes confiam na Cris das Passagens para viajar com segurança.",
        category: "Dicas de viagem",
        image:
          "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=900&q=80",
      },
    ] satisfies BlogPostPreview[],
    cta: {
      label: "Ver Todos os Blogs",
      href: contentLinks.blog,
    } satisfies ContentCta,
  },

  blogPost: {
    vipCta: {
      eyebrow: "Grupo VIP",
      headline: "Entre agora no grupo VIP de dicas",
      description:
        "Receba promoções exclusivas, alertas de passagens e dicas práticas para viajar melhor — direto no WhatsApp.",
      buttonLabel: "Entrar no grupo VIP",
      href: contentLinks.whatsapp,
    },
  },

  ctas: {
    quote: {
      label: "Quero Cotar AGORA!",
      href: contentLinks.quote,
    } satisfies ContentCta,
    quoteAlt: {
      label: "Faça Uma Cotação AGORA",
      href: contentLinks.quote,
    } satisfies ContentCta,
    whatsapp: {
      label: "Fale no WhatsApp",
      href: contentLinks.whatsapp,
    } satisfies ContentCta,
  },

  finalCta: {
    title: "Pronto para sua próxima viagem?",
    subtitle: "Solicite sua cotação agora mesmo.",
    footnote: "Atendimento humanizado · Pagamento facilitado",
    actions: [] satisfies FinalCtaAction[],
    primaryCta: {
      label: "Faça Uma Cotação AGORA",
      href: contentLinks.quote,
    } satisfies ContentCta,
  },

  contact: {
    legalName: "Cris das Passagens LTDA",
    cnpj: "19.816.664/0001-51",
    street: "Rua Colombo, 250",
    neighborhood: "Santa Luzia",
    city: "Osório",
    state: "RS",
    phone: "(51) 9 9251-9187",
    phoneHref: "tel:+5551992519187",
    whatsapp: contentLinks.whatsapp,
    formattedAddress: "Rua Colombo, 250 — Santa Luzia, Osório — RS",
  },
} as const;

export type SiteContent = typeof content;
