import { contentLinks } from "@/config/content";
import { siteConfig } from "@/config/site";
import { absoluteUrl, buildCanonicalUrl, getSiteUrl } from "@/lib/seo/site-url";

export type JsonLd = Record<string, unknown>;

export function createOrganizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": `${getSiteUrl()}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: getSiteUrl(),
    logo: absoluteUrl(siteConfig.logo),
    description: siteConfig.description,
    telephone: siteConfig.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: siteConfig.addressDetails.street,
      addressLocality: siteConfig.addressDetails.city,
      addressRegion: siteConfig.addressDetails.state,
      addressCountry: "BR",
    },
    sameAs: [contentLinks.whatsapp, contentLinks.cadastur].filter(Boolean),
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
      "@type": "Organization",
      name: siteConfig.name,
      url: getSiteUrl(),
    },
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl(siteConfig.logo),
      },
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
