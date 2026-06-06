"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  CircleUser,
  TicketPercent,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";

import {
  adminNavigationItems,
  type AdminNavigationIcon,
  type AdminNavigationItem,
} from "@/lib/admin/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  SheetClose,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const adminNavigationIcons: Record<AdminNavigationIcon, LucideIcon> = {
  "layout-dashboard": LayoutDashboard,
  "file-text": FileText,
  package: Package,
  "ticket-percent": TicketPercent,
  trophy: Trophy,
};

type AdminSidebarProps = {
  mode?: "mobile" | "desktop" | "both";
};

function routeIsActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function routeGroupIsActive(pathname: string, item: AdminNavigationItem) {
  if ("children" in item && item.children) {
    return item.children.some((child) => routeIsActive(pathname, child.href));
  }

  return routeIsActive(pathname, item.href);
}

function SidebarNav({
  pathname,
  items = adminNavigationItems,
  onNavigate,
}: {
  pathname: string;
  items?: readonly AdminNavigationItem[];
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Navegação admin" className="space-y-1.5">
      {items.map((item) => {
        const hasChildren = "children" in item && Boolean(item.children?.length);
        const isGroupActive = routeGroupIsActive(pathname, item);
        const isActive = !hasChildren && routeIsActive(pathname, item.href);
        const Icon = adminNavigationIcons[item.icon];

        if (hasChildren && item.children) {
          return (
            <SidebarNavGroup
              key={item.href}
              item={item}
              pathname={pathname}
              isGroupActive={isGroupActive}
              onNavigate={onNavigate}
            />
          );
        }

        const linkNode = (
          <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "bg-brand/10 text-brand"
                : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon
              className={cn(
                "size-4 shrink-0",
                isActive
                  ? "text-brand"
                  : "text-muted-foreground transition-colors group-hover:text-foreground",
              )}
              aria-hidden
            />
            <span>{item.title}</span>
          </Link>
        );

        if (!onNavigate) {
          return <div key={item.href}>{linkNode}</div>;
        }

        return (
          <SheetClose key={item.href} asChild>
            {linkNode}
          </SheetClose>
        );
      })}
    </nav>
  );
}

function SidebarNavGroup({
  item,
  pathname,
  isGroupActive,
  onNavigate,
}: {
  item: AdminNavigationItem;
  pathname: string;
  isGroupActive: boolean;
  onNavigate?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(isGroupActive);
  const Icon = adminNavigationIcons[item.icon];
  const children = "children" in item ? item.children : undefined;

  if (!children) {
    return null;
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className={cn(
          "group flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          isGroupActive
            ? "bg-brand/10 text-brand"
            : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
        )}
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-3">
          <Icon
            className={cn(
              "size-4 shrink-0",
              isGroupActive
                ? "text-brand"
                : "text-muted-foreground transition-colors group-hover:text-foreground",
            )}
            aria-hidden
          />
          <span>{item.title}</span>
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform",
            isOpen ? "rotate-180" : "",
            isGroupActive ? "text-brand" : "text-muted-foreground",
          )}
          aria-hidden
        />
      </button>

      {isOpen ? (
        <div className="space-y-1 pl-3">
          {children.map((child) => {
            const isChildActive = routeIsActive(pathname, child.href);
            const childLink = (
              <Link
                href={child.href}
                onClick={onNavigate}
                className={cn(
                  "block rounded-xl px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  isChildActive
                    ? "bg-brand/10 text-brand"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
                aria-current={isChildActive ? "page" : undefined}
              >
                {child.title}
              </Link>
            );

            if (!onNavigate) {
              return <div key={child.href}>{childLink}</div>;
            }

            return (
              <SheetClose key={child.href} asChild>
                {childLink}
              </SheetClose>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export function AdminSidebar({ mode = "both" }: AdminSidebarProps) {
  const pathname = usePathname();
  const showDesktop = mode === "desktop" || mode === "both";
  const showMobile = mode === "mobile" || mode === "both";

  return (
    <>
      {showDesktop ? (
        <aside className="sticky top-6 hidden h-[calc(100dvh-3rem)] w-72 shrink-0 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur-sm lg:block">
          <div className="mb-4 flex items-center gap-2 border-b border-border/70 pb-4">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <CircleUser className="size-4" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Admin</p>
              <p className="text-xs text-muted-foreground">
                Cris das Passagens
              </p>
            </div>
          </div>
          <SidebarNav pathname={pathname} />
        </aside>
      ) : null}

      {showMobile ? (
        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-border/70 bg-card/70 px-3"
                aria-label="Abrir menu admin"
              >
                <Menu className="mr-1.5 size-4" aria-hidden />
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[min(100vw-2.5rem,19rem)] border-r border-border/70 bg-card/95 p-0 shadow-xl backdrop-blur-sm"
            >
              <SheetHeader className="border-b border-border/70 px-4 py-4 text-left">
                <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
                  <CircleUser className="size-4 text-brand" aria-hidden />
                  Menu admin
                </SheetTitle>
              </SheetHeader>

              <div className="p-3">
                <SidebarNav pathname={pathname} onNavigate={() => undefined} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      ) : null}
    </>
  );
}
