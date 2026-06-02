"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, MessageCircle, Phone } from "lucide-react";

import { Container } from "@/components/layout/container";
import { navigation as defaultItems, navbarCta } from "@/config/navigation";
import { useMotionReady } from "@/hooks/use-motion-ready";
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
import { whatsappSolidButtonClassName } from "@/lib/whatsapp-styles";

export type NavItem = {
  label: string;
  href: string;
};

export type NavbarCta = {
  label: string;
  href: string;
  external?: boolean;
};

export type NavbarProps = {
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
        "group relative inline-flex items-center py-1 text-[0.9375rem] font-medium tracking-tight transition-colors duration-200",
        active
          ? "text-foreground"
          : "text-foreground/75 hover:text-foreground",
        className
      )}
    >
      {children}
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-foreground transition-transform duration-200 ease-out",
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
    <nav
      className="hidden items-center gap-6 xl:gap-8 lg:flex"
      aria-label="Navegação principal"
    >
      {items.map((item) => (
        <NavLink key={item.href} href={item.href}>
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}

function NavbarCtaButton({
  cta,
  className,
  onNavigate,
  compact = false,
}: {
  cta: NavbarCta;
  className?: string;
  onNavigate?: () => void;
  compact?: boolean;
}) {
  const whatsappStyles = cn(
    "rounded-lg font-semibold shadow-none",
    whatsappSolidButtonClassName
  );

  if (cta.external) {
    return (
      <Button
        asChild
        size={compact ? "icon-sm" : "default"}
        className={cn(
          "transition-colors duration-200",
          whatsappStyles,
          !compact && "h-9 px-5 text-sm",
          className
        )}
      >
        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onNavigate}
          aria-label={compact ? cta.label : undefined}
        >
          {compact ? (
            <MessageCircle className="size-[18px]" strokeWidth={1.75} aria-hidden />
          ) : (
            cta.label
          )}
        </a>
      </Button>
    );
  }

  return (
    <Button
      asChild
      size={compact ? "sm" : "sm"}
      className={cn(
        "rounded-lg bg-brand font-semibold text-brand-foreground shadow-none transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-brand/90 active:translate-y-0",
        compact && "h-9 px-4 text-xs sm:text-sm",
        !compact && "h-9 px-5 text-sm",
        className,
      )}
    >
      <Link href={cta.href} onClick={onNavigate}>
        {cta.label}
      </Link>
    </Button>
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
  const { shouldAnimate } = useMotionReady();

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

        if (!shouldAnimate) {
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
  logoHref = "/",
  items = defaultItems,
  cta = navbarCta,
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
          ? "border-border/60 bg-background shadow-[0_1px_0_rgba(0,0,0,0.04)]"
          : "border-transparent bg-background",
        className
      )}
    >
      <Container className="flex h-16 items-center justify-between gap-4 sm:h-18">
        <Link
          href={logoHref}
          className="group flex shrink-0 items-center rounded-md outline-none transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Image
            src={siteConfig.logoNav}
            alt={siteConfig.name}
            width={817}
            height={388}
            className="h-9 w-auto sm:h-10 md:h-11"
            priority
          />
        </Link>

        <div className="flex min-w-0 items-center gap-4 sm:gap-5 md:gap-6 lg:gap-8">
          <DesktopNavLinks items={items} />

          {siteConfig.phone ? (
            <a
              href={siteConfig.phoneHref}
              className="group relative hidden items-center gap-1.5 py-1 text-[0.9375rem] font-medium text-foreground/75 transition-colors duration-200 hover:text-foreground md:inline-flex"
            >
              <Phone className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
              <span className="whitespace-nowrap">{siteConfig.phone}</span>
              <span
                className="pointer-events-none absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 bg-foreground transition-transform duration-200 ease-out group-hover:scale-x-100"
                aria-hidden
              />
            </a>
          ) : null}

          {cta ? (
            <>
              <NavbarCtaButton
                cta={cta}
                className="hidden sm:inline-flex"
              />
              <NavbarCtaButton
                cta={cta}
                compact
                className="inline-flex sm:hidden"
              />
            </>
          ) : null}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                className="shrink-0 rounded-lg border-border/80 bg-background/50 transition-[transform,background-color] duration-200 hover:bg-muted/80 active:scale-[0.98] lg:hidden"
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
              {siteConfig.phone ? (
                <div className="border-t border-border/50 px-4 py-3">
                  <a
                    href={siteConfig.phoneHref}
                    onClick={closeMobile}
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground"
                  >
                    <Phone className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
                    {siteConfig.phone}
                  </a>
                </div>
              ) : null}
              {cta ? (
                <div className="border-t border-border/50 p-4">
                  <NavbarCtaButton
                    cta={cta}
                    className="w-full"
                    onNavigate={closeMobile}
                  />
                </div>
              ) : null}
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
