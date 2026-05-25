"use client";

import { useState } from "react";
import { X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { parseTagsFromInput } from "@/lib/blog/tag-utils";
import { cn } from "@/lib/utils";

type BlogTagsFieldProps = {
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
};

export function BlogTagsField({ value, onChange, error }: BlogTagsFieldProps) {
  const [inputValue, setInputValue] = useState("");

  const tags = value;

  function commitInput(raw: string) {
    const nextTags = parseTagsFromInput(`${[...value, raw].join(", ")}`);
    onChange(nextTags);
    setInputValue("");
  }

  function removeTag(tagToRemove: string) {
    onChange(value.filter((tag) => tag !== tagToRemove));
  }

  return (
    <div className="space-y-2">
      <Input
        id="tags"
        className="h-10 rounded-xl"
        placeholder="Ex.: passagens aéreas, dicas de viagem"
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            if (!inputValue.trim()) return;
            commitInput(inputValue);
          }
        }}
        onBlur={() => {
          if (!inputValue.trim()) return;
          commitInput(inputValue);
        }}
      />
      <p className="text-xs text-muted-foreground">
        Separe as tags por vírgula. Máximo de 8 tags por post.
      </p>

      {tags.length > 0 ? (
        <ul className="flex flex-wrap gap-2 p-0">
          {tags.map((tag) => (
            <li key={tag}>
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted/40 px-3 py-1 text-xs font-medium text-foreground",
                )}
              >
                {tag}
                <button
                  type="button"
                  className="rounded-full p-0.5 text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => removeTag(tag)}
                  aria-label={`Remover tag ${tag}`}
                >
                  <X className="size-3" aria-hidden />
                </button>
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
