"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Menu, X } from "lucide-react";

import {
  REI_DA_COPA_SECTION_IDS,
  reiDaCopaNavItems,
  type ReiDaCopaSectionId,
} from "@/config/rei-da-copa-landing";
import { cn } from "@/lib/utils";

const MOBILE_NAV_BREAKPOINT_PX = 820;
const SCROLL_SPY_BUFFER_PX = 12;
const PROGRAMMATIC_SCROLL_LOCK_MS = 900;

const mobileNavItemOrder: ReiDaCopaSectionId[] = [
  REI_DA_COPA_SECTION_IDS.premiacao,
  REI_DA_COPA_SECTION_IDS.comoParticipar,
  REI_DA_COPA_SECTION_IDS.palavraChave,
  REI_DA_COPA_SECTION_IDS.ranking,
  REI_DA_COPA_SECTION_IDS.regulamento,
];

const mobileNavItems = mobileNavItemOrder
  .map((id) => reiDaCopaNavItems.find((item) => item.id === id))
  .filter((item): item is (typeof reiDaCopaNavItems)[number] => Boolean(item));

function isCampaignSectionId(value: string): value is ReiDaCopaSectionId {
  return reiDaCopaNavItems.some((item) => item.id === value);
}

function getCampaignScrollOffset() {
  const siteHeader = document.querySelector("header");
  const campaignNav = document.querySelector(".rei-da-copa-campaign-nav");

  return (
    (siteHeader?.getBoundingClientRect().height ?? 0) +
    (campaignNav?.getBoundingClientRect().height ?? 0) +
    SCROLL_SPY_BUFFER_PX
  );
}

function getSectionDocumentTop(section: HTMLElement) {
  return section.getBoundingClientRect().top + window.scrollY;
}

function resolveActiveSectionId(): ReiDaCopaSectionId {
  const scrollMarker = window.scrollY + getCampaignScrollOffset();
  let activeId: ReiDaCopaSectionId = reiDaCopaNavItems[0].id;

  for (const item of reiDaCopaNavItems) {
    const section = document.getElementById(item.id);

    if (!section) {
      continue;
    }

    if (getSectionDocumentTop(section) <= scrollMarker + 1) {
      activeId = item.id;
    }
  }

  return activeId;
}

function scrollToCampaignSection(sectionId: ReiDaCopaSectionId) {
  const section = document.getElementById(sectionId);

  if (!section) {
    return;
  }

  const top = getSectionDocumentTop(section) - getCampaignScrollOffset();

  window.scrollTo({
    top: Math.max(0, top),
    behavior: "smooth",
  });
  window.history.replaceState(null, "", `#${sectionId}`);
}

