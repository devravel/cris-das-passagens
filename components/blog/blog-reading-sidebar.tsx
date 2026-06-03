"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

import { BlogPostLikeButton } from "@/components/blog/blog-post-like";
import { isReadingSidebarVisible } from "@/lib/blog/reading-progress";
import { shareArticleNative } from "@/lib/blog/share";
import { cardShadowClassName } from "@/lib/card-styles";
import { cn } from "@/lib/utils";

type BlogReadingSidebarProps = {
  progress: number;
  publishedAtLabel: string;
  publishedAtIso: string;
  title: string;
  url: string;
};

export function BlogReadingSidebar({
  progress,
  publishedAtLabel,
  publishedAtIso,
  title,
  url,
}: BlogReadingSidebarProps) {
  const visible = isReadingSidebarVisible(progress);

  async function handleShareClick() {
    const result = await shareArticleNative({ title, url });

    if (result === "unavailable") {
      toast.message("Compartilhamento não disponível neste dispositivo.");
    }
  }

  return (
    <aside
      aria-label="Painel de leitura do artigo"
      aria-hidden={!visible}
      inert={!visible}
      className={cn(
        "pointer-events-none fixed top-1/2 z-40 hidden w-52 -translate-y-1/2 xl:block",
        "left-[max(1rem,calc(50vw-24rem-14rem))]",
        "transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
        visible
          ? "pointer-events-auto translate-x-0 opacity-100"
          : "-translate-x-3 opacity-0",
      )}
    >
      <div
        className={cn(
          "rounded-2xl border border-border/60 bg-card/95 p-5 shadow-lg backdrop-blur-sm ring-1 ring-border/40",
          cardShadowClassName,
        )}
      >
        <time
          dateTime={publishedAtIso}
          className="block text-xs font-medium uppercase tracking-wide text-muted-foreground"
        >
          {publishedAtLabel}
        </time>

        <p className="mt-3 line-clamp-4 font-heading text-base font-semibold leading-snug tracking-tight text-foreground">
          {title}
        </p>

        <div className="mt-5 space-y-3 border-t border-border/60 pt-5">
          <BlogPostLikeButton variant="sidebar" />

          <button
            type="button"
            onClick={() => void handleShareClick()}
            className="inline-flex w-full items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors duration-200 hover:border-brand/30 hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            aria-label="Compartilhar artigo"
          >
            <Share2 className="size-4 shrink-0 text-brand" aria-hidden />
            Compartilhar
          </button>
        </div>
      </div>
    </aside>
  );
}
