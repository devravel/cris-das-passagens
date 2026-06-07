export const BLOG_POSTS_PER_PAGE = 6;

export function getBlogPageParam(
  value: string | string[] | undefined,
): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);

  if (!raw || Number.isNaN(parsed) || parsed < 1) {
    return 1;
  }

  return Math.floor(parsed);
}

export function getBlogPagePath(page: number): string {
  if (page <= 1) {
    return "/blog";
  }

  return `/blog?page=${page}`;
}

export function getBlogPageBreadcrumbItems(page: number) {
  const items = [
    { name: "Início", path: "/" },
    { name: "Blog", path: "/blog" },
  ] as Array<{ name: string; path: string }>;

  if (page > 1) {
    items.push({
      name: `Página ${page}`,
      path: getBlogPagePath(page),
    });
  }

  return items;
}
