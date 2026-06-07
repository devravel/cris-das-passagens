import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

import { Container } from "@/components/layout/container";
import { content, contentLinks } from "@/config/content";
import { brandPrimaryPages as defaultNavItems } from "@/config/navigation";
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
  tagline?: ReactNode;
  year?: number;
  navItems?: FooterNavItem[];
  socialLinks?: SocialLink[] | null;
  /** Exibe endereço físico — apenas na página inicial (exigência Meta/Google Business). */
  showAddress?: boolean;
  className?: string;
};

function buildDefaultSocialLinks(): SocialLink[] {
  const links: SocialLink[] = [];

  if (siteConfig.links.instagram) {
    links.push({ label: "Instagram", href: siteConfig.links.instagram });
  }
  if (siteConfig.links.facebook) {
    links.push({ label: "Facebook", href: siteConfig.links.facebook });
  }

  return links;
}

export function Footer({
  brand = siteConfig.name,
  brandHref = "/",
  siteName = siteConfig.legalName,
  tagline = content.meta.tagline,
  year,
  navItems = defaultNavItems,
  socialLinks = buildDefaultSocialLinks(),
  showAddress = false,
  className,
}: FooterProps) {
  const copyrightYear = year ?? new Date().getFullYear();

  return (
    <footer
      className={cn("mt-auto w-full bg-brand-navy text-white", className)}
    >
      <Container className="py-12 sm:py-16">
        <div className="flex flex-col gap-10 sm:gap-12">
          <div className="flex flex-col justify-between gap-10 sm:flex-row sm:items-start sm:gap-16">
            <div className="min-w-0 max-w-sm space-y-3">
              <Link
                href={brandHref}
                className="inline-flex rounded-md font-heading text-base font-semibold tracking-tight text-white outline-none transition-opacity duration-200 hover:opacity-80 focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-navy"
              >
                {brand}
              </Link>
              {tagline ? (
                <p className="text-sm leading-relaxed text-white/70">
                  {tagline}
                </p>
              ) : null}
              {socialLinks && socialLinks.length > 0 ? (
                <ul className="flex flex-wrap gap-3 pt-1" role="list">
                  {socialLinks.map(({ label, href }) => (
                    <li key={`${href}-${label}`}>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white focus-visible:rounded-md focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="flex flex-1 flex-col gap-8 min-w-0 sm:flex-row sm:justify-end sm:gap-12 lg:gap-20">
              <nav aria-label="Páginas principais">
                <p className="mb-3 text-sm font-semibold text-white">
                  Páginas
                </p>
                <ul className="flex flex-col gap-2 sm:gap-2.5" role="list">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white focus-visible:rounded-md focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div>
                <p className="mb-3 text-sm font-semibold text-white">Contato</p>
                <ul className="flex flex-col gap-3" role="list">
                  <li>
                    <Link
                      href={contentLinks.quote}
                      className="inline-flex items-start gap-2 text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white"
                    >
                      Página de contato
                    </Link>
                  </li>
                  {siteConfig.phone ? (
                    <li>
                      <a
                        href={siteConfig.phoneHref}
                        className="inline-flex items-start gap-2 text-sm text-white/70 transition-colors duration-200 hover:text-white"
                      >
                        <Phone
                          className="mt-0.5 size-4 shrink-0"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        <span>{siteConfig.phone}</span>
                      </a>
                    </li>
                  ) : null}
                  {siteConfig.email ? (
                    <li>
                      <a
                        href={`mailto:${siteConfig.email}`}
                        className="inline-flex items-start gap-2 text-sm text-white/70 transition-colors duration-200 hover:text-white"
                      >
                        <Mail
                          className="mt-0.5 size-4 shrink-0"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        <span>{siteConfig.email}</span>
                      </a>
                    </li>
                  ) : null}
                  {showAddress && siteConfig.address ? (
                    <li className="inline-flex items-start gap-2 text-sm text-white/70">
                      <MapPin
                        className="mt-0.5 size-4 shrink-0"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                      <span>
                        {siteConfig.address}
                        <span className="mt-1 block text-xs text-white/50">
                          Atendimento exclusivamente online
                        </span>
                      </span>
                    </li>
                  ) : null}
                  <li>
                    <a
                      href={siteConfig.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 text-sm font-medium text-white/70 transition-colors duration-200 hover:text-white"
                    >
                      <span>WhatsApp</span>
                      <ArrowUpRight
                        className="size-3.5 shrink-0 opacity-50 transition-[opacity,transform] duration-200 group-hover:translate-x-px group-hover:-translate-y-px group-hover:opacity-70"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/10 pt-8 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <p>
              <small className="text-[0.8125rem] leading-relaxed">
                © <span className="tabular-nums">{copyrightYear}</span>{" "}
                {siteName}. Todos os direitos reservados.
              </small>
            </p>
            {siteConfig.addressDetails.cnpj ? (
              <p>
                <small className="text-[0.8125rem] leading-relaxed">
                  CNPJ {siteConfig.addressDetails.cnpj}
                </small>
              </p>
            ) : null}
          </div>
        </div>
      </Container>
    </footer>
  );
}
