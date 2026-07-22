/** Mantido no código para reativação futura da campanha no painel. */
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

export type AdminNavigationChild = {
  title: string;
  href: string;
};

export type AdminNavigationIcon =
  | "layout-dashboard"
  | "file-text"
  | "package"
  | "ticket-percent"
  | "mail"
  | "trophy";

export type AdminNavigationItem = {
  title: string;
  href: string;
  icon: AdminNavigationIcon;
  children?: readonly AdminNavigationChild[];
};

/** Item de navegação Rei da Copa — oculto visualmente; rotas e dados permanecem. */
export const reiDaCopaAdminNavItem = {
  title: "Rei da Copa",
  href: "/admin/rei-da-copa/inscricoes",
  icon: "trophy",
  children: reiDaCopaNavigationItems,
} as const satisfies AdminNavigationItem;

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
    title: "Newsletter",
    href: "/admin/newsletter",
    icon: "mail",
  },
] as const satisfies readonly AdminNavigationItem[];
