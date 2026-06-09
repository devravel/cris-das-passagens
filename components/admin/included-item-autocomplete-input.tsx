"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { filterIncludedItemSuggestions } from "@/lib/package/included-item-suggestions";
import { cn } from "@/lib/utils";

type IncludedItemAutocompleteInputProps = {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
};

export function IncludedItemAutocompleteInput({
  value,
  onChange,
  suggestions,
  placeholder,
  className,
  "aria-label": ariaLabel,
}: IncludedItemAutocompleteInputProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const visibleSuggestions = filterIncludedItemSuggestions(suggestions, value);
  const showSuggestions = isOpen && value.trim().length > 0 && visibleSuggestions.length > 0;
  const highlightedIndex =
    activeIndex >= 0 && activeIndex < visibleSuggestions.length ? activeIndex : -1;

  useEffect(() => {
    if (!showSuggestions) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [showSuggestions]);

  function selectSuggestion(suggestion: string) {
    onChange(suggestion);
    setIsOpen(false);
    setActiveIndex(-1);
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <Input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setIsOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={(event) => {
          if (!showSuggestions) {
            return;
          }

          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActiveIndex((current) =>
              current >= visibleSuggestions.length - 1 ? 0 : current + 1,
            );
            return;
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            setActiveIndex((current) =>
              current <= 0 ? visibleSuggestions.length - 1 : current - 1,
            );
            return;
          }

          if (event.key === "Enter" && highlightedIndex >= 0) {
            event.preventDefault();
            const suggestion = visibleSuggestions[highlightedIndex];
            if (suggestion) {
              selectSuggestion(suggestion);
            }
            return;
          }

          if (event.key === "Escape") {
            event.preventDefault();
            setIsOpen(false);
            setActiveIndex(-1);
          }
        }}
        placeholder={placeholder}
        className={className}
        aria-label={ariaLabel}
        role="combobox"
        aria-expanded={showSuggestions}
        aria-controls={showSuggestions ? listboxId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={
          showSuggestions && highlightedIndex >= 0
            ? `${listboxId}-option-${highlightedIndex}`
            : undefined
        }
      />

      {showSuggestions ? (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute top-[calc(100%+0.25rem)] z-20 max-h-44 w-full overflow-y-auto rounded-xl border border-border/70 bg-popover py-1 shadow-sm"
        >
          {visibleSuggestions.map((suggestion, index) => (
            <li key={suggestion} role="presentation">
              <button
                id={`${listboxId}-option-${index}`}
                type="button"
                role="option"
                aria-selected={index === highlightedIndex}
                className={cn(
                  "w-full px-3 py-2 text-left text-sm text-foreground transition-colors",
                  index === highlightedIndex ? "bg-muted/70" : "hover:bg-muted/50",
                )}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectSuggestion(suggestion)}
              >
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
