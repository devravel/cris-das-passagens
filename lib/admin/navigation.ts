import { FileText, LayoutDashboard, Megaphone } from "lucide-react";

export const adminNavigationItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Blogs",
    href: "/admin/blogs",
    icon: FileText,
  },
  {
    title: "Promotions",
    href: "/admin/promotions",
    icon: Megaphone,
  },
] as const;

export type AdminNavigationItem = (typeof adminNavigationItems)[number];
