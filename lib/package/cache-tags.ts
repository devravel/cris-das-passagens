/** Tag de cache para pacotes em destaque na hero (invalidada ao salvar pacotes no admin). */
export const FEATURED_PACKAGES_CACHE_TAG = "featured-packages";

/** Tag de cache para seções de pacotes na landing page. */
export const HOMEPAGE_PACKAGES_CACHE_TAG = "homepage-packages";

/** Tag de cache para a listagem pública em /pacotes. */
export const PACKAGES_PAGE_CACHE_TAG = "packages-page";

export const PUBLIC_PACKAGE_CACHE_TAGS = [
  FEATURED_PACKAGES_CACHE_TAG,
  HOMEPAGE_PACKAGES_CACHE_TAG,
  PACKAGES_PAGE_CACHE_TAG,
] as const;
