"use client";

import type { ReactNode } from "react";
import { XIcon } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type PackageCardHighlightModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageName: string;
  children: ReactNode;
};

export function PackageCardHighlightModal({
  open,
  onOpenChange,
  packageName,
  children,
}: PackageCardHighlightModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay className="bg-black/55 backdrop-blur-md duration-300 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
        <DialogPrimitive.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[min(92dvh,880px)] w-[calc(100%-1.25rem)] max-w-[22.5rem] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden outline-none sm:max-w-[24rem]",
            "duration-300 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          )}
          onClick={(event) => event.stopPropagation()}
        >
          <DialogPrimitive.Close asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="absolute top-2.5 right-2.5 z-20 bg-background/90 text-foreground shadow-md hover:bg-background"
              aria-label="Fechar pacote"
            >
              <XIcon />
            </Button>
          </DialogPrimitive.Close>

          <DialogTitle className="sr-only">{packageName}</DialogTitle>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain p-3 sm:p-4">
            <div className="mx-auto w-full min-w-0">{children}</div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
