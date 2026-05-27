export const adminNavigationItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: "layout-dashboard",
  },
  {
    title: "Blogs",
    href: "/admin/blogs",
    icon: "file-text",
  },
  {
    title: "Pacotes",
    href: "/admin/packages",
    icon: "package",
  },
] as const;

export type AdminNavigationIcon = (typeof adminNavigationItems)[number]["icon"];
export type AdminNavigationItem = (typeof adminNavigationItems)[number];
