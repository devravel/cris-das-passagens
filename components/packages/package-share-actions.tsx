"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { BlogShareSocialIcons } from "@/components/blog/blog-share-social-icons";
import { shareArticleNative } from "@/lib/blog/share";
import { buildPackageShareText, getPackageShareUrl } from "@/lib/package/routes";
import { cn } from "@/lib/utils";

type PackageShareActionsProps = {
  title: string;
  slug: string;
  className?: string;
  /** Exibe apenas o botão de copiar (útil na listagem admin). */
  compact?: boolean;
};

export function PackageShareActions({
  title,
  slug,
  className,
  compact = false,
}: PackageShareActionsProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = getPackageShareUrl(slug);
  const shareText = buildPackageShareText(title, slug);

  async function handleNativeShare() {
    const result = await shareArticleNative({ title, url: shareUrl, text: shareText });

    if (result === "unavailable") {
      toast.message("Use os ícones ao lado para compartilhar este pacote.");
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      toast.success("Link copiado.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => void handleCopyLink()}
        aria-label="Copiar link do pacote"
        title="Copiar link para compartilhar"
        className={cn(
          "inline-flex size-9 items-center justify-center rounded-lg border border-border/70 bg-background text-foreground shadow-sm transition-colors duration-200 hover:border-brand/30 hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2",
          className,
        )}
      >
        {copied ? <Check className="size-4 text-brand" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
      </button>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => void handleNativeShare()}
          className="inline-flex size-10 items-center justify-center rounded-full border border-border/70 bg-background text-foreground shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          aria-label="Compartilhar pacote"
          title="Compartilhar"
        >
          <Share2 className="size-4 text-brand" aria-hidden />
        </button>

        <BlogShareSocialIcons url={shareUrl} title={title} tone="brand" />

        <button
          type="button"
          onClick={() => void handleCopyLink()}
          aria-label="Copiar link do pacote"
          title="Copiar link"
          className="inline-flex size-10 items-center justify-center rounded-full bg-foreground/85 text-background shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          {copied ? <Check className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
        </button>
      </div>

      <p className="break-all rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        {shareText}
      </p>
    </div>
  );
}
