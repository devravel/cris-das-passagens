"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { Menu } from "lucide-react";

import { navigation as defaultItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export type NavItem = {
  label: string;
  href: string;
};

export type NavbarCta = {
  label: string;
  href: string;
};

export type NavbarProps = {
  brand?: React.ReactNode;
  logoHref?: string;
  items?: NavItem[];
  cta?: NavbarCta | null;
  className?: string;
};

function routeIsActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({
  href,
  children,
  className,
  onNavigate,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const active = routeIsActive(pathname, href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "relative inline-block text-sm font-medium tracking-tight transition-colors duration-200",
        active
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {children}
      <span
        className={cn(
          "pointer-events-none absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-foreground/80 transition-transform duration-200 ease-out",
          active && "scale-x-100",
          !active && "group-hover:scale-x-100"
        )}
        aria-hidden
      />
    </Link>
  );
}

function DesktopNavLinks({ items }: { items: NavItem[] }) {
  return (
    <div className="hidden items-center gap-1 sm:flex">
      {items.map((item) => (
        <div key={item.href} className="group px-3 py-2">
          <NavLink href={item.href}>{item.label}</NavLink>
        </div>
      ))}
    </div>
  );
}

function MobileNavLinks({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <nav className="flex flex-col gap-1 p-2" aria-label="Navegação móvel">
      {items.map((item, index) => {
        const active = routeIsActive(pathname, item.href);
        const link = (
          <Link
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "block rounded-lg px-4 py-3.5 text-base font-medium tracking-tight transition-colors duration-200",
              active
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );

        if (reduceMotion) {
          return <div key={item.href}>{link}</div>;
        }

        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              duration: 0.22,
              delay: index * 0.045,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            {link}
          </motion.div>
        );
      })}
    </nav>
  );
}

export function Navbar({
  brand = siteConfig.name,
  logoHref = "/",
  items = defaultItems,
  cta = { label: "Fale connosco", href: "/contato" },
  className,
}: NavbarProps) {
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = React.useCallback(() => setMobileOpen(false), []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b transition-[box-shadow,background-color,border-color] duration-300",
        scrolled
          ? "border-border/80 bg-background/85 shadow-[0_1px_0_rgba(0,0,0,0.04)] supports-backdrop-filter:bg-background/70 supports-backdrop-filter:backdrop-blur-md"
          : "border-transparent bg-background/80 supports-backdrop-filter:bg-background/60 supports-backdrop-filter:backdrop-blur-md",
        className
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
        <Link
          href={logoHref}
          className="group flex shrink-0 items-center gap-2 rounded-md outline-none transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <span className="font-heading text-base font-semibold tracking-tight text-foreground transition-transform duration-200 ease-out group-hover:translate-y-px sm:text-[1.05rem]">
            {brand}
          </span>
        </Link>

        <DesktopNavLinks items={items} />

        <div className="flex items-center gap-2 sm:gap-3">
          {cta ? (
            <Button
              asChild
              size="sm"
              className="hidden rounded-lg shadow-none transition-[transform,box-shadow] duration-200 hover:-translate-y-px active:translate-y-0 sm:inline-flex"
            >
              <Link href={cta.href}>{cta.label}</Link>
            </Button>
          ) : null}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                className="shrink-0 rounded-lg border-border/80 bg-background/50 transition-[transform,background-color] duration-200 hover:bg-muted/80 active:scale-[0.98] sm:hidden"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="size-[18px]" strokeWidth={1.75} />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(100vw-2rem,22rem)] gap-0 border-l border-border/60 bg-popover/95 p-0 shadow-xl supports-backdrop-filter:backdrop-blur-md sm:max-w-sm"
            >
              <SheetHeader className="border-b border-border/50 px-6 py-5 text-left">
                <SheetTitle className="font-heading text-sm font-semibold text-muted-foreground">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <MobileNavLinks items={items} onNavigate={closeMobile} />
              {cta ? (
                <div className="border-t border-border/50 p-4">
                  <Button
                    asChild
                    className="w-full rounded-lg shadow-none transition-[transform] duration-200 active:scale-[0.99]"
                  >
                    <Link href={cta.href} onClick={closeMobile}>
                      {cta.label}
                    </Link>
                  </Button>
                </div>
              ) : null}
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
