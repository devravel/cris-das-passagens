"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

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
import { trackMetaLeadFromHref } from "@/lib/meta-pixel";
import { cn } from "@/lib/utils";

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

const HOME_HREF = "/";

function parseHashHref(href: string) {
  const hashIndex = href.indexOf("#");

  if (hashIndex === -1) {
    return { path: href, hash: undefined as string | undefined };
  }

  return {
    path: href.slice(0, hashIndex) || HOME_HREF,
    hash: href.slice(hashIndex + 1),
  };
}

function scrollToHashSection(hash: string) {
  const section = document.getElementById(hash);

  if (!section) {
    return;
  }

  const header = document.querySelector("header");
  const offset = (header?.getBoundingClientRect().height ?? 0) + 8;
  const top =
    section.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  window.history.replaceState(null, "", `#${hash}`);
}

function routeIsActive(pathname: string, href: string) {
  const { path, hash } = parseHashHref(href);

  if (hash) {
    return false;
  }

  if (path === HOME_HREF) return pathname === HOME_HREF;
  return pathname === path || pathname.startsWith(`${path}/`);
}

function scrollToPageTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

/** Logo, Início e âncoras na home: rola suavemente; em outras rotas, o Link navega. */
function handleNavLinkClick(
  event: React.MouseEvent<HTMLAnchorElement>,
  pathname: string,
  href: string,
  onNavigate?: () => void,
) {
  onNavigate?.();

  const { path, hash } = parseHashHref(href);

  if (hash && path === pathname) {
    event.preventDefault();
    scrollToHashSection(hash);
    return;
  }

  if (path !== HOME_HREF || pathname !== HOME_HREF) return;
  event.preventDefault();
  scrollToPageTop();
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
      onClick={(event) => handleNavLinkClick(event, pathname, href, onNavigate)}
      className={cn(
        "group relative inline-flex items-center py-1.5 text-base font-medium tracking-tight transition-colors duration-200",
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
      className="hidden items-center gap-7 xl:gap-9 lg:flex"
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

export function NavbarCtaButton({
  cta,
  className,
  onNavigate,
  fullWidth = false,
}: {
  cta: NavbarCta;
  className?: string;
  onNavigate?: () => void;
  fullWidth?: boolean;
}) {
  const brandStyles = cn(
    "rounded-lg bg-brand font-semibold text-brand-foreground shadow-none transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:bg-brand/90 active:translate-y-0",
    fullWidth
      ? "h-10 w-full px-5 text-sm"
      : "h-auto min-h-9 min-w-0 max-w-[10.5rem] shrink px-3 py-2 text-[0.75rem] leading-tight whitespace-normal text-center sm:max-w-none sm:h-10 sm:py-0 sm:px-5 sm:text-sm sm:whitespace-nowrap md:px-6 md:text-[0.9375rem]",
  );

  if (cta.external) {
    return (
      <Button asChild size="sm" className={cn(brandStyles, className)}>
        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            trackMetaLeadFromHref(cta.href, {
              source: "navbar_quote",
              content_name: cta.label,
            });
            onNavigate?.();
          }}
        >
          {cta.label}
        </a>
      </Button>
    );
  }

  return (
    <Button asChild size="sm" className={cn(brandStyles, className)}>
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
            onClick={(event) =>
              handleNavLinkClick(event, pathname, item.href, onNavigate)
            }
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
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isPacotesPage = pathname === "/pacotes" || pathname.startsWith("/pacotes/");
  const isAdminPage = pathname.startsWith("/admin");
  const sticksOnScroll = !isPacotesPage && !isAdminPage;

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
        "z-50 w-full border-b transition-[box-shadow,background-color,border-color,backdrop-filter] duration-300",
        sticksOnScroll ? "sticky top-0" : "relative",
        scrolled
          ? "border-border/50 bg-background/70 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md supports-backdrop-filter:bg-background/55"
          : "border-transparent bg-background",
        className
      )}
    >
      <Container className="flex min-h-18 items-center justify-between gap-4 py-2.5 sm:min-h-20 sm:py-3">
        <Link
          href={logoHref}
          onClick={(event) => handleNavLinkClick(event, pathname, logoHref)}
          className="group flex shrink-0 items-center rounded-md outline-none transition-opacity duration-200 hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <Image
            src={siteConfig.logoNav}
            alt={siteConfig.name}
            width={817}
            height={388}
            className="h-11 w-auto sm:h-12 md:h-14"
            priority
          />
        </Link>

        <div className="flex min-w-0 items-center gap-2.5 sm:gap-5 md:gap-6 lg:gap-9">
          <DesktopNavLinks items={items} />

          {cta ? (
            <NavbarCtaButton cta={cta} className="hidden md:inline-flex" />
          ) : null}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-lg"
                className="size-11 shrink-0 rounded-lg bg-transparent text-brand-navy transition-[transform,background-color] duration-200 hover:bg-transparent hover:text-brand-navy active:scale-[0.98] sm:size-12 lg:hidden"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="size-5 sm:size-6" strokeWidth={2} />
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
                <div className="hidden border-t border-border/50 p-4 md:block">
                  <NavbarCtaButton
                    cta={cta}
                    fullWidth
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
