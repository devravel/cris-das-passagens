"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";

import { Container } from "@/components/layout/container";
import { navigation as defaultItems, navbarCta } from "@/config/navigation";
import { useMotionReady } from "@/hooks/use-motion-ready";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { CtaButton, type CtaButtonProps } from "@/components/ui/cta-button";
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
        active ? "text-brand" : "text-foreground/75 hover:text-brand",
        className
      )}
    >
      {children}
      {/* Linha azul da marca: fixa na página ativa, cresce da esquerda no hover. */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 -bottom-0.5 h-0.5 origin-left scale-x-0 rounded-full bg-brand transition-transform duration-300 ease-out motion-reduce:transition-none",
          active ? "scale-x-100" : "group-hover:scale-x-100",
        )}
      />
    </Link>
  );
}

function DesktopNavLinks({ items, compact }: { items: NavItem[]; compact: boolean }) {
  return (
    <nav
      className="hidden items-center justify-center gap-5 xl:gap-8 lg:flex"
      aria-label="Navegação principal"
    >
      {items.map((item) => (
        <NavLink
          key={item.href}
          href={item.href}
          className={cn("transition-[font-size] duration-300", compact && "text-[0.9375rem]")}
        >
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
  size,
}: {
  cta: NavbarCta;
  className?: string;
  onNavigate?: () => void;
  size?: CtaButtonProps["size"];
}) {
  return (
    <CtaButton
      href={cta.href}
      label={cta.label}
      size={size}
      trackingSource="navbar_quote"
      onClick={onNavigate}
      className={className}
    />
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

  // Desktop: rolou pra baixo, a navbar encolhe e some do caminho; perto do topo volta ao normal.
  // Histerese (encolhe > 140px, volta < 60px) pra não piscar na fronteira.
  const [compact, setCompact] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 6);
      setCompact((current) => (current ? y > 60 : y > 140));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile/tablet: o CTA da navbar só aparece depois que o da hero sai da tela.
  const [heroCtaVisible, setHeroCtaVisible] = React.useState(true);
  React.useEffect(() => {
    const heroCta = document.querySelector("[data-hero-cta]");
    if (!heroCta) {
      setHeroCtaVisible(false);
      return;
    }
    const observer = new IntersectionObserver(([entry]) =>
      setHeroCtaVisible(entry.isIntersecting),
    );
    observer.observe(heroCta);
    return () => observer.disconnect();
  }, [pathname]);
  const ctaRevealClassName = cn(
    "transition-[opacity,translate] duration-300 ease-out motion-reduce:transition-none",
    heroCtaVisible && "max-lg:pointer-events-none max-lg:-translate-y-1 max-lg:opacity-0",
  );

  const closeMobile = React.useCallback(() => setMobileOpen(false), []);

  return (
    <header
      className={cn(
        "z-50 w-full border-b transition-[box-shadow,background-color,border-color,backdrop-filter] duration-300",
        sticksOnScroll ? "sticky top-0" : "relative",
        scrolled
          ? "border-border/50 bg-background/70 shadow-[0_1px_0_rgba(0,0,0,0.04)] backdrop-blur-md supports-backdrop-filter:bg-background/55"
          : "border-transparent bg-background",
        compact && sticksOnScroll && "lg:supports-backdrop-filter:bg-background/45",
        className
      )}
    >
      {/* 3 colunas: logo | centro | direita. <640px: CTA compacto no centro, com respiro,
          e menu na direita; a partir de 640px o CTA vai pro lado do hambúrguer;
          desktop: links no centro e CTA na direita — sempre nas margens do Container. */}
      <Container
        className={cn(
          "grid min-h-18 grid-cols-[auto_1fr_auto] items-center gap-2.5 py-2.5 transition-[min-height,padding] duration-300 ease-out sm:min-h-20 sm:gap-4 sm:py-3 lg:grid-cols-[auto_1fr_auto] lg:gap-8 xl:grid-cols-[1fr_auto_1fr] motion-reduce:transition-none",
          compact && sticksOnScroll && "lg:min-h-14 lg:py-1.5",
        )}
      >
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
            className={cn(
              "h-[clamp(2rem,9.5vw,2.5rem)] w-auto transition-[height] duration-300 ease-out motion-reduce:transition-none sm:h-12 md:h-14",
              compact && sticksOnScroll && "lg:h-9",
            )}
            sizes="120px"
            priority
          />
        </Link>

        <div className="flex min-w-0 justify-center">
          <DesktopNavLinks items={items} compact={compact && sticksOnScroll} />
          {cta ? (
            <div className={cn("sm:hidden", ctaRevealClassName)} aria-hidden={heroCtaVisible}>
              <NavbarCtaButton cta={cta} size="sm" />
            </div>
          ) : null}
        </div>

        <div className="flex min-w-0 items-center gap-2 justify-self-end lg:gap-0">
          {cta ? (
            <div
              className={cn(
                "hidden origin-right sm:block lg:transition-transform lg:duration-300 lg:ease-out",
                ctaRevealClassName,
                compact && sticksOnScroll && "lg:scale-[0.86]",
              )}
            >
              <NavbarCtaButton cta={cta} size="md" />
            </div>
          ) : null}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon-lg"
                className="size-11 shrink-0 rounded-lg bg-transparent text-brand transition-[transform,background-color] duration-200 hover:bg-transparent hover:text-brand active:scale-[0.98] sm:size-12 lg:hidden"
                aria-label="Abrir menu de navegação"
              >
                <Menu className="size-6 sm:size-7" strokeWidth={2.75} />
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
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  );
}
