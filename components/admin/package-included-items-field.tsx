"use client";

import { Plus, Trash2 } from "lucide-react";

import { IncludedItemAutocompleteInput } from "@/components/admin/included-item-autocomplete-input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PackageIncludedItemsFieldProps = {
  value: string[];
  onChange: (items: string[]) => void;
  suggestions?: string[];
  error?: string;
  className?: string;
};

export function PackageIncludedItemsField({
  value,
  onChange,
  suggestions = [],
  error,
  className,
}: PackageIncludedItemsFieldProps) {
  function updateItem(index: number, nextValue: string) {
    const nextItems = [...value];
    nextItems[index] = nextValue;
    onChange(nextItems);
  }

  function addItem() {
    onChange([...value, ""]);
  }

  function removeItem(index: number) {
    onChange(value.filter((_, itemIndex) => itemIndex !== index));
  }

  return (
    <fieldset className={cn("space-y-3 rounded-xl border border-border/70 bg-muted/20 p-3", className)}>
      <legend className="px-1 text-sm font-medium text-foreground">Itens inclusos</legend>
      <p className="text-xs text-muted-foreground">
        Checklist exibido apenas na página de pacotes. Adicione os benefícios livremente.
      </p>

      {value.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border/70 bg-background/60 px-3 py-4 text-center text-xs text-muted-foreground">
          Nenhum item adicionado. Use o botão abaixo para incluir benefícios no card.
        </p>
      ) : (
        <ul className="space-y-2">
          {value.map((item, index) => (
            <li key={`included-item-${index}`} className="flex items-start gap-2">
              <IncludedItemAutocompleteInput
                value={item}
                onChange={(nextValue) => updateItem(index, nextValue)}
                suggestions={suggestions}
                placeholder="Ex.: Aéreo ida e volta"
                className="h-10 flex-1 rounded-xl"
                aria-label={`Item incluso ${index + 1}`}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-10 shrink-0 rounded-xl"
                onClick={() => removeItem(index)}
                aria-label={`Remover item ${index + 1}`}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Button
        type="button"
        variant="outline"
        className="h-9 rounded-xl"
        onClick={addItem}
        disabled={value.length >= 12}
      >
        <Plus className="size-4" aria-hidden />
        Adicionar item
      </Button>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </fieldset>
  );
}
