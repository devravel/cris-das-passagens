import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { navigation as defaultNavItems } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export type FooterNavItem = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  href: string;
};

export type FooterProps = {
  brand?: ReactNode;
  brandHref?: string;
  siteName?: string;
  /** Texto curto abaixo da marca; omitir para um rodapé mais limpo. */
  tagline?: ReactNode;
  /** Ano do copyright; por omissão usa o ano civil atual (servidor). */
  year?: number;
  navItems?: FooterNavItem[];
  socialLinks?: SocialLink[] | null;
  className?: string;
};

const defaultSocialLinks: SocialLink[] = [
  { label: "LinkedIn", href: "https://www.linkedin.com/" },
  { label: "X", href: "https://x.com/" },
  { label: "GitHub", href: "https://github.com/" },
  { label: "Instagram", href: "https://www.instagram.com/" },
];

export function Footer({
  brand = siteConfig.name,
  brandHref = "/",
  siteName = siteConfig.name,
  tagline,
  year,
  navItems = defaultNavItems,
  socialLinks = defaultSocialLinks,
  className,
}: FooterProps) {
  const copyrightYear = year ?? new Date().getFullYear();

  return (
    <footer
      className={cn(
        "mt-auto w-full border-t border-border/60 bg-muted/20",
        className
      )}
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="flex flex-col gap-10 sm:gap-12">
          <div className="flex flex-col justify-between gap-10 sm:flex-row sm:items-start sm:gap-16">
            <div className="max-w-sm space-y-3">
              <Link
                href={brandHref}
                className="inline-flex rounded-md font-heading text-base font-semibold tracking-tight text-foreground outline-none transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                {brand}
              </Link>
              {tagline ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {tagline}
                </p>
              ) : null}
            </div>

            <div className="flex flex-1 flex-col gap-10 sm:flex-row sm:justify-end sm:gap-20">
              <nav aria-label="Páginas do site">
                <h2 className="sr-only">Navegação</h2>
                <ul className="flex flex-col gap-2 sm:gap-2.5" role="list">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-foreground focus-visible:rounded-md focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              {socialLinks && socialLinks.length > 0 ? (
                <nav aria-label="Redes sociais">
                  <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Social
                  </p>
                  <ul className="flex flex-col gap-2 sm:gap-2.5" role="list">
                    {socialLinks.map(({ label, href }) => (
                      <li key={`${href}-${label}`}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground underline-offset-4 transition-colors duration-200 hover:text-foreground focus-visible:rounded-md focus-visible:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          <span>{label}</span>
                          <ArrowUpRight
                            className="size-3.5 shrink-0 opacity-50 transition-[opacity,transform] duration-200 group-hover:translate-x-px group-hover:-translate-y-px group-hover:opacity-70"
                            strokeWidth={1.75}
                            aria-hidden
                          />
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ) : null}
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-border/50 pt-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p>
              <small className="text-[0.8125rem] leading-relaxed">
                © <span className="tabular-nums">{copyrightYear}</span>{" "}
                {siteName}. Todos os direitos reservados.
              </small>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
