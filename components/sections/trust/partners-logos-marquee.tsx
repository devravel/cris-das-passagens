import type { CSSProperties } from "react";

import {
  partnerLogoGapClassName,
  PartnerLogoImage,
  type PartnerLogoEntry,
} from "@/components/sections/trust/partners-logo-shared";
import { cn } from "@/lib/utils";

/** Gap + padding-right iguais — costura invisível no loop translateX(-50%). */
const partnersMarqueeGroupClassName = cn(
  "partners-marquee-group flex items-center",
  partnerLogoGapClassName,
  "pr-3 sm:pr-4 md:pr-5 lg:pr-6 xl:pr-8",
);

const partnersMarqueeTrackStyle = {
  "--partners-marquee-duration": "12s",
} as CSSProperties;

export function PartnersLogosMarquee({
  logos,
}: {
  logos: readonly PartnerLogoEntry[];
}) {
  if (logos.length === 0) {
    return null;
  }

  return (
    <div
      className="partners-marquee-viewport mx-auto w-full max-w-6xl"
      role="region"
      aria-label="Empresas parceiras"
    >
      <div
        className="partners-marquee-track"
        style={partnersMarqueeTrackStyle}
      >
        {[0, 1].map((copy) => (
          <div
            key={copy}
            className={partnersMarqueeGroupClassName}
            aria-hidden={copy !== 0}
          >
            {logos.map((logo, index) => (
              <div
                key={`${copy}-${index}-${logo.src}`}
                className="flex shrink-0 items-center justify-center"
              >
                <PartnerLogoImage logo={logo} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
