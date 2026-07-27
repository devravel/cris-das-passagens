"use client";

import Link from "next/link";

import { PackageWhatsAppCta, packageActionButtonClassName } from "@/components/packages/package-whatsapp-cta";
import { trackMetaViewContent } from "@/lib/meta-pixel";
import { getPackageHighlightUrl } from "@/lib/package/routes";
import { cn } from "@/lib/utils";

export const packageCardActionsClassName =
  "border-t border-border/70 px-3.5 py-3 sm:px-4 sm:py-3.5";

type LandingSaibaMaisActionProps = {
  slug: string;
  packageTitle?: string;
  className?: string;
  buttonClassName?: string;
  unstyled?: boolean;
};

export function LandingSaibaMaisAction({
  slug,
  packageTitle,
  className,
  buttonClassName,
  unstyled = false,
}: LandingSaibaMaisActionProps) {
  function handleClick() {
    trackMetaViewContent({
      content_name: packageTitle ?? slug,
      content_ids: [slug],
    });
  }

  return (
    <div className={cn(!unstyled && packageCardActionsClassName, className)}>
      <Link
        href={getPackageHighlightUrl(slug)}
        onClick={handleClick}
        aria-label={
          packageTitle ? `Saiba mais sobre ${packageTitle}` : "Saiba mais sobre este pacote"
        }
        className={cn(
          packageActionButtonClassName,
          "bg-brand text-brand-foreground shadow-sm hover:bg-brand/90",
          buttonClassName,
        )}
      >
        Mais detalhes
      </Link>
    </div>
  );
}

type LandingWhatsAppActionProps = {
  whatsAppHref: string;
  className?: string;
};

export function LandingWhatsAppAction({ whatsAppHref, className }: LandingWhatsAppActionProps) {
  return (
    <div className={cn(packageCardActionsClassName, className)}>
      <PackageWhatsAppCta href={whatsAppHref} />
    </div>
  );
}
