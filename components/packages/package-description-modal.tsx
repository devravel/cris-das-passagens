"use client";

import { XIcon } from "lucide-react";

import { Dialog as DialogPrimitive } from "radix-ui";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type PackageDescriptionModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageName: string;
  shortDescription: string | null;
  fullDescription: string;
};

export function PackageDescriptionModal({
  open,
  onOpenChange,
  packageName,
  shortDescription,
  fullDescription,
}: PackageDescriptionModalProps) {
  const descriptionId = "package-description-modal-text";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/50 backdrop-blur-sm duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 grid max-h-[min(88vh,720px)] w-[calc(100%-1.5rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 gap-0 overflow-hidden rounded-xl border border-border/70 bg-popover text-sm text-popover-foreground shadow-xl ring-1 ring-foreground/10 outline-none duration-300 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 sm:w-[calc(100%-2rem)]",
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

          <div className="overflow-y-auto px-4 py-5 sm:px-6 sm:py-6">
            <DialogTitle className="pr-8 font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {packageName}
            </DialogTitle>

            {shortDescription ? (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                {shortDescription}
              </p>
            ) : null}

            <DialogDescription
              id={descriptionId}
              className={cn(
                "text-sm leading-relaxed text-foreground/90 sm:text-base",
                shortDescription ? "mt-4" : "mt-3",
              )}
            >
              {fullDescription}
            </DialogDescription>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