export function CampaignNav() {
  const [activeId, setActiveId] = useState<ReiDaCopaSectionId>(reiDaCopaNavItems[0].id);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuId = useId();
  const programmaticScrollUntilRef = useRef(0);

  const lockProgrammaticScroll = useCallback(() => {
    programmaticScrollUntilRef.current = Date.now() + PROGRAMMATIC_SCROLL_LOCK_MS;
  }, []);

  const updateActiveSection = useCallback(() => {
    if (Date.now() < programmaticScrollUntilRef.current) {
      return;
    }

    const nextActiveId = resolveActiveSectionId();
    setActiveId((current) => (current === nextActiveId ? current : nextActiveId));
  }, []);

  useEffect(() => {
    let frameId = 0;

    const handleScroll = () => {
      cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateActiveSection);
    };

    const hash = window.location.hash.replace("#", "");

    if (isCampaignSectionId(hash)) {
      lockProgrammaticScroll();
      window.requestAnimationFrame(() => {
        scrollToCampaignSection(hash);
        setActiveId(hash);
      });
    } else {
      updateActiveSection();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [lockProgrammaticScroll, updateActiveSection]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(min-width: ${MOBILE_NAV_BREAKPOINT_PX}px)`);

    const handleViewportChange = (event: MediaQueryListEvent | MediaQueryList) => {
      if (event.matches) {
        setIsMobileMenuOpen(false);
      }
    };

    handleViewportChange(mediaQuery);
    mediaQuery.addEventListener("change", handleViewportChange);

    return () => mediaQuery.removeEventListener("change", handleViewportChange);
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => document.removeEventListener("keydown", handleEscape);
  }, [isMobileMenuOpen]);

  const handleNavigate = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, sectionId: ReiDaCopaSectionId) => {
      event.preventDefault();

      const section = document.getElementById(sectionId);

      if (!section) {
        return;
      }

      lockProgrammaticScroll();
      scrollToCampaignSection(sectionId);
      setActiveId(sectionId);
      setIsMobileMenuOpen(false);
    },
    [lockProgrammaticScroll],
  );

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((current) => !current);
  }, []);

  const navLinkClassName = (isActive: boolean, variant: "desktop" | "mobile") =>
    cn(
      "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      variant === "desktop"
        ? "inline-flex rounded-full px-3 py-2 text-xs font-medium uppercase tracking-wide sm:px-3.5 sm:text-sm"
        : "block w-full rounded-xl px-4 py-3 text-left text-sm font-semibold uppercase tracking-wide",
      isActive
        ? variant === "desktop"
          ? "bg-[#14532d] text-[#f5d565]"
          : "bg-[#14532d]/10 text-[#14532d]"
        : variant === "desktop"
          ? "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
          : "text-[#14532d] hover:bg-muted/60",
    );

  return (
    <div className="rei-da-copa-campaign-nav sticky top-16 z-40 border-b border-[#c9a227]/25 bg-background/95 shadow-sm backdrop-blur-sm sm:top-[4.5rem]">
      <div className="rei-da-copa-container">
        <div className="flex min-w-0 items-center justify-between gap-2 py-3 min-[820px]:hidden">
          <a
            href={`#${REI_DA_COPA_SECTION_IDS.inicio}`}
            onClick={(event) => handleNavigate(event, REI_DA_COPA_SECTION_IDS.inicio)}
            className="min-w-0 truncate font-heading text-sm font-bold uppercase tracking-wide text-[#14532d] transition-colors hover:text-[#0f3d22] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Rei da Copa
          </a>

          <button
            type="button"
            onClick={toggleMobileMenu}
            className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#14532d] transition-colors hover:bg-muted/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            aria-expanded={isMobileMenuOpen}
            aria-controls={mobileMenuId}
          >
            Menu
            {isMobileMenuOpen ? (
              <X className="size-5" aria-hidden />
            ) : (
              <Menu className="size-5" aria-hidden />
            )}
          </button>
        </div>

        <div
          id={mobileMenuId}
          className={cn(
            "grid min-[820px]:hidden motion-reduce:transition-none",
            isMobileMenuOpen ? "grid-rows-[1fr] pb-3" : "grid-rows-[0fr]",
            "transition-[grid-template-rows] duration-300 ease-out",
          )}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="overflow-hidden">
            <nav aria-label="Navegação mobile da campanha Rei da Copa">
              <ul className="space-y-1 border-t border-[#c9a227]/20 pt-2">
                {mobileNavItems.map((item) => {
                  const isActive = activeId === item.id;

                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        onClick={(event) => handleNavigate(event, item.id)}
                        className={navLinkClassName(isActive, "mobile")}
                        aria-current={isActive ? "true" : undefined}
                        tabIndex={isMobileMenuOpen ? undefined : -1}
                      >
                        {item.label}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        </div>

        <div className="hidden min-w-0 min-[820px]:flex min-[820px]:items-center min-[820px]:gap-3 min-[820px]:py-3">
          <p className="shrink-0 font-heading text-sm font-semibold uppercase tracking-wide text-[#14532d] max-[920px]:hidden">
            Rei da Copa 2026
          </p>

          <nav
            aria-label="Navegação da campanha Rei da Copa"
            className="min-w-0 flex-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <ul className="flex min-w-max items-center gap-1.5 sm:gap-2">
              {reiDaCopaNavItems.map((item) => {
                const isActive = activeId === item.id;

                return (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(event) => handleNavigate(event, item.id)}
                      className={navLinkClassName(isActive, "desktop")}
                      aria-current={isActive ? "true" : undefined}
                    >
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );
}
