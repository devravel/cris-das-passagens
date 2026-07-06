"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { packageActionButtonClassName } from "@/components/packages/package-whatsapp-cta";
import { shareArticleNative } from "@/lib/blog/share";
import { buildPackageShareText, getPackageShareUrl } from "@/lib/package/routes";
import { cn } from "@/lib/utils";

type PackageCardShareButtonProps = {
  title: string;
  slug: string;
  className?: string;
};

export function PackageCardShareButton({ title, slug, className }: PackageCardShareButtonProps) {
  const shareUrl = getPackageShareUrl(slug);
  const shareText = buildPackageShareText(title, slug);

  async function handleShare() {
    const result = await shareArticleNative({ title, url: shareUrl, text: shareText });

    if (result === "unavailable") {
      try {
        await navigator.clipboard.writeText(shareText);
        toast.success("Link copiado.");
      } catch {
        toast.error("Não foi possível copiar o link.");
      }
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      aria-label={`Compartilhar ${title}`}
      className={cn(
        packageActionButtonClassName,
        "border border-border/70 bg-background text-foreground shadow-sm hover:border-brand/30 hover:bg-brand/5",
        className,
      )}
    >
      <Share2 className="size-3.5 shrink-0 text-brand sm:size-4" aria-hidden />
      Compartilhar
    </button>
  );
}
