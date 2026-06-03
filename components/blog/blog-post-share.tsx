"use client";

import { useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { toast } from "sonner";

import { BlogShareSocialIcons } from "@/components/blog/blog-share-social-icons";
import { shareArticleNative } from "@/lib/blog/share";
import { cn } from "@/lib/utils";

type BlogPostShareProps = {
  url: string;
  title: string;
  className?: string;
};

export function BlogPostShare({ url, title, className }: BlogPostShareProps) {
  const [copied, setCopied] = useState(false);

  async function handleNativeShare() {
    const result = await shareArticleNative({ title, url });

    if (result === "unavailable") {
      toast.message("Use os ícones ao lado para compartilhar este artigo.");
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copiado.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <button
        type="button"
        onClick={() => void handleNativeShare()}
        className="inline-flex size-10 items-center justify-center rounded-full border border-border/70 bg-background text-foreground shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-brand/30 hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        aria-label="Compartilhar artigo"
        title="Compartilhar"
      >
        <Share2 className="size-4 text-brand" aria-hidden />
      </button>

      <BlogShareSocialIcons url={url} title={title} tone="brand" />

      <button
        type="button"
        onClick={() => void handleCopyLink()}
        aria-label="Copiar link do artigo"
        title="Copiar link"
        className="inline-flex size-10 items-center justify-center rounded-full bg-foreground/85 text-background shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:bg-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        {copied ? <Check className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
      </button>
    </div>
  );
}
