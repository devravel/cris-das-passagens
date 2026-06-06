"use client";

import Link from "next/link";

import { SoccerBallIcon } from "@/components/rei-da-copa/soccer-ball-icon";
import { Button } from "@/components/ui/button";
import { reiDaCopaHomeHeroCta } from "@/config/rei-da-copa-campaign";
import { cn } from "@/lib/utils";

export const reiDaCopaCampaignButtonClassName =
  "rei-da-copa-hero-cta group/button h-11 w-full overflow-hidden rounded-lg border border-[#c9a227]/40 bg-[#14532d] px-6 text-sm font-semibold text-[#f5d565] shadow-sm transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-px hover:bg-[#166534] hover:shadow-md active:translate-y-0 active:scale-[0.98]";

export const reiDaCopaCampaignLinkClassName =
  "font-semibold text-[#14532d] underline-offset-2 transition-colors hover:text-[#166534] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

type ReiDaCopaHeroCtaProps = {
  className?: string;
};

export function ReiDaCopaHeroCta({ className }: ReiDaCopaHeroCtaProps) {
  return (
    <Button
      asChild
      size="lg"
      className={cn(reiDaCopaCampaignButtonClassName, "sm:w-auto", className)}
    >
      <Link
        href={reiDaCopaHomeHeroCta.href}
        className="relative inline-flex w-full items-center justify-center gap-2 sm:w-auto"
      >
        <span
          className="rei-da-copa-ball-sweep pointer-events-none absolute top-1/2 hidden w-6 -translate-y-1/2 opacity-0 md:block"
          aria-hidden
        >
          <SoccerBallIcon className="size-6" />
        </span>

        <SoccerBallIcon className="relative z-10 size-4 shrink-0" />
        <span className="relative z-10">{reiDaCopaHomeHeroCta.label}</span>
      </Link>
    </Button>
  );
}
