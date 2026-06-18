"use client";

import { XIcon } from "lucide-react";

import { Dialog as DialogPrimitive } from "radix-ui";

import { BlogArticleContent } from "@/components/blog/blog-article-content";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { isRichTextHtml } from "@/lib/blog/content";
import { cn } from "@/lib/utils";

type PackageDescriptionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageName: string;
  shortDescription: string | null;
  fullDescription: string;
};

const packageDescriptionContentClassName = cn(
  "text-sm leading-relaxed text-foreground/90 sm:text-base",
  "[&_h2]:mt-6 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-tight",
  "[&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:tracking-tight",
  "[&_p]:mt-3 [&_p]:text-pretty",
  "[&_ul]:mt-3 [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5",
  "[&_ol]:mt-3 [&_ol]:list-decimal [&_ol]:space-y-1.5 [&_ol]:pl-5",
  "[&_blockquote]:my-4 [&_blockquote]:rounded-xl [&_blockquote]:border-l-4 [&_blockquote]:border-brand/40 [&_blockquote]:bg-muted/35 [&_blockquote]:px-4 [&_blockquote]:py-3 [&_blockquote]:italic",
  "[&_.blog-content-image]:my-5 [&_.blog-content-image]:rounded-xl",
  "[&_.blog-figure]:my-5",
);

export function PackageDescriptionModal({
  open,
  onOpenChange,
  packageName,
  shortDescription,
  fullDescription,
}: PackageDescriptionModalProps) {
  const descriptionId = "package-description-modal-text";
  const isHtmlDescription = isRichTextHtml(fullDescription);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50 backdrop-blur-sm duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[min(88vh,720px)] w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-border/70 bg-popover text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/10 outline-none duration-300 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 sm:w-[calc(100%-2rem)]",
          )}
          aria-describedby={descriptionId}
        >
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              className="absolute top-2 right-2 z-10"
              size="icon-sm"
              aria-label="Fechar descrição do pacote"
            >
              <XIcon />
            </Button>
          </DialogPrimitive.Close>

          <div className="shrink-0 px-4 pt-5 pb-3 sm:px-6 sm:pt-6 sm:pb-4">
            <DialogTitle className="pr-8 font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {packageName}
            </DialogTitle>

            {shortDescription ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {shortDescription}
              </p>
            ) : null}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-5 sm:px-6 sm:pb-6">
            <div id={descriptionId}>
              {isHtmlDescription ? (
                <BlogArticleContent
                  html={fullDescription}
                  className={packageDescriptionContentClassName}
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90 sm:text-base">
                  {fullDescription}
                </p>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
