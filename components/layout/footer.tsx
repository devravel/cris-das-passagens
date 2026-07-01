import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";

import { MetaLeadAnchor } from "@/components/analytics/meta-lead-anchor";
import { CookiePreferencesLink } from "@/components/consent/cookie-preferences-link";
import { Container } from "@/components/layout/container";
import { content, contentLinks } from "@/config/content";
import {
  brandPrimaryPages as defaultNavItems,
  footerInstitutionalLinks,
} from "@/config/navigation";
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

const footerSocialLinkClassName =
  "inline-flex text-white/70 transition-colors duration-200 hover:text-white focus-visible:rounded-md focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

function buildDefaultSocialLinks(): SocialLink[] {
  const links: SocialLink[] = [];

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
              {siteConfig.addressDetails.cnpj ? (
                <p className="text-xs text-white/60">
                  <small className="text-[0.8125rem] leading-relaxed">
                    CNPJ {siteConfig.addressDetails.cnpj}
                  </small>
                </p>
              ) : null}
              <div className="space-y-3 pt-2 text-xs text-white/60">
                <nav aria-label="Institucional">
                  <ul className="flex flex-wrap gap-x-4 gap-y-2" role="list">
                    {footerInstitutionalLinks.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className="text-[0.8125rem] font-medium text-white/70 transition-colors duration-200 hover:text-white focus-visible:rounded-md focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <CookiePreferencesLink />
                    </li>
                  </ul>
                </nav>
                <p>
                  <small className="text-[0.8125rem] leading-relaxed">
                    © <span className="tabular-nums">{copyrightYear}</span>{" "}
                    {siteName}. Todos os direitos reservados.
                  </small>
                </p>
                <p>
                  <small className="text-[0.8125rem] leading-relaxed">
                    Desenvolvido por:{" "}
                    <a
                      href={siteConfig.developer.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-white/70 transition-colors duration-200 hover:text-white focus-visible:rounded-md focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                    >
                      {siteConfig.developer.name}
                    </a>
                  </small>
                </p>
              </div>
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
                    <MetaLeadAnchor
                      href={siteConfig.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        footerSocialLinkClassName,
                        "group items-center gap-2 text-sm font-medium",
                      )}
                      leadParams={{
                        source: "footer_whatsapp",
                        content_name: "WhatsApp",
                      }}
                    >
                      <WhatsAppIcon className="size-4 shrink-0" />
                      <span>WhatsApp</span>
                      <ArrowUpRight
                        className="size-3.5 shrink-0 opacity-50 transition-[opacity,transform] duration-200 group-hover:translate-x-px group-hover:-translate-y-px group-hover:opacity-70"
                        strokeWidth={1.75}
                        aria-hidden
                      />
                    </MetaLeadAnchor>
                  </li>
                  {siteConfig.links.instagram ? (
                    <li>
                      <a
                        href={siteConfig.links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          footerSocialLinkClassName,
                          "group items-start gap-2 text-sm",
                        )}
                      >
                        <InstagramIcon className="mt-0.5 size-4 shrink-0" />
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <span>Siga-nos no Instagram!</span>
                          <ArrowUpRight
                            className="size-3.5 shrink-0 opacity-50 transition-[opacity,transform] duration-200 group-hover:translate-x-px group-hover:-translate-y-px group-hover:opacity-70"
                            strokeWidth={1.75}
                            aria-hidden
                          />
                        </span>
                      </a>
                    </li>
                  ) : null}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
}
