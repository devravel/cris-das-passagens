import { contentLinks } from "@/config/content";
import { siteConfig } from "@/config/site";
import { absoluteUrl, buildCanonicalUrl, getSiteUrl } from "@/lib/seo/site-url";

export type JsonLd = Record<string, unknown>;

function buildPostalAddressJsonLd() {
  const { street, city, state, postalCode } = siteConfig.addressDetails;

  return {
    "@type": "PostalAddress",
    streetAddress: street,
    addressLocality: city,
    addressRegion: state,
    postalCode,
    addressCountry: "BR",
  };
}

function buildOrganizationSameAs(): string[] {
  const links = [
    getSiteUrl(),
    siteConfig.links.cadastur,
    siteConfig.links.instagram,
    siteConfig.links.facebook,
  ].filter((url): url is string => Boolean(url?.trim()));

  return [...new Set(links)];
}

function buildOrganizationContactPoints() {
  return [
    {
      "@type": "ContactPoint",
      telephone: siteConfig.phoneHref.replace("tel:", ""),
      contactType: "customer service",
      availableLanguage: ["Portuguese", "pt-BR"],
      areaServed: "BR",
    },
    {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: siteConfig.whatsapp,
      availableLanguage: ["Portuguese", "pt-BR"],
      areaServed: "BR",
    },
  ];
}

export function createOrganizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${getSiteUrl()}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: getSiteUrl(),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl(siteConfig.logo),
    },
    image: absoluteUrl(siteConfig.logo),
    description: siteConfig.description,
    telephone: siteConfig.phoneHref.replace("tel:", ""),
    taxID: siteConfig.addressDetails.cnpj,
    address: buildPostalAddressJsonLd(),
    areaServed: {
      "@type": "Country",
      name: "Brasil",
    },
    contactPoint: buildOrganizationContactPoints(),
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "certification",
      name: "CADASTUR",
      recognizedBy: {
        "@type": "Organization",
        name: "CADASTUR — Cadastro de Prestadores de Serviços Turísticos",
        url: contentLinks.cadastur,
      },
    },
    sameAs: buildOrganizationSameAs(),
  };
}

export function createWebsiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getSiteUrl()}/#website`,
    name: siteConfig.name,
    url: getSiteUrl(),
    description: siteConfig.description,
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
    inLanguage: "pt-BR",
  };
}

export function createArticleJsonLd(input: {
  title: string;
  description: string;
  slug: string;
  coverImage: string;
  publishedAt: Date;
  updatedAt: Date;
}): JsonLd {
  const url = buildCanonicalUrl(`/blog/${input.slug}`);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    image: [absoluteUrl(input.coverImage)],
    datePublished: input.publishedAt.toISOString(),
    dateModified: input.updatedAt.toISOString(),
    author: {
      "@id": `${getSiteUrl()}/#organization`,
    },
    publisher: {
      "@id": `${getSiteUrl()}/#organization`,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
    inLanguage: "pt-BR",
  };
}

export function createBreadcrumbJsonLd(
  items: Array<{ name: string; path: string }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: buildCanonicalUrl(item.path),
    })),
  };
}

export function createFaqPageJsonLd(
  items: Array<{ question: string; answer: string }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function createBlogItemListJsonLd(
  posts: Array<{ title: string; slug: string; excerpt: string }>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Blog em destaque — Cris das Passagens",
    description: "Artigos selecionados com dicas e orientações de viagem.",
    numberOfItems: posts.length,
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: post.title,
      description: post.excerpt,
      url: buildCanonicalUrl(`/blog/${post.slug}`),
    })),
  };
}
