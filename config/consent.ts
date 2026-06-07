/**
 * Textos do banner e modal de consentimento LGPD.
 * Edite aqui para alterar copy sem tocar nos componentes.
 */
export const consentCopy = {
  banner: {
    text: "Utilizamos cookies e tecnologias semelhantes para melhorar sua experiência, personalizar conteúdo e analisar o tráfego do site. Você pode aceitar ou recusar.",
    accept: "Aceitar",
    reject: "Recusar",
    ariaLabel: "Consentimento de cookies e privacidade",
  },
  modal: {
    title: "Preferências de cookies",
    description:
      "Escolha quais categorias de cookies e tecnologias você permite. Cookies necessários são sempre ativos para o funcionamento básico do site.",
    save: "Salvar preferências",
    acceptAll: "Aceitar todos",
    rejectAll: "Recusar opcionais",
    privacyLink: "Política de Privacidade",
  },
  categories: {
    necessary: {
      id: "necessary" as const,
      label: "Necessários",
      description:
        "Essenciais para o funcionamento do site, como sessão administrativa e preferências de consentimento. Sempre ativos.",
      required: true,
    },
    analytics: {
      id: "analytics" as const,
      label: "Analytics",
      description:
        "Permitem exibir avaliações do Google via widget Elfsight e, no futuro, medir visitas e desempenho do site.",
      required: false,
    },
    marketing: {
      id: "marketing" as const,
      label: "Marketing",
      description:
        "Permitem remarketing e medição de conversões via Meta Pixel (Facebook), incluindo eventos de navegação e cliques em WhatsApp.",
      required: false,
    },
  },
  footerLink: "Preferências de cookies",
} as const;
