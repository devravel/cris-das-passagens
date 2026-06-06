export const reiDaCopaNavigationItems = [
  {
    title: "Inscrições",
    href: "/admin/rei-da-copa/inscricoes",
  },
  {
    title: "Ranking",
    href: "/admin/rei-da-copa/ranking",
  },
  {
    title: "Palavra-chave",
    href: "/admin/rei-da-copa/palavra-chave",
  },
] as const;

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
  {
    title: "Cupons",
    href: "/admin/cupons",
    icon: "ticket-percent",
  },
  {
    title: "Rei da Copa",
    href: "/admin/rei-da-copa/inscricoes",
    icon: "trophy",
    children: reiDaCopaNavigationItems,
  },
] as const;

export type AdminNavigationIcon = (typeof adminNavigationItems)[number]["icon"];
export type AdminNavigationChild = (typeof reiDaCopaNavigationItems)[number];
export type AdminNavigationItem = (typeof adminNavigationItems)[number];
