"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Shield } from "lucide-react";

import type { AdminNavigationItem } from "@/lib/admin/navigation";
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

type AdminSidebarProps = {
  items: readonly AdminNavigationItem[];
  mode?: "mobile" | "desktop" | "both";
};

function routeIsActive(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarNav({
  pathname,
  items,
  onNavigate,
}: {
  pathname: string;
  items: readonly AdminNavigationItem[];
  onNavigate?: () => void;
}) {
  return (
    <nav aria-label="Navegacao admin" className="space-y-1.5">
      {items.map((item) => {
        const isActive = routeIsActive(pathname, item.href);
        const Icon = item.icon;
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

export function AdminSidebar({ items, mode = "both" }: AdminSidebarProps) {
  const pathname = usePathname();
  const showDesktop = mode === "desktop" || mode === "both";
  const showMobile = mode === "mobile" || mode === "both";

  return (
    <>
      {showDesktop ? (
        <aside className="sticky top-6 hidden h-[calc(100dvh-3rem)] w-72 shrink-0 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm backdrop-blur-sm lg:block">
          <div className="mb-4 flex items-center gap-2 border-b border-border/70 pb-4">
            <div className="flex size-9 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <Shield className="size-4" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Admin</p>
              <p className="text-xs text-muted-foreground">Cris das Passagens</p>
            </div>
          </div>
          <SidebarNav pathname={pathname} items={items} />
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
                  <Shield className="size-4 text-brand" aria-hidden />
                  Menu admin
                </SheetTitle>
              </SheetHeader>

              <div className="p-3">
                <SidebarNav pathname={pathname} items={items} onNavigate={() => undefined} />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      ) : null}
    </>
  );
}
