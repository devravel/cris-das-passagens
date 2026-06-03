import type { Metadata, Viewport } from "next";

import { content } from "@/config/content";
import { siteConfig } from "@/config/site";
import { indexableRobots, noIndexRobots } from "@/lib/seo/robots";
import { absoluteUrl, buildCanonicalUrl, getSiteUrl } from "@/lib/seo/site-url";

const defaultDescription = content.meta.tagline;
const defaultOgImagePath = "/opengraph-image";

type OgImageInput =
  | string
  | {
      url: string;
      width?: number;
      height?: number;
      alt?: string;
    };

type CreateMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  ogType?: "website" | "article";
  ogImage?: OgImageInput;
  robots?: Metadata["robots"];
  keywords?: string[];
  publishedTime?: string;
  modifiedTime?: string;
};

function resolveOgImage(image: OgImageInput | undefined, alt: string) {
  if (!image) {
    return {
      url: defaultOgImagePath,
      width: 1200,
      height: 630,
      alt,
    };
  }

  if (typeof image === "string") {
    return {
      url: image.startsWith("http") ? image : absoluteUrl(image),
      width: 1200,
      height: 630,
      alt,
    };
  }

  return {
    url: image.url.startsWith("http") ? image.url : absoluteUrl(image.url),
    width: image.width ?? 1200,
    height: image.height ?? 630,
    alt: image.alt ?? alt,
  };
}

export function createMetadata({
  title,
  description = defaultDescription,
  path = "/",
  ogType = "website",
  ogImage,
  robots = indexableRobots,
  keywords,
  publishedTime,
  modifiedTime,
}: CreateMetadataOptions): Metadata {
  const canonicalUrl = buildCanonicalUrl(path);
  const resolvedImage = resolveOgImage(ogImage, description);

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: "pt_BR",
      type: ogType,
      images: [resolvedImage],
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [resolvedImage.url],
    },
  };
}

export function createArticleMetadata(input: {
  title: string;
  description: string;
  slug: string;
  coverImage: string;
  publishedAt: Date;
  updatedAt: Date;
  keywords?: string[];
}): Metadata {
  const path = `/blog/${input.slug}`;

  return createMetadata({
    title: `${input.title} | Blog`,
    description: input.description,
    path,
    ogType: "article",
    ogImage: {
      url: input.coverImage,
      alt: input.title,
    },
    keywords: input.keywords,
    publishedTime: input.publishedAt.toISOString(),
    modifiedTime: input.updatedAt.toISOString(),
  });
}

export function createNoIndexMetadata(input: {
  title: string;
  description?: string;
}): Metadata {
  return {
    title: input.title,
    description: input.description ?? defaultDescription,
    robots: noIndexRobots,
  };
}

export const rootViewport: Viewport = {
  themeColor: "#ffffff",
  viewportFit: "cover",
};

export const rootMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: defaultDescription,
  applicationName: siteConfig.name,
  category: "travel",
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: buildCanonicalUrl("/"),
    languages: {
      "pt-BR": buildCanonicalUrl("/"),
    },
  },
  robots: indexableRobots,
  openGraph: {
    title: siteConfig.name,
    description: defaultDescription,
    url: buildCanonicalUrl("/"),
    siteName: siteConfig.name,
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: defaultOgImagePath,
        width: 1200,
        height: 630,
        alt: defaultDescription,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: defaultDescription,
    images: [defaultOgImagePath],
  },
};

export {
  absoluteUrl,
  buildCanonicalUrl,
  getSiteUrl,
} from "@/lib/seo/site-url";
export { indexableRobots, noIndexRobots } from "@/lib/seo/robots";
export {
  createArticleJsonLd,
  createBlogItemListJsonLd,
  createBreadcrumbJsonLd,
  createFaqPageJsonLd,
  createOrganizationJsonLd,
  createWebsiteJsonLd,
} from "@/lib/seo/json-ld";
