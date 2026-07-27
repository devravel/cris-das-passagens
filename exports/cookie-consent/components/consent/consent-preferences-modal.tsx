"use client";

import { useState } from "react";
import Link from "next/link";

import { useConsent } from "@/components/consent/consent-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { consentCopy } from "@/config/consent";
import type { ConsentCategory, ConsentPreferences } from "@/lib/consent";
import { cn } from "@/lib/utils";

type CategoryToggleProps = {
  category: Exclude<ConsentCategory, "necessary">;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function CategoryToggle({ category, checked, onChange }: CategoryToggleProps) {
  const config = consentCopy.categories[category];
  const toggleId = `consent-toggle-${category}`;

  return (
    <div className="flex items-start justify-between gap-4 rounded-lg border border-border/80 bg-muted/30 p-4">
      <div className="min-w-0 space-y-1">
        <label htmlFor={toggleId} className="font-heading text-sm font-semibold text-foreground">
          {config.label}
        </label>
        <p className="text-sm leading-relaxed text-muted-foreground">{config.description}</p>
      </div>

      <button
        id={toggleId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${config.label}: ${checked ? "ativado" : "desativado"}`}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2",
          checked ? "bg-brand-navy" : "bg-muted-foreground/30",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none inline-block size-5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-5" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

type ConsentPreferencesModalContentProps = {
  preferences: ConsentPreferences;
  onSave: (preferences: ConsentPreferences) => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
};

function ConsentPreferencesModalContent({
  preferences,
  onSave,
  onAcceptAll,
  onRejectAll,
}: ConsentPreferencesModalContentProps) {
  const [draft, setDraft] = useState<ConsentPreferences>(preferences);
  const { modal, categories } = consentCopy;

  return (
    <DialogContent
      className="max-h-[min(90vh,640px)] overflow-y-auto sm:max-w-md"
      aria-describedby="consent-modal-description"
    >
      <DialogHeader>
        <DialogTitle>{modal.title}</DialogTitle>
        <DialogDescription id="consent-modal-description">
          {modal.description}{" "}
          <Link
            href="/politica-de-privacidade"
            className="font-medium text-brand-navy underline-offset-2 hover:underline"
          >
            {modal.privacyLink}
          </Link>
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-4 rounded-lg border border-border/80 bg-muted/30 p-4">
          <div className="min-w-0 space-y-1">
            <p className="font-heading text-sm font-semibold text-foreground">
              {categories.necessary.label}
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {categories.necessary.description}
            </p>
          </div>
          <span
            className="shrink-0 rounded-full bg-brand-navy/10 px-2.5 py-1 text-xs font-medium text-brand-navy"
            aria-hidden
          >
            Sempre ativo
          </span>
        </div>
        <CategoryToggle
          category={categories.analytics.id}
          checked={draft.analytics}
          onChange={(checked) => setDraft((current) => ({ ...current, analytics: checked }))}
        />
        <CategoryToggle
          category={categories.marketing.id}
          checked={draft.marketing}
          onChange={(checked) => setDraft((current) => ({ ...current, marketing: checked }))}
        />
      </div>

      <DialogFooter className="flex-col gap-2 sm:flex-col">
        <div className="flex w-full flex-col gap-2 sm:flex-row">
          <Button type="button" variant="outline" className="w-full sm:flex-1" onClick={onRejectAll}>
            {modal.rejectAll}
          </Button>
          <Button type="button" variant="outline" className="w-full sm:flex-1" onClick={onAcceptAll}>
            {modal.acceptAll}
          </Button>
        </div>
        <Button
          type="button"
          className="w-full bg-brand-navy text-white hover:bg-brand-navy/90"
          onClick={() => onSave(draft)}
        >
          {modal.save}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}

export function ConsentPreferencesModal() {
  const {
    isModalOpen,
    preferences,
    closePreferences,
    savePreferences,
    acceptAll,
    rejectAll,
  } = useConsent();

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closePreferences()}>
      {isModalOpen ? (
        <ConsentPreferencesModalContent
          key={`${preferences.analytics}-${preferences.marketing}`}
          preferences={preferences}
          onSave={savePreferences}
          onAcceptAll={acceptAll}
          onRejectAll={rejectAll}
        />
      ) : null}
    </Dialog>
  );
}
